import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateAskForm } from './CreateAskForm'

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
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-8">
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
            {asks.map((ask) => (
              <Card key={ask.id}>
                <CardHeader>
                  <CardTitle>{ask.title}</CardTitle>
                  <CardDescription>
                    Created <time dateTime={String(ask.createdAt)}>{new Date(String(ask.createdAt)).toISOString().split('T')[0]}</time>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{ask.description}</p>
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
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
