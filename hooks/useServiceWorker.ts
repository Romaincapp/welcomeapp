'use client'

import { useEffect } from 'react'

export function useServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[SW] Registration successful:', registration.scope)
        })
        .catch((error) => {
          console.error('[SW] Registration failed:', error)
        })
    }
  }, [])
}
