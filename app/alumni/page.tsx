import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default async function AlumniDashboard() {
  const session = await getSession()
  
  if (!session || session.role !== 'ALUMNI') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome, {session.email}!
        </h1>
        <p className="text-xl text-gray-600 mb-8">Alumni Dashboard</p>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">🎯 Phase 1 Complete!</h2>
          <p className="text-gray-700">Authentication is working. Next up: Building the Ask/Offer features...</p>
        </div>
      </div>
    </div>
  )
}
