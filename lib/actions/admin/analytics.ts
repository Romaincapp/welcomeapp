'use server'

/**
 * Server actions pour les analytics avancés (admin)
 * Exploite la table analytics_events
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'

// =============================================================================
// TYPES
// =============================================================================

export interface TopTip {
  tip_id: string
  tip_title: string
  clicks: number
  welcomebook_name: string
}

export interface PeakHour {
  hour: number
  count: number
}

export interface ShareBreakdown {
  method: string
  count: number
  percentage: number
}

export interface CountryEngagement {
  country: string
  views: number
  clicks: number
  engagement_rate: number
}

export interface SessionStats {
  total_sessions: number
  bounce_rate: number
  avg_duration_seconds: number
  avg_events_per_session: number
}

export interface ConversionFunnel {
  views: number
  clicks: number
  shares: number
  pwa_installs: number
  view_to_click_rate: number
  click_to_share_rate: number
  view_to_pwa_rate: number
}

export interface AdvancedAnalytics {
  totalEvents: number
  eventsByType: Record<string, number>
  eventsByDevice: Record<string, number>
  topLanguages: Array<{ language: string; count: number }>
  topCountries: Array<{ country: string; count: number }>
  recentSessions: Array<{
    session_id: string
    event_count: number
    first_event: string
    last_event: string
    device_type: string | null
    user_language: string | null
    user_country: string | null
  }>
  // Nouvelles métriques
  topTips: TopTip[]
  peakHours: PeakHour[]
  shareBreakdown: ShareBreakdown[]
  countryEngagement: CountryEngagement[]
  sessionStats: SessionStats
  conversionFunnel: ConversionFunnel
}

// =============================================================================
// TYPES INTERNES
// =============================================================================

interface AnalyticsEvent {
  id: string
  client_id: string
  tip_id: string | null
  event_type: string
  event_data: Record<string, unknown> | null
  user_session_id: string | null
  device_type: string | null
  user_language: string | null
  user_country: string | null
  created_at: string
}

interface TipInfo {
  id: string
  title: string
  client: {
    name: string | null
  } | null
}

// =============================================================================
// SERVER ACTIONS
// =============================================================================

/**
 * Récupère les analytics avancés de la plateforme
 */
export async function getAdvancedAnalytics(): Promise<AdvancedAnalytics> {
  try {
    // Vérifier que l'utilisateur est admin
    await requireAdmin()

    const supabase = await createServerSupabaseClient()

    // Récupérer tous les événements
    const { data: events, error } = await supabase
      .from('analytics_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10000) // Limiter pour performance

    if (error) {
      console.error('[ADMIN ANALYTICS] Error fetching events:', error)
      return getEmptyAnalytics()
    }

    const allEvents = (events || []) as unknown as AnalyticsEvent[]

    // Récupérer les infos des tips cliqués pour avoir les titres
    const tipIds = [...new Set(allEvents.filter(e => e.tip_id).map(e => e.tip_id))]
    const { data: tipsData } = await supabase
      .from('tips')
      .select('id, title, client:clients(name)')
      .in('id', tipIds.length > 0 ? tipIds : ['00000000-0000-0000-0000-000000000000'])

    const tipsMap = new Map<string, TipInfo>()
    if (tipsData) {
      (tipsData as unknown as TipInfo[]).forEach(tip => {
        tipsMap.set(tip.id, tip)
      })
    }

    // ==========================================================================
    // Métriques de base (existantes)
    // ==========================================================================

    // Compter par type d'événement
    const eventsByType: Record<string, number> = {}
    allEvents.forEach((event) => {
      eventsByType[event.event_type] = (eventsByType[event.event_type] || 0) + 1
    })

    // Compter par type de device
    const eventsByDevice: Record<string, number> = {}
    allEvents.forEach((event) => {
      const device = event.device_type || 'unknown'
      eventsByDevice[device] = (eventsByDevice[device] || 0) + 1
    })

    // Top langues
    const languageCounts: Record<string, number> = {}
    allEvents.forEach((event) => {
      if (event.user_language) {
        languageCounts[event.user_language] = (languageCounts[event.user_language] || 0) + 1
      }
    })
    const topLanguages = Object.entries(languageCounts)
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Top pays
    const countryCounts: Record<string, number> = {}
    allEvents.forEach((event) => {
      if (event.user_country) {
        countryCounts[event.user_country] = (countryCounts[event.user_country] || 0) + 1
      }
    })
    const topCountries = Object.entries(countryCounts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Sessions (groupées par user_session_id)
    const sessionMap = new Map<string, AnalyticsEvent[]>()
    allEvents.forEach((event) => {
      if (event.user_session_id) {
        if (!sessionMap.has(event.user_session_id)) {
          sessionMap.set(event.user_session_id, [])
        }
        sessionMap.get(event.user_session_id)!.push(event)
      }
    })

    const recentSessions = Array.from(sessionMap.entries())
      .map(([sessionId, sessionEvents]) => {
        const sorted = sessionEvents.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
        return {
          session_id: sessionId,
          event_count: sessionEvents.length,
          first_event: sorted[0].created_at,
          last_event: sorted[sorted.length - 1].created_at,
          device_type: sorted[0].device_type,
          user_language: sorted[0].user_language,
          user_country: sorted[0].user_country,
        }
      })
      .sort((a, b) => new Date(b.first_event).getTime() - new Date(a.first_event).getTime())
      .slice(0, 20)

    // ==========================================================================
    // Nouvelles métriques
    // ==========================================================================

    // 1. Top Tips Cliqués
    const tipClickCounts: Record<string, number> = {}
    allEvents.forEach((event) => {
      if (event.event_type === 'click' && event.tip_id) {
        tipClickCounts[event.tip_id] = (tipClickCounts[event.tip_id] || 0) + 1
      }
    })
    const topTips: TopTip[] = Object.entries(tipClickCounts)
      .map(([tipId, clicks]) => {
        const tipInfo = tipsMap.get(tipId)
        return {
          tip_id: tipId,
          tip_title: tipInfo?.title || 'Tip inconnu',
          clicks,
          welcomebook_name: tipInfo?.client?.name || 'N/A',
        }
      })
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10)

    // 2. Heures de pointe (distribution par heure)
    const hourCounts: Record<number, number> = {}
    for (let i = 0; i < 24; i++) {
      hourCounts[i] = 0
    }
    allEvents.forEach((event) => {
      const hour = new Date(event.created_at).getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    })
    const peakHours: PeakHour[] = Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => a.hour - b.hour)

    // 3. Breakdown des partages
    const shareCounts: Record<string, number> = {}
    const shareEvents = allEvents.filter(e => e.event_type === 'share')
    shareEvents.forEach((event) => {
      const method = (event.event_data as Record<string, unknown>)?.share_method as string || 'unknown'
      shareCounts[method] = (shareCounts[method] || 0) + 1
    })
    const totalShares = shareEvents.length
    const shareBreakdown: ShareBreakdown[] = Object.entries(shareCounts)
      .map(([method, count]) => ({
        method,
        count,
        percentage: totalShares > 0 ? Math.round((count / totalShares) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)

    // 4. Engagement par pays
    const countryViews: Record<string, number> = {}
    const countryClicks: Record<string, number> = {}
    allEvents.forEach((event) => {
      if (event.user_country) {
        if (event.event_type === 'view') {
          countryViews[event.user_country] = (countryViews[event.user_country] || 0) + 1
        } else if (event.event_type === 'click') {
          countryClicks[event.user_country] = (countryClicks[event.user_country] || 0) + 1
        }
      }
    })
    const allCountriesSet = new Set([...Object.keys(countryViews), ...Object.keys(countryClicks)])
    const countryEngagement: CountryEngagement[] = Array.from(allCountriesSet)
      .map(country => {
        const views = countryViews[country] || 0
        const clicks = countryClicks[country] || 0
        return {
          country,
          views,
          clicks,
          engagement_rate: views > 0 ? Math.round((clicks / views) * 100) : 0,
        }
      })
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    // 5. Statistiques de session (bounce rate, durée moyenne)
    const sessionsArray = Array.from(sessionMap.values())
    const totalSessions = sessionsArray.length

    // Bounce = sessions avec uniquement des vues (pas de clics)
    const bounceSessions = sessionsArray.filter(events => {
      return events.every(e => e.event_type === 'view')
    }).length
    const bounceRate = totalSessions > 0 ? Math.round((bounceSessions / totalSessions) * 100) : 0

    // Durée moyenne de session (en secondes)
    let totalDuration = 0
    let sessionsWithDuration = 0
    sessionsArray.forEach(events => {
      if (events.length > 1) {
        const sorted = events.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
        const duration = (new Date(sorted[sorted.length - 1].created_at).getTime() -
          new Date(sorted[0].created_at).getTime()) / 1000
        if (duration > 0 && duration < 3600) { // Ignorer sessions > 1h (probablement sessions abandonnées)
          totalDuration += duration
          sessionsWithDuration++
        }
      }
    })
    const avgDurationSeconds = sessionsWithDuration > 0
      ? Math.round(totalDuration / sessionsWithDuration)
      : 0

    // Événements moyens par session
    const totalEventsInSessions = sessionsArray.reduce((sum, events) => sum + events.length, 0)
    const avgEventsPerSession = totalSessions > 0
      ? Math.round((totalEventsInSessions / totalSessions) * 10) / 10
      : 0

    const sessionStats: SessionStats = {
      total_sessions: totalSessions,
      bounce_rate: bounceRate,
      avg_duration_seconds: avgDurationSeconds,
      avg_events_per_session: avgEventsPerSession,
    }

    // 6. Funnel de conversion
    const views = eventsByType['view'] || 0
    const clicks = eventsByType['click'] || 0
    const shares = eventsByType['share'] || 0
    const pwaInstalls = eventsByType['install_pwa'] || 0

    const conversionFunnel: ConversionFunnel = {
      views,
      clicks,
      shares,
      pwa_installs: pwaInstalls,
      view_to_click_rate: views > 0 ? Math.round((clicks / views) * 100) : 0,
      click_to_share_rate: clicks > 0 ? Math.round((shares / clicks) * 100) : 0,
      view_to_pwa_rate: views > 0 ? Math.round((pwaInstalls / views) * 100) : 0,
    }

    return {
      totalEvents: allEvents.length,
      eventsByType,
      eventsByDevice,
      topLanguages,
      topCountries,
      recentSessions,
      // Nouvelles métriques
      topTips,
      peakHours,
      shareBreakdown,
      countryEngagement,
      sessionStats,
      conversionFunnel,
    }
  } catch (error) {
    console.error('[ADMIN ANALYTICS] Error:', error)
    throw error
  }
}

/**
 * Retourne un objet analytics vide
 */
function getEmptyAnalytics(): AdvancedAnalytics {
  return {
    totalEvents: 0,
    eventsByType: {},
    eventsByDevice: {},
    topLanguages: [],
    topCountries: [],
    recentSessions: [],
    topTips: [],
    peakHours: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 })),
    shareBreakdown: [],
    countryEngagement: [],
    sessionStats: {
      total_sessions: 0,
      bounce_rate: 0,
      avg_duration_seconds: 0,
      avg_events_per_session: 0,
    },
    conversionFunnel: {
      views: 0,
      clicks: 0,
      shares: 0,
      pwa_installs: 0,
      view_to_click_rate: 0,
      click_to_share_rate: 0,
      view_to_pwa_rate: 0,
    },
  }
}
