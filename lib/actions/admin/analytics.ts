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
      return {
        totalEvents: 0,
        eventsByType: {},
        eventsByDevice: {},
        topLanguages: [],
        topCountries: [],
        recentSessions: [],
      }
    }

    const allEvents = events || []

    // Compter par type d'événement
    const eventsByType: Record<string, number> = {}
    allEvents.forEach((event: any) => {
      eventsByType[event.event_type] = (eventsByType[event.event_type] || 0) + 1
    })

    // Compter par type de device
    const eventsByDevice: Record<string, number> = {}
    allEvents.forEach((event: any) => {
      const device = event.device_type || 'unknown'
      eventsByDevice[device] = (eventsByDevice[device] || 0) + 1
    })

    // Top langues
    const languageCounts: Record<string, number> = {}
    allEvents.forEach((event: any) => {
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
    allEvents.forEach((event: any) => {
      if (event.user_country) {
        countryCounts[event.user_country] = (countryCounts[event.user_country] || 0) + 1
      }
    })
    const topCountries = Object.entries(countryCounts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Sessions récentes (groupées par user_session_id)
    const sessionMap = new Map<string, any[]>()
    allEvents.forEach((event: any) => {
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

    return {
      totalEvents: allEvents.length,
      eventsByType,
      eventsByDevice,
      topLanguages,
      topCountries,
      recentSessions,
    }
  } catch (error) {
    console.error('[ADMIN ANALYTICS] Error:', error)
    throw error
  }
}
