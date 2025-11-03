import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import AnalyticsClient from './AnalyticsClient'
import { Client } from '@/types'

export default async function AnalyticsPage() {
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

  if (!clientData) {
    redirect('/dashboard/welcome')
  }

  const client: Client = clientData as Client

  // Récupérer tous les tips avec timestamps et ratings
  const { data: tips } = await supabase
    .from('tips')
    .select('id, created_at, updated_at, category_id, rating, user_ratings_total, title')
    .eq('client_id', client.id)
    .order('created_at', { ascending: true })

  // Récupérer les catégories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, icon')
    .order('order', { ascending: true })

  // Récupérer les médias
  const tipIds = tips?.map((t) => t.id) || []
  const { data: media } = await supabase
    .from('tip_media')
    .select('id, tip_id')
    .in('tip_id', tipIds)

  // Calculer les statistiques
  const totalTips = tips?.length || 0
  const totalCategories = new Set(tips?.map((t) => t.category_id).filter(Boolean)).size
  const totalMedia = media?.length || 0

  // Calculer le rating moyen (seulement pour les tips avec rating)
  const tipsWithRating = tips?.filter((t) => t.rating && t.rating > 0) || []
  const averageRating = tipsWithRating.length > 0
    ? tipsWithRating.reduce((sum, t) => sum + (t.rating || 0), 0) / tipsWithRating.length
    : 0

  // Calculer les tips créés ce mois
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const tipsThisMonth = tips?.filter((t) => {
    if (!t.created_at) return false
    const createdAt = new Date(t.created_at)
    return createdAt >= startOfMonth
  }).length || 0

  // Grouper les tips par catégorie
  const tipsByCategory = categories?.map((cat) => ({
    categoryId: cat.id,
    categoryName: cat.name,
    categoryIcon: cat.icon,
    count: tips?.filter((t) => t.category_id === cat.id).length || 0
  })) || []

  // Préparer les données de timeline (evolution des tips)
  const timelineData = tips
    ?.filter((tip) => tip.created_at !== null)
    .map((tip) => ({
      date: tip.created_at as string,
      tipId: tip.id,
      title: tip.title
    })) || []

  const analyticsData = {
    stats: {
      totalTips,
      totalCategories,
      totalMedia,
      averageRating,
      tipsThisMonth,
      tipsWithRating: tipsWithRating.length
    },
    tipsByCategory,
    timelineData,
    tips: tips || [],
    categories: categories || []
  }

  return <AnalyticsClient client={client} user={user} data={analyticsData} />
}
