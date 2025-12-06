'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const CONSENT_KEY = 'welcomeapp_cookie_consent'

export type ConsentStatus = 'pending' | 'accepted' | 'rejected'

interface ConsentState {
  status: ConsentStatus
  timestamp: number
  analytics: boolean
  marketing: boolean
}

/**
 * Récupère l'état du consentement depuis localStorage
 */
export function getConsentState(): ConsentState | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(CONSENT_KEY)
    if (!stored) return null
    return JSON.parse(stored) as ConsentState
  } catch {
    return null
  }
}

/**
 * Vérifie si le tracking marketing (Google Ads) est autorisé
 */
export function isMarketingAllowed(): boolean {
  const consent = getConsentState()
  return consent?.marketing === true
}

/**
 * Vérifie si le tracking analytics est autorisé
 */
export function isAnalyticsAllowed(): boolean {
  const consent = getConsentState()
  return consent?.analytics === true
}

interface CookieConsentProps {
  onConsentChange?: (consent: ConsentState) => void
}

export default function CookieConsent({ onConsentChange }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Vérifier si le consentement a déjà été donné
    const consent = getConsentState()
    if (!consent) {
      // Délai pour ne pas bloquer le rendu initial
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const saveConsent = (analytics: boolean, marketing: boolean) => {
    const consent: ConsentState = {
      status: analytics || marketing ? 'accepted' : 'rejected',
      timestamp: Date.now(),
      analytics,
      marketing,
    }

    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consent))
    } catch (e) {
      console.error('[CookieConsent] Erreur localStorage:', e)
    }

    setIsVisible(false)
    onConsentChange?.(consent)

    // Recharger la page pour appliquer le consentement
    // (GoogleTagManager va relire le localStorage)
    if (marketing) {
      window.location.reload()
    }
  }

  const handleAcceptAll = () => {
    saveConsent(true, true)
  }

  const handleRejectAll = () => {
    saveConsent(false, false)
  }

  const handleAcceptEssential = () => {
    saveConsent(false, false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-xl">🍪</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              Nous respectons votre vie privée
            </h2>
          </div>
          <button
            onClick={handleRejectAll}
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4">
          Nous utilisons des cookies pour améliorer votre expérience et mesurer l'efficacité de nos publicités.
          Vous pouvez accepter tous les cookies ou personnaliser vos préférences.
        </p>

        {/* Détails (optionnel) */}
        {showDetails && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-green-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-xs">✓</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Cookies essentiels</p>
                <p className="text-gray-500 text-xs">Toujours actifs. Nécessaires au fonctionnement du site.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-xs">📊</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Cookies analytiques</p>
                <p className="text-gray-500 text-xs">Nous aident à comprendre comment vous utilisez le site.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-purple-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 text-xs">📢</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Cookies marketing</p>
                <p className="text-gray-500 text-xs">Permettent de mesurer l'efficacité de nos publicités (Google Ads).</p>
              </div>
            </div>
          </div>
        )}

        {/* Toggle détails */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-indigo-600 text-sm font-medium hover:text-indigo-700 mb-4 block"
        >
          {showDetails ? '← Masquer les détails' : 'En savoir plus →'}
        </button>

        {/* Boutons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAcceptEssential}
            className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition text-sm"
          >
            Essentiels uniquement
          </button>
          <button
            onClick={handleAcceptAll}
            className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition text-sm"
          >
            Accepter tout
          </button>
        </div>

        {/* Lien politique */}
        <p className="text-center text-xs text-gray-500 mt-4">
          En continuant, vous acceptez notre{' '}
          <a href="/privacy" className="text-indigo-600 hover:underline">
            politique de confidentialité
          </a>
        </p>
      </div>
    </div>
  )
}
