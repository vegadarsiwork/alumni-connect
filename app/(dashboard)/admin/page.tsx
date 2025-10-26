import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import OpportunityGapChart from '@/components/OpportunityGapChart';

export default async function AdminDashboard() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect('/login');
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  // Security: Check if user is admin
  if (!user || user.role !== Role.ADMIN) {
    redirect('/');
  }

  // Data Fetching
  const allAsks = await prisma.ask.findMany({
    select: {
      id: true,
      tags: true,
    },
  });

  const allOffers = await prisma.offer.findMany({
    select: {
      id: true,
      tags: true,
    },
  });

  // Data Aggregation Logic
  const tagCounts = new Map<string, { asks: number; offers: number }>();

  // Count asks by tag
  allAsks.forEach((ask) => {
    ask.tags.forEach((tag: string) => {
      if (!tagCounts.has(tag)) {
        tagCounts.set(tag, { asks: 0, offers: 0 });
      }
      const counts = tagCounts.get(tag)!;
      counts.asks += 1;
    });
  });

  // Count offers by tag
  allOffers.forEach((offer) => {
    offer.tags.forEach((tag: string) => {
      if (!tagCounts.has(tag)) {
        tagCounts.set(tag, { asks: 0, offers: 0 });
      }
      const counts = tagCounts.get(tag)!;
      counts.offers += 1;
    });
  });

  // Convert Map to array for the chart
  const chartData = Array.from(tagCounts.entries())
    .map(([name, counts]) => ({
      name,
      asks: counts.asks,
      offers: counts.offers,
    }))
    .sort((a, b) => (b.asks + b.offers) - (a.asks + a.offers)) // Sort by total activity
    .slice(0, 10); // Top 10 tags

  // Calculate summary stats
  const totalAsks = allAsks.length;
  const totalOffers = allOffers.length;
  const totalTags = tagCounts.size;

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Asks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalAsks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Student requests for mentorship
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Offers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalOffers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Alumni mentorship opportunities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTags}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unique skill categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Opportunity Gap Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Opportunity Gap Analysis</CardTitle>
          <CardDescription>
            Compare student demand (Asks) vs. alumni supply (Offers) across top skill categories
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {chartData.length > 0 ? (
            <OpportunityGapChart data={chartData} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No data available yet. Waiting for asks and offers to be created.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
