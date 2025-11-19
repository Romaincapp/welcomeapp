import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'
import { Client } from '@/types'
import { isAdmin } from '@/lib/auth/admin'
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

  // Vérifier si l'utilisateur est admin
  const userIsAdmin = isAdmin(user.email)

  // Récupérer le welcomebook sélectionné (support multi-welcomebook)
  const cookieStore = await cookies()
  const selectedWelcomebookId = cookieStore.get('selectedWelcomebookId')?.value

  let client: Client | null = null

  if (selectedWelcomebookId) {
    // L'utilisateur a explicitement sélectionné un welcomebook via le switcher
    console.log('[DASHBOARD] Selected welcomebook ID from cookie:', selectedWelcomebookId)

    const { data: selectedClient, error: selectedError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', selectedWelcomebookId)
      .eq('email', user.email) // Ownership check
      .maybeSingle()

    if (selectedError) {
      console.error('[DASHBOARD] Error fetching selected welcomebook:', selectedError)
    }

    if (selectedClient) {
      client = selectedClient as Client
      console.log('[DASHBOARD] Loaded selected welcomebook:', client.slug)
    } else {
      console.log('[DASHBOARD] Selected welcomebook not found or not owned, falling back to newest')
    }
  }

  // Si pas de sélection ou welcomebook sélectionné introuvable, prendre le plus récent
  if (!client) {
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .eq('email', user.email)
      .order('created_at', { ascending: false })
      .limit(1)

    console.log('[DASHBOARD] Fetching newest welcomebook - data:', clientsData, 'error:', clientsError)

    if (clientsData && clientsData.length > 0) {
      client = clientsData[0] as Client
      console.log('[DASHBOARD] Loaded newest welcomebook:', client.slug)
    }
  }

  // Si aucun welcomebook trouvé, rediriger vers onboarding
  if (!client) {
    console.log('[DASHBOARD] No welcomebook found - Redirect to /dashboard/welcome')
    redirect('/dashboard/welcome')
  }

  // Récupérer les statistiques
  const { data: tips } = await supabase
    .from('tips')
    .select('id, category_id')
    .eq('client_id', client.id)

  const tipIds = tips?.map((t: any) => t.id) || []

  const { data: media } = await supabase
    .from('tip_media')
    .select('id')
    .in('tip_id', tipIds)

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
    totalCategories: new Set(tips?.map((t: any) => t.category_id).filter(Boolean)).size,
    hasSecureSection: !!secureSection,
    analytics,
  }

  return <DashboardClient client={{ ...client, subdomain: null }} user={user} stats={stats} isAdmin={userIsAdmin} />
}
