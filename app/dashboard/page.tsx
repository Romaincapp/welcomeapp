import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'
import { Client } from '@/types'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  // Vérifier si l'utilisateur est connecté
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    redirect('/login')
  }

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
    .select('id, category_id, title_en, title_es, title_nl, title_de, title_it, title_pt, comment_en, comment_es, comment_nl, comment_de, comment_it, comment_pt')
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

  // Compter les tips qui ont au moins une traduction
  const tipsWithTranslations = tips?.filter((t: any) => {
    return !!(
      t.title_en || t.title_es || t.title_nl || t.title_de || t.title_it || t.title_pt ||
      t.comment_en || t.comment_es || t.comment_nl || t.comment_de || t.comment_it || t.comment_pt
    )
  }).length || 0

  const stats = {
    totalTips: tips?.length || 0,
    totalMedia: media?.length || 0,
    totalCategories: new Set(tips?.map((t: any) => t.category_id).filter(Boolean)).size,
    hasSecureSection: !!secureSection,
    tipsWithTranslations
  }

  return <DashboardClient client={{ ...client, subdomain: null }} user={user} stats={stats} />
}
