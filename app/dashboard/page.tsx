import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  // Vérifier si l'utilisateur est connecté
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Récupérer le welcomebook de l'utilisateur
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Si pas de welcomebook, rediriger vers la page de setup
  if (!client) {
    redirect('/dashboard/setup')
  }

  // Récupérer les statistiques
  const { data: tips } = await supabase
    .from('tips')
    .select('id, category_id')
    .eq('client_id', client.id)

  const { data: media } = await supabase
    .from('tip_media')
    .select('id')
    .in(
      'tip_id',
      tips?.map((t) => t.id) || []
    )

  const stats = {
    totalTips: tips?.length || 0,
    totalMedia: media?.length || 0,
    totalCategories: new Set(tips?.map((t) => t.category_id).filter(Boolean)).size,
  }

  return <DashboardClient client={client} user={user} stats={stats} />
}
