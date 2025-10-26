import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import EditProfileForm from '@/components/EditProfileForm'
import SkillsDonutChart from '@/components/SkillsDonutChart'

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: profileUserId } = await params
  const session = await getServerSession()

  if (!session?.user?.email) {
    redirect('/login')
  }

  // Get current user to check if they own this profile
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  })

  // Fetch the profile user
  const user = await prisma.user.findUnique({
    where: { id: profileUserId },
    include: {
      _count: {
        select: {
          asks: true, // If student
          offers: true, // If alumni
          connectionsAsStudent: true,
          connectionsAsAlum: true
        }
      }
    }
  })

  if (!user) {
    redirect('/')
  }

  // Calculate total connections
  const totalConnections = (user._count.connectionsAsStudent || 0) + (user._count.connectionsAsAlum || 0)

  // Fetch the user's completed connections
  const completedConnections = await prisma.connection.findMany({
    where: {
      status: 'COMPLETED',
      OR: [{ studentId: profileUserId }, { alumId: profileUserId }]
    },
    include: { ask: { select: { tags: true } } }
  })

  // Aggregate skills data for chart
  const tagsCount: Record<string, number> = {}
  completedConnections.forEach(connection => {
    connection.ask.tags.forEach(tag => {
      tagsCount[tag] = (tagsCount[tag] || 0) + 1
    })
  })

  const skillsChartData = Object.entries(tagsCount).map(([name, count]) => ({
    name,
    count
  }))

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Avatar className="h-24 w-24">
          {user.image ? (
            <AvatarImage src={user.image} alt={user.name || 'User'} />
          ) : (
            <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <h1 className="text-3xl font-bold">{user.name}</h1>
            
            {/* Availability Badge */}
            <Badge 
              variant={user.availability === "AVAILABLE" ? "default" : "destructive"}
              className="w-fit"
            >
              {user.availability === "AVAILABLE" ? "AVAILABLE" : "BUSY"}
            </Badge>
            
            {/* Top Mentor Badge */}
            {user.role === Role.ALUMNI && user.kudos > 10 && (
              <Badge variant="destructive">🏆 Top Mentor</Badge>
            )}
          </div>
          
          {user.headline && (
            <p className="text-lg text-muted-foreground">{user.headline}</p>
          )}
          
          {user.education && (
            <p className="text-muted-foreground">🎓 {user.education}</p>
          )}
          
          {/* Edit Profile Button - only shown to profile owner */}
          {currentUser?.id === user.id && (
            <div className="mt-4">
              <EditProfileForm user={user} />
            </div>
          )}
        </div>
      </div>
      
      {/* Impact Card */}
      <Card>
        <CardHeader>
          <CardTitle>Impact</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
            <span className="text-2xl font-bold">🏆 {user.kudos || 0}</span>
            <span className="text-sm text-muted-foreground">Kudos</span>
          </div>
          
          <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
            <span className="text-2xl font-bold">✅ {totalConnections}</span>
            <span className="text-sm text-muted-foreground">Connections Completed</span>
          </div>
          
          <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
            <span className="text-2xl font-bold">🚀 {user.role === Role.STUDENT ? user._count.asks : user._count.offers}</span>
            <span className="text-sm text-muted-foreground">{user.role === Role.STUDENT ? 'Asks' : 'Offers'} Posted</span>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills Cloud Card */}
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.skills && user.skills.length > 0 ? (
                user.skills.map((skill, index) => (
                  <Badge key={index} variant="outline">{skill}</Badge>
                ))
              ) : (
                <p className="text-muted-foreground">No skills listed yet</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Activity Chart Card */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Focus</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {skillsChartData.length > 0 ? (
              <SkillsDonutChart data={skillsChartData} />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">No activity data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Separator />
      
      {/* Recent Activity Section - Optional */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Recent Activity</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-center">Recent activity will appear here</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
