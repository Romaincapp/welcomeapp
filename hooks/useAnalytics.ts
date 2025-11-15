'use client'

import { useState, useEffect, useCallback } from 'react'

// Types pour les métadonnées analytics
export interface AnalyticsMetadata {
  sessionId: string
  deviceType: 'mobile' | 'tablet' | 'desktop'
  userLanguage: string
  userCountry?: string
}

interface UseAnalyticsReturn {
  metadata: AnalyticsMetadata
  trackView: (clientId: string) => Promise<void>
  trackClick: (clientId: string, tipId: string) => Promise<void>
  trackShare: (clientId: string, shareMethod: string) => Promise<void>
  trackInstall: (clientId: string) => Promise<void>
  isReady: boolean
}

/**
 * Hook personnalisé pour tracker les événements analytics des visiteurs
 * Génère automatiquement un session ID unique, détecte device/langue
 *
 * @returns Méthodes de tracking et métadonnées
 *
 * @example
 * ```tsx
 * const { trackView, trackClick, isReady } = useAnalytics()
 *
 * // Track page view
 * useEffect(() => {
 *   if (isReady) trackView(clientId)
 * }, [isReady, clientId])
 *
 * // Track tip click
 * <button onClick={() => trackClick(clientId, tipId)}>
 * ```
 */
export function useAnalytics(): UseAnalyticsReturn {
  const [metadata, setMetadata] = useState<AnalyticsMetadata>({
    sessionId: '',
    deviceType: 'desktop',
    userLanguage: 'en',
    userCountry: undefined,
  })
  const [isReady, setIsReady] = useState(false)

  // Initialisation des métadonnées (SSR-safe)
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Générer ou récupérer session ID
    const sessionId = getOrCreateSessionId()

    // Détecter device type
    const deviceType = detectDeviceType()

    // Détecter langue
    const userLanguage = detectLanguage()

    // Détecter pays (optionnel, pour l'instant on skip)
    const userCountry = undefined

    setMetadata({
      sessionId,
      deviceType,
      userLanguage,
      userCountry,
    })

    setIsReady(true)
  }, [])

  // Track page view
  const trackView = useCallback(
    async (clientId: string) => {
      if (!isReady) return

      try {
        const { trackPageView } = await import('@/lib/actions/analytics')
        await trackPageView(clientId, metadata)
      } catch (error) {
        console.error('Erreur lors du tracking de la vue:', error)
      }
    },
    [isReady, metadata]
  )

  // Track tip click
  const trackClick = useCallback(
    async (clientId: string, tipId: string) => {
      if (!isReady) return

      try {
        const { trackTipClick } = await import('@/lib/actions/analytics')
        await trackTipClick(clientId, tipId, metadata)
      } catch (error) {
        console.error('Erreur lors du tracking du clic:', error)
      }
    },
    [isReady, metadata]
  )

  // Track share event
  const trackShare = useCallback(
    async (clientId: string, shareMethod: string) => {
      if (!isReady) return

      try {
        const { trackShareEvent } = await import('@/lib/actions/analytics')
        await trackShareEvent(clientId, shareMethod, metadata)
      } catch (error) {
        console.error('Erreur lors du tracking du partage:', error)
      }
    },
    [isReady, metadata]
  )

  // Track PWA install
  const trackInstall = useCallback(
    async (clientId: string) => {
      if (!isReady) return

      try {
        const { trackPWAInstall } = await import('@/lib/actions/analytics')
        await trackPWAInstall(clientId, metadata)
      } catch (error) {
        console.error("Erreur lors du tracking de l'installation PWA:", error)
      }
    },
    [isReady, metadata]
  )

  return {
    metadata,
    trackView,
    trackClick,
    trackShare,
    trackInstall,
    isReady,
  }
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Génère ou récupère un session ID unique depuis localStorage
 * Format: UUID v4 + timestamp création
 */
function getOrCreateSessionId(): string {
  const storageKey = 'welcomeapp_analytics_session'

  try {
    const saved = localStorage.getItem(storageKey)

    if (saved) {
      const session = JSON.parse(saved)
      const createdAt = new Date(session.createdAt)
      const now = new Date()

      // Session expire après 30 minutes d'inactivité
      const diffMinutes = (now.getTime() - createdAt.getTime()) / 1000 / 60

      if (diffMinutes < 30) {
        // Mettre à jour timestamp (prolonger session)
        session.lastActivity = now.toISOString()
        localStorage.setItem(storageKey, JSON.stringify(session))
        return session.id
      }
    }

    // Créer nouvelle session
    const newSession = {
      id: generateUUID(),
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    }

    localStorage.setItem(storageKey, JSON.stringify(newSession))
    return newSession.id
  } catch (error) {
    console.error('Erreur lors de la gestion du session ID:', error)
    // Fallback: session ID temporaire
    return generateUUID()
  }
}

/**
 * Détecte le type d'appareil basé sur le userAgent et la taille d'écran
 */
function detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop'

  const userAgent = navigator.userAgent.toLowerCase()
  const width = window.innerWidth

  // Mobile: <= 768px ou userAgent mobile
  if (width <= 768 || /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    return 'mobile'
  }

  // Tablet: 769-1024px ou userAgent tablet
  if (width <= 1024 || /tablet|ipad|playbook|silk/i.test(userAgent)) {
    return 'tablet'
  }

  // Desktop: > 1024px
  return 'desktop'
}

/**
 * Détecte la langue du navigateur (format ISO 639-1)
 */
function detectLanguage(): string {
  if (typeof window === 'undefined') return 'en'

  try {
    const lang = navigator.language || 'en'
    // Extraire seulement le code langue (ex: "fr-FR" → "fr")
    return lang.split('-')[0].toLowerCase()
  } catch (error) {
    return 'en'
  }
}

/**
 * Génère un UUID v4 simple (pour session ID)
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
