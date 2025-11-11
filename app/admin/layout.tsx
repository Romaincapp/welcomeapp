import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth/admin'
import AdminHeader from './AdminHeader'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Vérifier que l'utilisateur est admin
  const adminUser = await getAdminUser()

  if (!adminUser) {
    // Pas admin → Rediriger vers dashboard normal
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Admin */}
      <AdminHeader adminEmail={adminUser.email || ''} />

      {/* Contenu */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
