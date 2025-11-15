'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * Types pour les analytics gestionnaires
 */

export interface ManagerAnalyticsSummary {
  views: number
  clicks: number
  shares: number
  pwa_installs: number
  views_7d: number // Variation derniers 7 jours
  clicks_7d: number
  engagement_rate: number // (clics / vues) * 100
}

export interface AnalyticsBreakdown {
  device: {
    mobile: number
    tablet: number
    desktop: number
  }
  language: Array<{ language: string; count: number }>
  country: Array<{ country: string; count: number }>
}

export interface ViewsOverTime {
  date: string // Format: YYYY-MM-DD
  views: number
  clicks: number
}

/**
 * Récupère le résumé des analytics pour un gestionnaire
 * @param clientId - ID du welcomebook
 * @returns Résumé des métriques (vues, clics, partages, PWA, variations)
 */
export async function getManagerAnalyticsSummary(
  clientId: string
): Promise<{ success: boolean; data?: ManagerAnalyticsSummary; error?: string }> {
  const supabase = await createServerSupabaseClient()

  try {
    // Vérifier que l'utilisateur est authentifié et propriétaire
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Non authentifié')
    }

    // Vérifier ownership
    const { data: client } = await (supabase.from('clients') as any)
      .select('id, email')
      .eq('id', clientId)
      .maybeSingle()

    if (!client || client.email !== user.email) {
      throw new Error('Non autorisé')
    }

    // Récupérer les totaux de tous les événements
    const { data: events } = await (supabase.from('analytics_events') as any)
      .select('event_type, created_at')
      .eq('client_id', clientId)

    if (!events) {
      return {
        success: true,
        data: {
          views: 0,
          clicks: 0,
          shares: 0,
          pwa_installs: 0,
          views_7d: 0,
          clicks_7d: 0,
          engagement_rate: 0,
        },
      }
    }

    // Date il y a 7 jours
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Compter les événements par type
    const views = events.filter((e: any) => e.event_type === 'view').length
    const clicks = events.filter((e: any) => e.event_type === 'click').length
    const shares = events.filter((e: any) => e.event_type === 'share').length
    const pwa_installs = events.filter((e: any) => e.event_type === 'install_pwa').length

    // Compter les événements des 7 derniers jours
    const views_7d = events.filter(
      (e: any) => e.event_type === 'view' && new Date(e.created_at) >= sevenDaysAgo
    ).length
    const clicks_7d = events.filter(
      (e: any) => e.event_type === 'click' && new Date(e.created_at) >= sevenDaysAgo
    ).length

    // Calculer taux d'engagement
    const engagement_rate = views > 0 ? (clicks / views) * 100 : 0

    return {
      success: true,
      data: {
        views,
        clicks,
        shares,
        pwa_installs,
        views_7d,
        clicks_7d,
        engagement_rate: Math.round(engagement_rate * 10) / 10, // Arrondir à 1 décimale
      },
    }
  } catch (error: unknown) {
    console.error('[GET MANAGER ANALYTICS SUMMARY] Erreur:', error)

    if (error instanceof Error) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Erreur inconnue lors de la récupération des analytics' }
  }
}

/**
 * Récupère les breakdowns des analytics (device, langue, pays)
 * @param clientId - ID du welcomebook
 * @returns Breakdowns par device, langue, pays
 */
export async function getManagerAnalyticsBreakdown(
  clientId: string
): Promise<{ success: boolean; data?: AnalyticsBreakdown; error?: string }> {
  const supabase = await createServerSupabaseClient()

  try {
    // Vérifier ownership
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Non authentifié')
    }

    const { data: client } = await (supabase.from('clients') as any)
      .select('id, email')
      .eq('id', clientId)
      .maybeSingle()

    if (!client || client.email !== user.email) {
      throw new Error('Non autorisé')
    }

    // Récupérer les événements avec device, langue, pays
    const { data: events } = await (supabase.from('analytics_events') as any)
      .select('device_type, user_language, user_country')
      .eq('client_id', clientId)
      .eq('event_type', 'view') // Compter uniquement les vues pour éviter duplications

    if (!events || events.length === 0) {
      return {
        success: true,
        data: {
          device: { mobile: 0, tablet: 0, desktop: 0 },
          language: [],
          country: [],
        },
      }
    }

    // Breakdown par device
    const deviceCount = {
      mobile: events.filter((e: any) => e.device_type === 'mobile').length,
      tablet: events.filter((e: any) => e.device_type === 'tablet').length,
      desktop: events.filter((e: any) => e.device_type === 'desktop').length,
    }

    // Breakdown par langue (top 5)
    const languageCounts: Record<string, number> = {}
    events.forEach((e: any) => {
      if (e.user_language) {
        languageCounts[e.user_language] = (languageCounts[e.user_language] || 0) + 1
      }
    })
    const language = Object.entries(languageCounts)
      .map(([lang, count]) => ({ language: lang, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Breakdown par pays (top 5)
    const countryCounts: Record<string, number> = {}
    events.forEach((e: any) => {
      if (e.user_country) {
        countryCounts[e.user_country] = (countryCounts[e.user_country] || 0) + 1
      }
    })
    const country = Object.entries(countryCounts)
      .map(([ctry, count]) => ({ country: ctry, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      success: true,
      data: {
        device: deviceCount,
        language,
        country,
      },
    }
  } catch (error: unknown) {
    console.error('[GET MANAGER ANALYTICS BREAKDOWN] Erreur:', error)

    if (error instanceof Error) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Erreur inconnue' }
  }
}

/**
 * Récupère l'évolution des vues et clics dans le temps
 * @param clientId - ID du welcomebook
 * @param period - Période (7, 30, 90 jours, ou 'all')
 * @returns Array de points de données (date, vues, clics)
 */
export async function getManagerViewsOverTime(
  clientId: string,
  period: 7 | 30 | 90 | 'all' = 30
): Promise<{ success: boolean; data?: ViewsOverTime[]; error?: string }> {
  const supabase = await createServerSupabaseClient()

  try {
    // Vérifier ownership
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Non authentifié')
    }

    const { data: client } = await (supabase.from('clients') as any)
      .select('id, email')
      .eq('id', clientId)
      .maybeSingle()

    if (!client || client.email !== user.email) {
      throw new Error('Non autorisé')
    }

    // Calculer la date de début selon la période
    let startDate: Date | null = null
    if (period !== 'all') {
      startDate = new Date()
      startDate.setDate(startDate.getDate() - period)
    }

    // Query de base
    let query = (supabase.from('analytics_events') as any)
      .select('event_type, created_at')
      .eq('client_id', clientId)
      .in('event_type', ['view', 'click'])

    // Filtrer par date si période limitée
    if (startDate) {
      query = query.gte('created_at', startDate.toISOString())
    }

    const { data: events } = await query.order('created_at', { ascending: true })

    if (!events || events.length === 0) {
      return { success: true, data: [] }
    }

    // Grouper par date
    const eventsByDate: Record<
      string,
      { views: number; clicks: number }
    > = {}

    events.forEach((event: any) => {
      const date = event.created_at.split('T')[0] // YYYY-MM-DD
      if (!eventsByDate[date]) {
        eventsByDate[date] = { views: 0, clicks: 0 }
      }

      if (event.event_type === 'view') {
        eventsByDate[date].views++
      } else if (event.event_type === 'click') {
        eventsByDate[date].clicks++
      }
    })

    // Convertir en array et trier
    const data = Object.entries(eventsByDate)
      .map(([date, counts]) => ({
        date,
        views: counts.views,
        clicks: counts.clicks,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return { success: true, data }
  } catch (error: unknown) {
    console.error('[GET MANAGER VIEWS OVER TIME] Erreur:', error)

    if (error instanceof Error) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Erreur inconnue' }
  }
}
