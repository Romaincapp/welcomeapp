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
  const { data: clientData } = await supabase
    .from('clients')
    .select('*')
    .eq('email', user.email)
    .single()

  // Si pas de welcomebook, rediriger vers la page de setup
  if (!clientData) {
    redirect('/dashboard/setup')
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

  const stats = {
    totalTips: tips?.length || 0,
    totalMedia: media?.length || 0,
    totalCategories: new Set(tips?.map((t: any) => t.category_id).filter(Boolean)).size,
  }

  return <DashboardClient client={{ ...client, subdomain: null }} user={user} stats={stats} />
}
