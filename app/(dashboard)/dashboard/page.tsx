import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

export default async function DashboardPage() {
  const session = await getServerSession()

  if (!session?.user?.email) {
    redirect('/login')
  }

  // Get user from database to check their role
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  })

  if (!user) {
    redirect('/login')
  }

  // Redirect based on role
  if (user.role === Role.STUDENT) {
    redirect('/student')
  } else if (user.role === Role.ALUMNI) {
    redirect('/alumni')
  } else if (user.role === Role.ADMIN) {
    redirect('/admin')
  }

  // Fallback
  redirect('/login')
}
