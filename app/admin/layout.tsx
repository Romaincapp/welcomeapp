import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth/admin'
import Link from 'next/link'

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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo + Titre */}
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="flex items-center space-x-2">
                <span className="text-2xl">🛡️</span>
                <h1 className="text-xl font-bold text-gray-900">
                  WelcomeApp <span className="text-blue-600">Admin</span>
                </h1>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/admin"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Vue d&apos;ensemble
              </Link>
              <Link
                href="/admin/managers"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Gestionnaires
              </Link>
              <Link
                href="/admin/analytics"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Analytics
              </Link>
            </nav>

            {/* User info */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{adminUser.email}</span>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                  Modérateur
                </span>
              </div>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Retour au dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
