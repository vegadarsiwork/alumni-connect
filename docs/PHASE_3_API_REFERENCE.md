# Phase 3 API Reference

## Match API Endpoint

### GET `/api/match/[askId]`

**Description:** Returns AI-powered matches for a specific Ask.

**Authentication:** Required (session-based)

**Parameters:**
- `askId` (URL parameter): The ID of the Ask to find matches for

**Response Format:**
```typescript
[
  {
    id: string;
    title: string;
    description: string;
    tags: string[];
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
    author: {
      id: string;
      name: string;
      email: string;
    };
    matchReason: string; // AI-generated reason
  }
]
```

**Example Response:**
```json
[
  {
    "id": "offer-123",
    "title": "Machine Learning Mentorship",
    "description": "I can help with ML projects, neural networks, and Python",
    "tags": ["AI/ML", "Python", "TensorFlow"],
    "author": {
      "id": "alumni-456",
      "name": "Dr. Jane Smith",
      "email": "jane@example.com"
    },
    "matchReason": "Your computer vision project aligns perfectly with this mentor's expertise in neural networks and Python."
  }
]
```

**Error Responses:**
- `401 Unauthorized`: No valid session
- `404 Not Found`: Ask doesn't exist
- `500 Internal Server Error`: AI/database error

---

## Route Structure

### Student Routes
- `/student` - Student dashboard (list of asks)
- `/student/ask/[id]` - View specific Ask with AI matches (NEW in Phase 3)

### Alumni Routes
- `/alumni` - Alumni dashboard (list of offers)

### Admin Routes
- `/admin` - Admin dashboard with analytics (NEW in Phase 3)

---

## Component Props

### `<MatchList askId={string} />`
Client component that fetches and displays AI matches.

**Props:**
- `askId: string` - The Ask ID to fetch matches for

**States:**
- Loading: Shows spinner
- Error: Shows error message
- Empty: Shows "No matches found"
- Success: Shows grid of match cards

---

### `<OpportunityGapChart data={ChartData[]} />`
Client component that renders the admin analytics chart.

**Props:**
```typescript
data: Array<{
  name: string;      // Tag name
  asks: number;      // Number of asks with this tag
  offers: number;    // Number of offers with this tag
}>
```

---

## AI Prompt Engineering

The AI matching prompt includes:

1. **Ask Context:**
   - Title
   - Description
   - Tags
   - GitHub README content (if available)

2. **Available Offers:**
   - Full JSON of all offers
   - Including tags, descriptions, and author info

3. **Matching Criteria:**
   - Tag overlap
   - Description relevance
   - Project context alignment

4. **Output Format:**
   - Top 3 matches
   - Each with `matchReason` field
   - Pure JSON (no markdown)

---

## Database Queries

### Match API
```typescript
// Get Ask
const ask = await prisma.ask.findUnique({
  where: { id: askId },
  include: { author: true }
});

// Get all Offers
const offers = await prisma.offer.findMany({
  include: { author: true }
});
```

### Admin Dashboard
```typescript
// Get all Asks (tags only)
const allAsks = await prisma.ask.findMany({
  select: { id: true, tags: true }
});

// Get all Offers (tags only)
const allOffers = await prisma.offer.findMany({
  select: { id: true, tags: true }
});
```

---

## Security Checklist

✅ **Match API:**
- Session validation
- Ask existence check
- Error handling

✅ **View Ask Page:**
- Session validation
- Author authorization check
- Redirect on unauthorized access

✅ **Admin Dashboard:**
- Session validation
- Role-based access control (ADMIN only)
- Redirect non-admins to home

---

## Performance Optimizations

1. **GitHub Scraper:**
   - Limits README to 2000 chars
   - Continues on fetch failure (graceful degradation)

2. **Match API:**
   - Returns max 3 matches (reduces payload)
   - Fallback to tag matching if AI fails

3. **Admin Dashboard:**
   - Selects only necessary fields (tags)
   - Sorts and limits to top 10 tags
   - Server-side aggregation

---

## Testing Examples

### Test Match API with curl:
```bash
curl http://localhost:3000/api/match/[askId] \
  -H "Cookie: session=your-session-token"
```

### Test Admin Access:
1. Log in as ADMIN role user
2. Navigate to `/admin`
3. Verify dashboard loads
4. Log out and try again (should redirect)

### Test Student Flow:
1. Log in as STUDENT
2. Create an Ask with GitHub URL
3. Navigate to the Ask page
4. Wait for AI matches to load
5. Verify match reasons are displayed

---

## Troubleshooting

### "Could not load matches"
- Check GEMINI_API_KEY is set in .env.local
- Verify API key is valid
- Check network connectivity
- Review server logs for AI errors

### No matches showing
- Ensure Offers exist in database
- Check if tags overlap between Ask and Offers
- Verify AI response parsing is working

### Admin page redirects
- Verify user role is ADMIN
- Check session is valid
- Review auth logic in lib/auth.ts

### Chart not rendering
- Verify chartData has items
- Check browser console for errors
- Ensure recharts is installed

---

## Future Enhancements (Ideas)

- Cache AI match results (reduce API calls)
- Add match score/confidence level
- Allow filtering matches by specific criteria
- Add export functionality for admin data
- Real-time updates when new Offers added
- Email notifications for new matches
- Match history tracking

---

## Credits

**Phase 3 Technologies:**
- Next.js 15 (App Router)
- Google Gemini AI (gemini-pro model)
- Cheerio (GitHub scraping)
- Recharts (Data visualization)
- shadcn/ui (UI components)
- Prisma (Database ORM)
