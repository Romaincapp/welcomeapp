import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AdminLayout } from '@/components/admin'

export default async function AdminLayoutPage({
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

  // Récupérer le nombre de partages en attente pour le badge
  const supabase = await createServerSupabaseClient()
  const { count: pendingCreditsCount } = await supabase
    .from('social_post_shares')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  return (
    <AdminLayout
      adminEmail={adminUser.email || ''}
      pendingCreditsCount={pendingCreditsCount || 0}
    >
      {children}
    </AdminLayout>
  )
}
