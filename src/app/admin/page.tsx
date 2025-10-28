import AdminDashboard from '@/components/AdminDashboard'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

/**
 * Admin page to view users and manage the application
 * RESTRICTED: Only accessible by admin (bhatiav0909@gmail.com)
 */
export default async function AdminPage() {
  const session = await auth()
  
  // Restrict access to admin only
  const ADMIN_EMAIL = 'bhatiav0909@gmail.com'
  if (!session || session.user?.email !== ADMIN_EMAIL) {
    redirect('/')
  }
  
  return <AdminDashboard />
}
