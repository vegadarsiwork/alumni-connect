import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export default async function HistoryPage() {
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

  // Fetch completed connections for this user
  const completedConnections = await prisma.connection.findMany({
    where: {
      OR: [
        { studentId: user.id },
        { alumId: user.id }
      ],
      status: 'COMPLETED'
    },
    include: {
      ask: true,
      offer: true,
      student: true,
      alum: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Connection History</h1>
          <p className="text-muted-foreground">
            View your completed connections and their details
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Completed Connections</h2>
        
        {completedConnections.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">
                No completed connections yet. Start connecting with others!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedConnections.map((connection) => (
              <Card key={connection.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      {user.role === 'STUDENT' 
                        ? `Mentored by ${connection.alum.name}` 
                        : `Mentored ${connection.student.name}`}
                    </CardTitle>
                    <Badge>Completed</Badge>
                  </div>
                  <CardDescription>
                    {new Date(connection.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Ask</h3>
                      <p className="text-sm text-muted-foreground">{connection.ask.title}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {connection.ask.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium">Offer</h3>
                      <p className="text-sm text-muted-foreground">{connection.offer.title}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {connection.offer.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button asChild size="sm" className="w-full mt-2">
                      <Link href={`/connection/${connection.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}