'use client'

import { useEffect } from 'react'
import { storeGclidIfPresent } from '@/hooks/useGoogleAdsConversion'

/**
 * Composant qui stocke le gclid dans le localStorage dès l'arrivée de l'utilisateur
 * Doit être placé dans le layout principal pour capturer le gclid sur toutes les pages
 */
export default function GclidTracker() {
  useEffect(() => {
    storeGclidIfPresent()
  }, [])

  return null
}
