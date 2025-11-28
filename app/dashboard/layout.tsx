import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth/admin'
import { DashboardLayout } from '@/components/dashboard'
import type { WelcomebookSummary } from '@/components/dashboard'
import type { Client } from '@/types'

export default async function DashboardLayoutPage({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()

  // Vérifier si l'utilisateur est connecté
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    redirect('/login')
  }

  // Vérifier si l'utilisateur est admin
  const userIsAdmin = isAdmin(user.email)

  // Récupérer le welcomebook sélectionné (support multi-welcomebook)
  const cookieStore = await cookies()
  const selectedWelcomebookId = cookieStore.get('selectedWelcomebookId')?.value

  // Récupérer tous les welcomebooks de l'utilisateur
  const { data: clientsData, error: clientsError } = await supabase
    .from('clients')
    .select('*')
    .eq('email', user.email)
    .order('created_at', { ascending: false })

  if (clientsError) {
    console.error('[DASHBOARD LAYOUT] Error fetching welcomebooks:', clientsError)
  }

  // Si aucun welcomebook trouvé, rediriger vers onboarding
  if (!clientsData || clientsData.length === 0) {
    redirect('/dashboard/welcome')
  }

  // Cast explicite pour éviter type narrowing issues
  const allClients = clientsData as unknown as Client[]

  // Déterminer le welcomebook actif
  let currentClient: Client

  if (selectedWelcomebookId) {
    const selectedClient = allClients.find(c => c.id === selectedWelcomebookId)
    currentClient = selectedClient ?? allClients[0]
  } else {
    currentClient = allClients[0]
  }

  // Récupérer les stats pour chaque welcomebook (tips count et views)
  const welcomebookSummaries: WelcomebookSummary[] = await Promise.all(
    allClients.map(async (client) => {
      // Compter les tips
      const { count: tipsCount } = await supabase
        .from('tips')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', client.id)

      // Compter les vues
      const { count: viewsCount } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', client.id)
        .eq('event_type', 'view')

      return {
        id: client.id,
        name: client.name,
        slug: client.slug,
        welcomebook_name: client.welcomebook_name,
        totalViews: viewsCount || 0,
        totalTips: tipsCount || 0,
      }
    })
  )

  // Récupérer le count de partages en attente pour le badge
  const { count: pendingSharesCount } = await supabase
    .from('social_post_shares')
    .select('*', { count: 'exact', head: true })
    .eq('user_email', user.email)
    .eq('status', 'pending')

  return (
    <DashboardLayout
      client={currentClient}
      allWelcomebooks={welcomebookSummaries}
      isAdmin={userIsAdmin}
      pendingSharesCount={pendingSharesCount || 0}
    >
      {children}
    </DashboardLayout>
  )
}
