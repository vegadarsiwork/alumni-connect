import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateOfferForm } from './CreateOfferForm'

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

  return (
    <div className="space-y-8">
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
                    Created {new Date(offer.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{offer.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {offer.slots} slot{offer.slots !== 1 ? 's' : ''} available
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
    </div>
  )
}
