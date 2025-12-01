import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'
import { Client } from '@/types'
import { getManagerAnalyticsSummary } from '@/lib/actions/manager-analytics'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  // Vérifier si l'utilisateur est connecté
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    redirect('/login')
  }

  // Récupérer le welcomebook sélectionné (support multi-welcomebook)
  const cookieStore = await cookies()
  const selectedWelcomebookId = cookieStore.get('selectedWelcomebookId')?.value

  let client: Client | null = null

  if (selectedWelcomebookId) {
    const { data: selectedClient } = await supabase
      .from('clients')
      .select('*')
      .eq('id', selectedWelcomebookId)
      .eq('email', user.email)
      .maybeSingle()

    if (selectedClient) {
      client = selectedClient as Client
    }
  }

  // Si pas de sélection ou welcomebook sélectionné introuvable, prendre le plus récent
  if (!client) {
    const { data: clientsData } = await supabase
      .from('clients')
      .select('*')
      .eq('email', user.email)
      .order('created_at', { ascending: false })
      .limit(1)

    if (clientsData && clientsData.length > 0) {
      client = clientsData[0] as Client
    }
  }

  // Si aucun welcomebook trouvé, rediriger vers onboarding
  if (!client) {
    redirect('/dashboard/welcome')
  }

  // Récupérer les statistiques
  const { data: tips } = await supabase
    .from('tips')
    .select('id, category_id')
    .eq('client_id', client.id)

  const tipIds = tips?.map((t: { id: string }) => t.id) || []

  const { data: media } = await supabase
    .from('tip_media')
    .select('id')
    .in('tip_id', tipIds.length > 0 ? tipIds : [''])

  // Vérifier si la section sécurisée existe
  const { data: secureSection } = await supabase
    .from('secure_sections')
    .select('id')
    .eq('client_id', client.id)
    .maybeSingle()

  // Récupérer les analytics visiteurs
  const analyticsResult = await getManagerAnalyticsSummary(client.id)
  const analytics = analyticsResult.success && analyticsResult.data
    ? analyticsResult.data
    : {
        views: 0,
        clicks: 0,
        shares: 0,
        pwa_installs: 0,
        views_7d: 0,
        clicks_7d: 0,
        engagement_rate: 0,
      }

  const stats = {
    totalTips: tips?.length || 0,
    totalMedia: media?.length || 0,
    totalCategories: new Set(tips?.map((t: { category_id: string | null }) => t.category_id).filter(Boolean)).size,
    hasSecureSection: !!secureSection,
    analytics,
  }

  return (
    <DashboardClient
      client={{ ...client, subdomain: null }}
      user={user}
      stats={stats}
    />
  )
}
