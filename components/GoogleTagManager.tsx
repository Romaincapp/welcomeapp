'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'
import { isMarketingAllowed } from './CookieConsent'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID

export default function GoogleTagManager() {
  const [hasConsent, setHasConsent] = useState(false)

  useEffect(() => {
    // Vérifier le consentement au montage
    setHasConsent(isMarketingAllowed())
  }, [])

  // Ne pas charger si les IDs ne sont pas configurés
  if (!GA_MEASUREMENT_ID && !GOOGLE_ADS_ID) {
    return null
  }

  // Ne pas charger si pas de consentement
  if (!hasConsent) {
    console.log('[GoogleTagManager] En attente de consentement utilisateur')
    return null
  }

  // Utiliser l'ID principal (Google Ads ou GA4)
  const primaryId = GOOGLE_ADS_ID || GA_MEASUREMENT_ID

  return (
    <>
      {/* Google Tag (gtag.js) - Chargé uniquement après consentement */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${primaryId}`}
        strategy="afterInteractive"
      />
      <Script id="google-gtag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          // Consentement par défaut (déjà accepté via bannière)
          gtag('consent', 'default', {
            'ad_storage': 'granted',
            'ad_user_data': 'granted',
            'ad_personalization': 'granted',
            'analytics_storage': 'granted'
          });

          ${GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : ''}
          ${GA_MEASUREMENT_ID ? `gtag('config', '${GA_MEASUREMENT_ID}');` : ''}
        `}
      </Script>
    </>
  )
}

// Types pour gtag
declare global {
  interface Window {
    gtag: (
      command: 'event' | 'config' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void
    dataLayer: unknown[]
  }
}
