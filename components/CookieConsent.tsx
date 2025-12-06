'use client'

import { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'

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
  const [showCustomize, setShowCustomize] = useState(false)
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true)
  const [marketingEnabled, setMarketingEnabled] = useState(true)

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
    if (marketing) {
      window.location.reload()
    }
  }

  const handleAcceptAll = () => {
    saveConsent(true, true)
  }

  const handleSavePreferences = () => {
    saveConsent(analyticsEnabled, marketingEnabled)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in slide-in-from-bottom-4 duration-300">

        {!showCustomize ? (
          <>
            {/* Vue principale */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">🍪</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  Nous utilisons des cookies
                </h2>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-6">
              Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et personnaliser les publicités.
              En cliquant sur "Accepter tout", vous consentez à l'utilisation de tous les cookies.
            </p>

            {/* Boutons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleAcceptAll}
                className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition text-sm"
              >
                Accepter tout
              </button>
              <button
                onClick={() => setShowCustomize(true)}
                className="w-full px-4 py-2.5 text-gray-600 hover:text-gray-800 transition text-sm underline"
              >
                Personnaliser mes choix
              </button>
            </div>

            {/* Lien politique */}
            <p className="text-center text-xs text-gray-500 mt-4">
              <a href="/privacy" className="text-indigo-600 hover:underline">
                Politique de confidentialité
              </a>
            </p>
          </>
        ) : (
          <>
            {/* Vue personnalisation */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Paramètres des cookies
              </h2>
              <button
                onClick={() => setShowCustomize(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Cookies essentiels - toujours activés */}
              <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 text-sm">Cookies essentiels</p>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Requis</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">
                    Nécessaires au fonctionnement du site (authentification, sécurité).
                  </p>
                </div>
                <div className="ml-3">
                  <div className="w-10 h-6 bg-indigo-600 rounded-full flex items-center justify-end px-1 cursor-not-allowed opacity-70">
                    <div className="w-4 h-4 bg-white rounded-full shadow flex items-center justify-center">
                      <Check className="w-3 h-3 text-indigo-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Cookies analytiques */}
              <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">Cookies analytiques</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Nous aident à comprendre comment vous utilisez le site.
                  </p>
                </div>
                <div className="ml-3">
                  <button
                    onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
                    className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${
                      analyticsEnabled ? 'bg-indigo-600 justify-end' : 'bg-gray-300 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow" />
                  </button>
                </div>
              </div>

              {/* Cookies marketing */}
              <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">Cookies marketing</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Permettent de mesurer l'efficacité de nos publicités.
                  </p>
                </div>
                <div className="ml-3">
                  <button
                    onClick={() => setMarketingEnabled(!marketingEnabled)}
                    className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${
                      marketingEnabled ? 'bg-indigo-600 justify-end' : 'bg-gray-300 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow" />
                  </button>
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowCustomize(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition text-sm"
              >
                Retour
              </button>
              <button
                onClick={handleSavePreferences}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition text-sm"
              >
                Enregistrer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
