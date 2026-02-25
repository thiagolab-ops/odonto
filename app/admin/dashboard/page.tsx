import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import AdminDashboard from './_components/admin-dashboard'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || (session.user as any)?.role !== 'admin') {
    redirect('/admin/login')
  }

  return <AdminDashboard />
}
