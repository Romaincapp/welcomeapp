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
 * Vérifie si l'utilisateur vient d'une publicité Google Ads
 * En détectant le paramètre gclid (Google Click ID) ou les paramètres UTM
 */
function isFromGoogleAds(): boolean {
  if (typeof window === 'undefined') return false

  // Vérifier si gclid est présent dans l'URL actuelle
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.has('gclid')) {
    console.log('[GoogleAds] gclid détecté dans URL')
    return true
  }

  // Vérifier si gclid est stocké dans le localStorage (persisté depuis la landing page)
  const storedGclid = localStorage.getItem('gclid')
  if (storedGclid) {
    console.log('[GoogleAds] gclid trouvé dans localStorage')
    return true
  }

  // Vérifier les paramètres UTM spécifiques à Google Ads
  const utmSource = urlParams.get('utm_source')
  const utmMedium = urlParams.get('utm_medium')
  if (utmSource === 'google' && utmMedium === 'cpc') {
    console.log('[GoogleAds] Paramètres UTM Google Ads détectés')
    return true
  }

  console.log('[GoogleAds] Aucune source publicitaire détectée')
  return false
}

/**
 * Stocke le gclid dans le localStorage si présent dans l'URL
 * À appeler sur toutes les pages pour persister le gclid durant la session
 */
export function storeGclidIfPresent(): void {
  if (typeof window === 'undefined') return

  const urlParams = new URLSearchParams(window.location.search)
  const gclid = urlParams.get('gclid')

  if (gclid) {
    // Stocker avec une expiration de 90 jours (durée standard de conversion Google Ads)
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + 90)

    localStorage.setItem('gclid', gclid)
    localStorage.setItem('gclid_expiry', expirationDate.toISOString())
    console.log('[GoogleAds] gclid stocké:', gclid)
  }

  // Nettoyer le gclid expiré
  const gclidExpiry = localStorage.getItem('gclid_expiry')
  if (gclidExpiry && new Date(gclidExpiry) < new Date()) {
    localStorage.removeItem('gclid')
    localStorage.removeItem('gclid_expiry')
    console.log('[GoogleAds] gclid expiré, nettoyé')
  }
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
   * NE TRACK QUE SI L'UTILISATEUR VIENT D'UNE PUBLICITÉ GOOGLE ADS
   */
  const trackSignupConversion = useCallback((email?: string) => {
    if (typeof window === 'undefined' || !window.gtag) {
      console.log('[GoogleAds] gtag non disponible')
      return
    }

    // VÉRIFICATION IMPORTANTE : Ne tracker que si vient de Google Ads
    if (!isFromGoogleAds()) {
      console.log('[GoogleAds] ❌ Conversion NON envoyée - utilisateur ne vient pas de Google Ads')
      return
    }

    console.log('[GoogleAds] ✅ Utilisateur vient de Google Ads - envoi de la conversion')

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
