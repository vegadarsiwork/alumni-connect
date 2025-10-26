import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function GET(
  request: NextRequest,
  { params }: { params: { askId: string } }
) {
  try {
    // Get the session
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { askId } = params;

    // Fetch the Ask from Prisma
    const ask = await prisma.ask.findUnique({
      where: { id: askId },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!ask) {
      return NextResponse.json(
        { error: 'Ask not found' },
        { status: 404 }
      );
    }

    // Fetch all Offers from Prisma
    const offers = await prisma.offer.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (offers.length === 0) {
      return NextResponse.json([]);
    }

    // GitHub Scraper
    let readmeContext = '';
    if (ask.githubUrl) {
      try {
        const githubResponse = await fetch(ask.githubUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0',
          },
        });
        
        if (githubResponse.ok) {
          const html = await githubResponse.text();
          const $ = cheerio.load(html);
          
          // Try to get README content from GitHub's article tag
          const articleContent = $('article').text().trim();
          if (articleContent) {
            readmeContext = articleContent.substring(0, 2000); // Limit to 2000 chars
          }
        }
      } catch (fetchError) {
        console.error('Error fetching GitHub README:', fetchError);
        // Continue without README context
      }
    }

    // LLM Prompt
    const prompt = `You are an AI matchmaker for a university alumni-student platform.

**Student Ask:**
- Title: ${ask.title}
- Description: ${ask.description}
- Tags: ${ask.tags.join(', ')}
${readmeContext ? `- GitHub Project Context: ${readmeContext}` : ''}

**Available Alumni Offers:**
${JSON.stringify(offers, null, 2)}

**Task:**
Analyze the student's Ask and find the top 3 most relevant Alumni Offers. Consider:
1. Tag overlap (expertise matching)
2. Description relevance
3. Project context alignment (if available)

**Output Format:**
Return ONLY a valid JSON array of the top 3 matches. Each match must include:
- All original Offer object fields
- A new "matchReason" field with a single compelling sentence explaining why this is a good match

Example format:
[
  {
    "id": "offer-id",
    "title": "offer title",
    "description": "offer description",
    "tags": ["tag1", "tag2"],
    "author": { "id": "...", "name": "...", "email": "..." },
    "matchReason": "Your AI/ML project aligns perfectly with this mentor's expertise in neural networks and Python."
  }
]

Return ONLY the JSON array, no additional text or markdown formatting.`;

    // AI Call
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response from the AI
    let matches;
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        matches = JSON.parse(jsonMatch[0]);
      } else {
        matches = JSON.parse(text);
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('AI response text:', text);
      
      // Fallback: return top 3 offers based on tag overlap
      matches = offers
        .map((offer: any) => {
          const commonTags = offer.tags.filter((tag: string) => ask.tags.includes(tag));
          return {
            ...offer,
            matchReason: `Shares ${commonTags.length} common tag${commonTags.length !== 1 ? 's' : ''}: ${commonTags.join(', ') || 'general expertise'}`,
            score: commonTags.length,
          };
        })
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 3)
        .map(({ score, ...match }: any) => match);
    }

    // Ensure we return at most 3 matches
    const topMatches = Array.isArray(matches) ? matches.slice(0, 3) : [];

    return NextResponse.json(topMatches);
  } catch (error) {
    console.error('Error in match API:', error);
    return NextResponse.json(
      { error: 'Failed to generate matches' },
      { status: 500 }
    );
  }
}
