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
    // 🔒 Validation des paramètres d'entrée
    if (!clientId || typeof clientId !== 'string') {
      console.error('[TRACK PWA INSTALL] Invalid clientId:', clientId)
      return { success: false }
    }

    if (!metadata || !metadata.sessionId || !metadata.deviceType) {
      console.error('[TRACK PWA INSTALL] Invalid metadata:', metadata)
      return { success: false }
    }

    console.log('[TRACK PWA INSTALL]', clientId, metadata.deviceType)

    // 🔒 Vérifier que le client existe
    const { data: client, error: clientError } = await (supabase.from('clients') as any)
      .select('id')
      .eq('id', clientId)
      .maybeSingle()

    if (clientError) {
      console.error('[TRACK PWA INSTALL] Erreur lors de la vérification du client:', clientError)
      return { success: false }
    }

    if (!client) {
      console.error('[TRACK PWA INSTALL] Client non trouvé:', clientId)
      return { success: false }
    }

    // ✅ Insertion de l'événement analytics
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
      console.error('[TRACK PWA INSTALL] Erreur lors de l\'insertion:', error)
      return { success: false }
    }

    console.log('[TRACK PWA INSTALL] ✅ Événement tracké avec succès')
    return { success: true }
  } catch (error: unknown) {
    console.error('[TRACK PWA INSTALL] Erreur inattendue:', error)
    return { success: false }
  }
}
