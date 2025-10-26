import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import MatchList from '@/components/MatchList';

export default async function ViewAskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    redirect('/login');
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect('/login');
  }

  // Await params for Next.js 15+ compatibility
  const { id: askId } = await params;

  // Fetch the specific Ask
  const ask = await prisma.ask.findUnique({
    where: { id: askId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      connections: {
        include: {
          alum: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          offer: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  // If the ask doesn't exist or the user is not the author, redirect
  if (!ask || ask.authorId !== user.id) {
    redirect('/student');
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{ask.title}</CardTitle>
              <CardDescription className="text-base">
                Posted by {ask.author.name}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Description</h3>
            <p className="text-base leading-relaxed">{ask.description}</p>
          </div>

          {ask.githubUrl && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">GitHub Project</h3>
              <a
                href={ask.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {ask.githubUrl}
              </a>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {ask.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Created: {new Date(ask.createdAt).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Show Connection Requests if any exist */}
      {ask.connections && ask.connections.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Your Connection Requests</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ask.connections.map((connection) => (
              <Card key={connection.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{connection.offer.title}</CardTitle>
                    {connection.status === 'PENDING' && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Pending
                      </Badge>
                    )}
                    {connection.status === 'ACCEPTED' && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Accepted
                      </Badge>
                    )}
                    {connection.status === 'DENIED' && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Declined
                      </Badge>
                    )}
                    {connection.status === 'COMPLETED' && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Completed
                      </Badge>
                    )}
                  </div>
                  <CardDescription>With {connection.alum.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Requested {new Date(connection.createdAt).toLocaleDateString()}
                    </p>
                    {connection.status === 'ACCEPTED' && (
                      <Link href={`/connection/${connection.id}`}>
                        <Button className="w-full">Open Workspace</Button>
                      </Link>
                    )}
                    {connection.status === 'PENDING' && (
                      <p className="text-sm text-center text-muted-foreground py-2">
                        Waiting for alumni response...
                      </p>
                    )}
                    {connection.status === 'COMPLETED' && (
                      <Link href={`/connection/${connection.id}`}>
                        <Button variant="outline" className="w-full">View Completed Connection</Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Separator className="my-8" />
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mt-6 mb-4">
          {ask.connections && ask.connections.length > 0 
            ? 'Discover More Matches' 
            : 'AI-Powered Matches'}
        </h2>
        <p className="text-muted-foreground mb-4">
          {ask.connections && ask.connections.length > 0
            ? 'Find additional alumni who can help with your project'
            : 'Top alumni matches based on your ask'}
        </p>
        <MatchList askId={ask.id} />
      </div>
    </div>
  );
}
