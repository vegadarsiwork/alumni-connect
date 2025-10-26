import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CreateOfferForm } from './CreateOfferForm'
import { updateConnectionStatus } from '@/app/actions'
import WelcomeOnboarder from '@/components/WelcomeOnboarder'

export default async function AlumniPage() {
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
  if (user.role !== 'ALUMNI') {
    redirect('/')
  }

  // Fetch all offers for this user
  const offers = await prisma.offer.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  // Fetch pending connection requests for this alumni
  const pendingRequests = await prisma.connection.findMany({
    where: {
      alumId: user.id,
      status: 'PENDING',
    },
    include: {
      ask: true,
      student: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // Fetch accepted connections for this alumni
  const acceptedConnections = await prisma.connection.findMany({
    where: {
      alumId: user.id,
      status: 'ACCEPTED',
    },
    include: {
      ask: true,
      student: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // Fetch completed connections for this alumni
  const completedConnections = await prisma.connection.findMany({
    where: {
      alumId: user.id,
      status: 'COMPLETED',
    },
    include: {
      ask: true,
      student: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-8">
      {/* Contextual Onboarding */}
      <WelcomeOnboarder user={user} askCount={0} offerCount={offers.length} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alumni Dashboard</h1>
          <p className="text-muted-foreground">
            Create offers and help students succeed
          </p>
        </div>
        <CreateOfferForm />
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Your Offers</h2>
        {offers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">
                You haven&apos;t created any offers yet. Click the button above to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => (
              <Card key={offer.id}>
                <CardHeader>
                  <CardTitle>{offer.title}</CardTitle>
                  <CardDescription>
                    Created <time dateTime={String(offer.createdAt)}>{new Date(String(offer.createdAt)).toISOString().split('T')[0]}</time>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white">{offer.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {offer.slots} of {offer.totalSlots} slots available this month
                    </span>
                  </div>
                  {offer.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {offer.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Active Connections</h2>
        {acceptedConnections.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">
                No active connections yet. Accept pending requests to start collaborating!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {acceptedConnections.map((connection) => (
              <Card key={connection.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{connection.ask.title}</CardTitle>
                    <Badge variant="default" className="ml-2">Active</Badge>
                  </div>
                  <CardDescription>
                    with{' '}
                    <Link href={`/profile/${connection.student.id}`} className="hover:underline font-semibold">
                      {connection.student.name}
                    </Link>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white mb-4">{connection.ask.description}</p>
                  <Link href={`/connection/${connection.id}`}>
                    <Button className="w-full">
                      Open Workspace →
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Pending Requests</h2>
        {pendingRequests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">
                No pending connection requests at this time.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{request.ask.title}</CardTitle>
                  <CardDescription>
                    from{' '}
                    <Link href={`/profile/${request.student.id}`} className="hover:underline font-semibold">
                      {request.student.name}
                    </Link>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white mb-4">{request.ask.description}</p>
                  {request.ask.tags.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {request.ask.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <form
                      action={async () => {
                        'use server'
                        await updateConnectionStatus(request.id, 'ACCEPTED')
                      }}
                      className="flex-1"
                    >
                      <Button type="submit" className="w-full" variant="default">
                        Accept
                      </Button>
                    </form>
                    <form
                      action={async () => {
                        'use server'
                        await updateConnectionStatus(request.id, 'DENIED')
                      }}
                      className="flex-1"
                    >
                      <Button type="submit" className="w-full" variant="destructive">
                        Deny
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Completed Connections</h2>
        {completedConnections.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">
                No completed connections yet. Keep mentoring!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedConnections.map((connection) => (
              <Card key={connection.id} className="border-green-200 bg-green-50/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{connection.ask.title}</CardTitle>
                    <Badge variant="secondary" className="ml-2 bg-green-600 text-white">
                      Completed
                    </Badge>
                  </div>
                  <CardDescription>
                    with{' '}
                    <Link href={`/profile/${connection.student.id}`} className="hover:underline font-semibold">
                      {connection.student.name}
                    </Link>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white mb-4">{connection.ask.description}</p>
                  <Link href={`/connection/${connection.id}`}>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
