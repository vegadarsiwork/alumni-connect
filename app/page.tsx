import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default async function Home() {
  const session = await getSession()
  
  // Redirect based on role or to login
  if (session) {
    if (session.role === 'STUDENT') {
      redirect('/student')
    } else if (session.role === 'ALUMNI') {
      redirect('/alumni')
    } else if (session.role === 'ADMIN') {
      redirect('/admin')
    }
  }
  
  redirect('/login')
}
