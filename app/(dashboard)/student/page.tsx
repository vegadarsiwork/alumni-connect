import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CreateAskForm } from './CreateAskForm'
import WelcomeOnboarder from '@/components/WelcomeOnboarder'

export default async function StudentPage() {
  const session = await getServerSession()

  if (!session?.user?.email) {
    redirect('/login')
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    redirect('/login')
  }

  // Role-based access control
  if (user.role !== 'STUDENT') {
    redirect('/')
  }

  // Fetch all asks for this user
  const asks = await prisma.ask.findMany({
    where: { authorId: user.id },
    include: {
      connections: {
        select: {
          id: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Fetch all connections for this student
  const connections = await prisma.connection.findMany({
    where: { studentId: user.id },
    include: {
      offer: true,
      alum: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-8">
      {/* Contextual Onboarding */}
      <WelcomeOnboarder user={user} askCount={asks.length} offerCount={0} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="text-muted-foreground">
            Create asks and get help from alumni
          </p>
        </div>
        <CreateAskForm />
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Your Asks</h2>
        {asks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">
                You haven&apos;t created any asks yet. Click the button above to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {asks.map((ask) => {
              const hasConnections = ask.connections && ask.connections.length > 0
              const pendingCount = ask.connections?.filter(c => c.status === 'PENDING').length || 0
              const acceptedCount = ask.connections?.filter(c => c.status === 'ACCEPTED').length || 0
              
              return (
              <Card key={ask.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle>{ask.title}</CardTitle>
                    {hasConnections && (
                      <div className="flex flex-col gap-1">
                        {pendingCount > 0 && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            {pendingCount} Pending
                          </Badge>
                        )}
                        {acceptedCount > 0 && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {acceptedCount} Active
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <CardDescription>
                    Created <time dateTime={String(ask.createdAt)}>{new Date(String(ask.createdAt)).toISOString().split('T')[0]}</time>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-white">{ask.description}</p>
                  {ask.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {ask.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {ask.githubUrl && (
                    <a
                      href={ask.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block text-sm text-blue-600 hover:underline"
                    >
                      View on GitHub →
                    </a>
                  )}
                </CardContent>
                <div className="p-6 pt-0">
                  <Link href={`/student/ask/${ask.id}`}>
                    <Button className="w-full">
                      {ask.connections && ask.connections.length > 0 
                        ? 'View Requests & Matches →' 
                        : 'View AI Matches →'}
                    </Button>
                  </Link>
                </div>
              </Card>
            )})}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Your Connections</h2>
        {connections.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">
                No connections yet. Request connections from your Ask matches!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {connections.map((connection) => (
              <Card key={connection.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{connection.offer.title}</CardTitle>
                    <Badge
                      variant={
                        connection.status === 'ACCEPTED'
                          ? 'default'
                          : connection.status === 'DENIED'
                          ? 'destructive'
                          : connection.status === 'COMPLETED'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {connection.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    with{' '}
                    <Link href={`/profile/${connection.alum.id}`} className="hover:underline font-semibold">
                      {connection.alum.name}
                    </Link>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white mb-4">{connection.offer.description}</p>
                  {connection.status === 'ACCEPTED' && (
                    <Link href={`/connection/${connection.id}`}>
                      <Button className="w-full">
                        Open Workspace →
                      </Button>
                    </Link>
                  )}
                  {connection.status === 'PENDING' && (
                    <p className="text-sm text-muted-foreground text-center">
                      Waiting for alumni response...
                    </p>
                  )}
                  {connection.status === 'DENIED' && (
                    <p className="text-sm text-destructive text-center">
                      Request was denied
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
