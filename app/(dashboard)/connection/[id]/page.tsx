import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { giveKudos, updateConnectionStatus } from '@/app/actions'
import { auth } from "@/auth";
import { getUserById } from "@/app/actions";
import { ConnectionStatus } from "@prisma/client";
import { updateConnectionWorkspace } from "@/app/actions";

export default async function ConnectionWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
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



  // Await params (Next.js 15 requirement)
  const { id } = await params

  // Fetch the connection
  const connection = await prisma.connection.findUnique({
    where: { id },
    include: {
      ask: true,
      offer: true,
      student: true,
      alum: true,
    },
  })

  if (!connection) {
    redirect('/')
  }

  const isAlum = session?.user?.id === connection.alum.id;
  const isStudent = session?.user?.id === connection.student.id;

  const { zoomLink, alumFeedbackFile, studentUploadFile } = connection;

  // Security: Check that the user is either the student or the alumni
  if (connection.studentId !== user.id && connection.alumId !== user.id) {
    redirect('/')
  }



  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Connection Workspace</h1>
          <p className="text-muted-foreground">
            Private workspace for {connection.student.name} & {connection.alum.name}
          </p>
          {(connection.status === 'ACCEPTED' || connection.status === 'COMPLETED') && (
            <div className="text-sm text-muted-foreground">
              <p>Student: {connection.student.email}</p>
              <p>Alumni: {connection.alum.email}</p>
            </div>
          )}
        </div>
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

      <div className="grid gap-6 md:grid-cols-2">
        {/* Ask Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Student Ask</CardTitle>
            <CardDescription>by {connection.student.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold text-lg mb-2">{connection.ask.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{connection.ask.description}</p>
            {connection.ask.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {connection.ask.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            {connection.ask.githubUrl && (
              <div className="mt-4">
                <a
                  href={connection.ask.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  🔗 GitHub Repository
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Offer Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Alumni Offer</CardTitle>
            <CardDescription>by {connection.alum.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold text-lg mb-2">{connection.offer.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{connection.offer.description}</p>
            {connection.offer.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {connection.offer.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            <div className="mt-4">
              <span className="text-sm font-medium text-gray-900">
                {connection.offer.slots} slot{connection.offer.slots !== 1 ? 's' : ''} available
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dummy Live Chat UI */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Live Chat (Dummy UI)</CardTitle>
          <CardDescription>This is a placeholder for the live chat functionality.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 h-64 overflow-y-auto border p-4 rounded-md bg-gray-50 dark:bg-gray-900">
            <div className="flex justify-start">
              <div className="bg-blue-500 text-white p-2 rounded-lg max-w-[70%]">
                Hi there! How can I help you today?
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-gray-200 text-gray-800 p-2 rounded-lg max-w-[70%]">
                I need some help with my project.
              </div>
            </div>
            <div className="flex justify-start">
              <div className="bg-blue-500 text-white p-2 rounded-lg max-w-[70%]">
                Sure, I can assist with that. What specifically are you working on?
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-gray-200 text-gray-800 p-2 rounded-lg max-w-[70%]">
                It's a Python project using OpenCV and CNN.
              </div>
            </div>
          </div>
          <div className="flex mt-4 space-x-2">
            <Input placeholder="Type your message..." className="flex-1" />
            <Button>Send</Button>
          </div>
        </CardContent>
      </Card>

      {/* Action Section - Only for ACCEPTED connections */}
      {connection.status === 'ACCEPTED' && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Alumni Actions */}
          {isAlum && (
            <Card>
              <CardHeader>
                <CardTitle>Alumni Actions</CardTitle>
                <CardDescription>Share meeting details and resources</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="zoom-link">Meeting Link (Zoom/Google Meet)</Label>
                    <Input
                      id="zoom-link"
                      type="url"
                      placeholder="https://zoom.us/j/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feedback-file">Upload Feedback/Resources</Label>
                    <Input
                      id="feedback-file"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Share Resources
                  </Button>
                </form>
                
                {/* Mark as Complete Button */}
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-muted-foreground mb-3">
                    Finished mentoring? Mark this connection as complete.
                  </p>
                  <form
                    action={async () => {
                      'use server'
                      await updateConnectionStatus(connection.id, 'COMPLETED')
                    }}
                  >
                    <Button 
                      type="submit" 
                      variant="outline" 
                      className="w-full border-green-600 text-green-600 hover:bg-green-50"
                    >
                      ✅ Mark as Complete
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Student Actions */}
          {isStudent && (
            <Card>
              <CardHeader>
                <CardTitle>Student Actions</CardTitle>
                <CardDescription>Upload your materials and documents</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-file">Upload File/Document</Label>
                    <Input
                      id="student-file"
                      type="file"
                      // Removed accept attribute to allow any file type
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="external-link">External Link (Optional)</Label>
                    <Input
                      id="external-link"
                      type="url"
                      placeholder="https://your-link.com"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Submit Materials
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Pending Status Message */}
      {connection.status === 'PENDING' && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">
              {isStudent
                ? 'Your connection request is pending. The alumni will review it soon.'
                : 'You have a pending connection request. Please accept or deny it from your dashboard.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Denied Status Message */}
      {connection.status === 'DENIED' && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-destructive text-center font-medium">
              This connection request was denied.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Completed Status Message */}
      {connection.status === 'COMPLETED' && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <p className="text-green-600 text-center font-medium text-lg">
              This connection has been completed. Great work! 🎉
            </p>
            {isStudent && (
              <div className="mt-4">
                <p className="text-muted-foreground text-sm mb-3 text-center">
                  Did {connection.alum.name} help you? Give them kudos!
                </p>
                <form
                  action={async () => {
                    'use server'
                    await giveKudos(connection.alumId)
                  }}
                >
                  <Button type="submit" size="lg" className="w-full">
                    🏆 Give Kudos to {connection.alum.name}
                  </Button>
                </form>
              </div>
            )}
            {isAlumni && (
              <div className="mt-4 text-center">
                <Link href={`/profile/${connection.studentId}`}>
                  <Button variant="outline">
                    View {connection.student.name}&apos;s Profile
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}