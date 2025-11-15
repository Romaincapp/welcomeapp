'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AnalyticsMetadata } from '@/hooks/useAnalytics'

/**
 * Track une vue de page welcomebook (visiteur anonyme)
 * Appelé automatiquement au chargement de la page par le visiteur
 *
 * @param clientId - ID du welcomebook visité
 * @param metadata - Métadonnées analytics (session, device, langue, pays)
 * @returns Success status
 */
export async function trackPageView(
  clientId: string,
  metadata: AnalyticsMetadata
): Promise<{ success: boolean }> {
  const supabase = await createServerSupabaseClient()

  try {
    console.log('[TRACK PAGE VIEW]', clientId, metadata.deviceType)

    const { error } = await (supabase.from('analytics_events') as any).insert({
      client_id: clientId,
      tip_id: null, // Événement au niveau welcomebook (pas d'un tip spécifique)
      event_type: 'view',
      event_data: {}, // Pas de données additionnelles pour les vues
      user_session_id: metadata.sessionId,
      device_type: metadata.deviceType,
      user_language: metadata.userLanguage,
      user_country: metadata.userCountry || null,
    })

    if (error) {
      console.error('[TRACK PAGE VIEW] Erreur:', error)
      return { success: false }
    }

    return { success: true }
  } catch (error: unknown) {
    console.error('[TRACK PAGE VIEW] Erreur inattendue:', error)
    return { success: false }
  }
}

/**
 * Track un clic sur un tip (ouverture modal, clic sur bouton, etc.)
 *
 * @param clientId - ID du welcomebook
 * @param tipId - ID du tip cliqué
 * @param metadata - Métadonnées analytics
 * @param eventData - Données additionnelles (button name, action, etc.)
 * @returns Success status
 */
export async function trackTipClick(
  clientId: string,
  tipId: string,
  metadata: AnalyticsMetadata,
  eventData?: Record<string, unknown>
): Promise<{ success: boolean }> {
  const supabase = await createServerSupabaseClient()

  try {
    console.log('[TRACK TIP CLICK]', tipId, eventData)

    const { error } = await (supabase.from('analytics_events') as any).insert({
      client_id: clientId,
      tip_id: tipId,
      event_type: 'click',
      event_data: eventData || {},
      user_session_id: metadata.sessionId,
      device_type: metadata.deviceType,
      user_language: metadata.userLanguage,
      user_country: metadata.userCountry || null,
    })

    if (error) {
      console.error('[TRACK TIP CLICK] Erreur:', error)
      return { success: false }
    }

    return { success: true }
  } catch (error: unknown) {
    console.error('[TRACK TIP CLICK] Erreur inattendue:', error)
    return { success: false }
  }
}

/**
 * Track un événement de partage (copie lien, téléchargement QR, email)
 *
 * @param clientId - ID du welcomebook
 * @param shareMethod - Méthode de partage ('copy_link', 'download_qr', 'email')
 * @param metadata - Métadonnées analytics
 * @param tipId - ID du tip partagé (optionnel, si partage d'un tip spécifique)
 * @returns Success status
 */
export async function trackShareEvent(
  clientId: string,
  shareMethod: string,
  metadata: AnalyticsMetadata,
  tipId?: string
): Promise<{ success: boolean }> {
  const supabase = await createServerSupabaseClient()

  try {
    console.log('[TRACK SHARE]', shareMethod, tipId || 'welcomebook')

    const { error } = await (supabase.from('analytics_events') as any).insert({
      client_id: clientId,
      tip_id: tipId || null,
      event_type: 'share',
      event_data: {
        share_method: shareMethod,
      },
      user_session_id: metadata.sessionId,
      device_type: metadata.deviceType,
      user_language: metadata.userLanguage,
      user_country: metadata.userCountry || null,
    })

    if (error) {
      console.error('[TRACK SHARE] Erreur:', error)
      return { success: false }
    }

    return { success: true }
  } catch (error: unknown) {
    console.error('[TRACK SHARE] Erreur inattendue:', error)
    return { success: false }
  }
}

/**
 * Track une installation PWA
 *
 * @param clientId - ID du welcomebook
 * @param metadata - Métadonnées analytics
 * @returns Success status
 */
export async function trackPWAInstall(
  clientId: string,
  metadata: AnalyticsMetadata
): Promise<{ success: boolean }> {
  const supabase = await createServerSupabaseClient()

  try {
    console.log('[TRACK PWA INSTALL]', clientId, metadata.deviceType)

    const { error } = await (supabase.from('analytics_events') as any).insert({
      client_id: clientId,
      tip_id: null, // Événement au niveau welcomebook
      event_type: 'install_pwa',
      event_data: {},
      user_session_id: metadata.sessionId,
      device_type: metadata.deviceType,
      user_language: metadata.userLanguage,
      user_country: metadata.userCountry || null,
    })

    if (error) {
      console.error('[TRACK PWA INSTALL] Erreur:', error)
      return { success: false }
    }

    return { success: true }
  } catch (error: unknown) {
    console.error('[TRACK PWA INSTALL] Erreur inattendue:', error)
    return { success: false }
  }
}
