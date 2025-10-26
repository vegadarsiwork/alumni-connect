import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { ToastProvider } from '@/components/ui/toast'
import CommandMenu from '@/components/CommandMenu'
import NotificationBell from '@/components/NotificationBell'
import AuthProvider from "@/components/AuthProvider";
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.email) {
    redirect('/login')
  }

  return (
    <AuthProvider>
      <ToastProvider>
        <div className="min-h-screen bg-background text-foreground animate-in fade-in-50 duration-500">
          <header className="border-b border-border shadow-mono-sharp sticky top-0 z-10 backdrop-blur-sm bg-background/80">
            <div className="container mx-auto flex items-center justify-between px-4 py-3">
              <Link href="/dashboard" className="flex items-center gap-2">
                <img src="/auxilium-logo.svg" alt="Auxilium Logo" className="h-8 w-8" />
                <div>
                  <h1 className="text-2xl font-dotmatrix font-bold tracking-tight">Auxilium</h1>
                  <p className="text-sm font-mono mt-0.5 text-muted-foreground">
                    Welcome {session.user?.name || session.user?.email}
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-2">
                <CommandMenu />
                <NotificationBell />
                <Link href="/" passHref>
                  <Button variant="ghost" className="hidden sm:flex">Dashboard</Button>
                </Link>
                <Link href={session.user?.id ? `/profile/${session.user.id}` : '/profile'} passHref>
                  <Button variant="ghost" className="hidden sm:flex">Profile</Button>
                </Link>
              </div>
            </div>
          </header>
          <main className="container mx-auto px-4 py-6 space-y-6 animate-in slide-in-from-bottom-4 duration-700">
            {children}
          </main>
        </div>
      </ToastProvider>
    </AuthProvider>
  )
}