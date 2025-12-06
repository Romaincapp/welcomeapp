'use client'

import { useCallback, useEffect, useRef } from 'react'

const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID

interface ConversionOptions {
  // ID de l'action de conversion (ex: "AW-123456789/AbCdEfGhIjKl")
  conversionId?: string
  // Valeur de la conversion (optionnel)
  value?: number
  // Devise (optionnel, défaut: EUR)
  currency?: string
  // Transaction ID pour déduplication (optionnel)
  transactionId?: string
}

/**
 * Hook pour déclencher des conversions Google Ads
 *
 * Usage:
 * ```tsx
 * const { trackConversion, trackSignupConversion } = useGoogleAdsConversion()
 *
 * // Déclencher une conversion générique
 * trackConversion({ conversionId: 'AW-123/xyz' })
 *
 * // Déclencher la conversion signup (lead)
 * trackSignupConversion('user@email.com')
 * ```
 */
export function useGoogleAdsConversion() {
  const hasTrackedRef = useRef(false)

  /**
   * Déclenche une conversion Google Ads générique
   */
  const trackConversion = useCallback((options: ConversionOptions = {}) => {
    if (typeof window === 'undefined' || !window.gtag) {
      console.log('[GoogleAds] gtag non disponible')
      return
    }

    const conversionLabel = options.conversionId || process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL

    if (!GOOGLE_ADS_ID || !conversionLabel) {
      console.log('[GoogleAds] IDs de conversion non configurés')
      return
    }

    // Construire le send_to avec le format correct
    // Format: AW-CONVERSION_ID/CONVERSION_LABEL ou juste CONVERSION_LABEL si déjà complet
    const sendTo = conversionLabel.startsWith('AW-')
      ? conversionLabel
      : `${GOOGLE_ADS_ID}/${conversionLabel}`

    const conversionData: Record<string, unknown> = {
      send_to: sendTo,
    }

    if (options.value !== undefined) {
      conversionData.value = options.value
      conversionData.currency = options.currency || 'EUR'
    }

    if (options.transactionId) {
      conversionData.transaction_id = options.transactionId
    }

    console.log('[GoogleAds] Envoi conversion:', conversionData)
    window.gtag('event', 'conversion', conversionData)
  }, [])

  /**
   * Déclenche la conversion "Signup" (lead = création de welcomebook)
   * Utilise l'email hashé comme transaction_id pour déduplication
   */
  const trackSignupConversion = useCallback((email?: string) => {
    if (typeof window === 'undefined' || !window.gtag) {
      console.log('[GoogleAds] gtag non disponible')
      return
    }

    // Transaction ID pour déduplication (éviter les doubles conversions)
    const transactionId = email
      ? `signup_${btoa(email).slice(0, 20)}_${Date.now()}`
      : `signup_${Date.now()}`

    trackConversion({
      transactionId,
    })
  }, [trackConversion])

  /**
   * Track automatique au montage (une seule fois)
   * Utile pour les pages où la simple visite = conversion
   */
  const trackOnMount = useCallback((options: ConversionOptions = {}) => {
    if (hasTrackedRef.current) {
      console.log('[GoogleAds] Conversion déjà trackée pour cette session')
      return
    }
    hasTrackedRef.current = true
    trackConversion(options)
  }, [trackConversion])

  return {
    trackConversion,
    trackSignupConversion,
    trackOnMount,
  }
}

/**
 * Composant wrapper pour déclencher une conversion au montage
 *
 * Usage:
 * ```tsx
 * <GoogleAdsConversionTracker email={user.email} />
 * ```
 */
export function GoogleAdsConversionTracker({
  email,
  conversionId,
}: {
  email?: string
  conversionId?: string
}) {
  const { trackSignupConversion, trackConversion } = useGoogleAdsConversion()
  const hasTracked = useRef(false)

  useEffect(() => {
    if (hasTracked.current) return
    hasTracked.current = true

    // Petit délai pour s'assurer que gtag est chargé
    const timer = setTimeout(() => {
      if (conversionId) {
        trackConversion({ conversionId })
      } else {
        trackSignupConversion(email)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [email, conversionId, trackSignupConversion, trackConversion])

  return null
}
