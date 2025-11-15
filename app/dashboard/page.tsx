import { redirect } from 'next/navigation'
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

  // Récupérer le welcomebook de l'utilisateur
  const { data: clientData, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('email', user.email)
    .maybeSingle()

  console.log('[DASHBOARD] clientData:', clientData, 'error:', clientError)

  // Si pas de welcomebook, rediriger vers la page d'onboarding
  if (!clientData) {
    console.log('[DASHBOARD] Pas de client - Redirect vers /dashboard/welcome')
    redirect('/dashboard/welcome')
  }

  const client: Client = clientData as Client

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
