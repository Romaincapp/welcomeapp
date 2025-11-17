'use client'

import { useEffect } from 'react'

/**
 * Hook pour enregistrer le Service Worker de la PWA
 * Par défaut activé uniquement en production, mais peut être activé en dev via NEXT_PUBLIC_ENABLE_SW_DEV=true
 */
export function useServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.log('[SW] Service Worker not supported in this browser')
      return
    }

    // Activer en production OU en dev si variable d'environnement activée
    const isProduction = process.env.NODE_ENV === 'production'
    const enableInDev = process.env.NEXT_PUBLIC_ENABLE_SW_DEV === 'true'

    if (isProduction || enableInDev) {
      if (enableInDev) {
        console.log('[SW] Service Worker enabled in development mode')
      }

      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[SW] Registration successful:', registration.scope)
        })
        .catch((error) => {
          console.error('[SW] Registration failed:', error)
        })
    } else {
      console.log('[SW] Service Worker disabled in development (set NEXT_PUBLIC_ENABLE_SW_DEV=true to enable)')
    }
  }, [])
}
