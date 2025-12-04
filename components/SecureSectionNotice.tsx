'use client'

import { useState, useEffect } from 'react'
import { X, Lock, Key } from 'lucide-react'
import { type Locale } from '@/i18n/request'
import { useClientTranslation } from '@/hooks/useClientTranslation'

interface SecureSectionNoticeProps {
  slug: string
  locale?: Locale
  themeColor?: string
  onOpenSecureSection?: () => void
}

/**
 * Composant de notification discret qui informe les visiteurs
 * de l'existence d'une section sécurisée avec les infos d'arrivée.
 *
 * - S'affiche une seule fois à l'ouverture du welcomebook
 * - L'utilisateur peut choisir "Ne plus afficher" pour mémoriser son choix
 * - Stockage dans localStorage par device/navigateur
 */
export default function SecureSectionNotice({
  slug,
  locale = 'fr',
  themeColor = '#4F46E5',
  onOpenSecureSection
}: SecureSectionNoticeProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)
  const [rememberChoice, setRememberChoice] = useState(false)

  // Clé localStorage unique par welcomebook
  const storageKey = `welcomeapp_secure_notice_dismissed_${slug}`

  // Traductions
  const { translated: tTitle } = useClientTranslation(
    "Informations d'arrivée disponibles",
    'fr',
    locale
  )
  const { translated: tMessage } = useClientTranslation(
    "Votre hôte a préparé des informations essentielles pour votre séjour (codes d'accès, instructions d'arrivée...). Accédez-y avec le code fourni lors de votre réservation.",
    'fr',
    locale
  )
  const { translated: tAccess } = useClientTranslation(
    "Accéder aux infos",
    'fr',
    locale
  )
  const { translated: tRemember } = useClientTranslation(
    "Ne plus afficher ce message",
    'fr',
    locale
  )
  const { translated: tClose } = useClientTranslation(
    "Fermer",
    'fr',
    locale
  )

  // Vérifier si l'utilisateur a déjà fermé ce message
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(storageKey)
      if (!dismissed) {
        // Petit délai pour une apparition plus naturelle après le chargement
        const timer = setTimeout(() => {
          setIsVisible(true)
        }, 800)
        return () => clearTimeout(timer)
      }
    } catch (error) {
      // localStorage indisponible (navigation privée, etc.)
      console.warn('[SecureSectionNotice] localStorage unavailable:', error)
    }
  }, [storageKey])

  // Fermer la notification
  const handleClose = () => {
    setIsAnimatingOut(true)

    // Mémoriser le choix si demandé
    if (rememberChoice) {
      try {
        localStorage.setItem(storageKey, 'true')
      } catch (error) {
        console.warn('[SecureSectionNotice] Failed to save preference:', error)
      }
    }

    // Attendre la fin de l'animation avant de masquer
    setTimeout(() => {
      setIsVisible(false)
    }, 300)
  }

  // Ouvrir la section sécurisée
  const handleAccess = () => {
    // Mémoriser si demandé
    if (rememberChoice) {
      try {
        localStorage.setItem(storageKey, 'true')
      } catch (error) {
        console.warn('[SecureSectionNotice] Failed to save preference:', error)
      }
    }

    setIsAnimatingOut(true)
    setTimeout(() => {
      setIsVisible(false)
      onOpenSecureSection?.()
    }, 200)
  }

  if (!isVisible) return null

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-[55] transition-all duration-300 ${
        isAnimatingOut
          ? 'opacity-0 translate-y-4'
          : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header avec icône et titre */}
        <div
          className="px-4 py-3 flex items-center gap-3"
          style={{ backgroundColor: `${themeColor}15` }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: themeColor }}
          >
            <Key className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
              {tTitle}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0"
            aria-label={tClose}
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Message */}
        <div className="px-4 py-3">
          <p className="text-gray-600 text-sm leading-relaxed">
            {tMessage}
          </p>
        </div>

        {/* Actions */}
        <div className="px-4 pb-4 space-y-3">
          {/* Bouton principal */}
          <button
            onClick={handleAccess}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-white font-medium transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: themeColor }}
          >
            <Lock className="w-4 h-4" />
            {tAccess}
          </button>

          {/* Checkbox "Se souvenir" */}
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={rememberChoice}
              onChange={(e) => setRememberChoice(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
            />
            <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
              {tRemember}
            </span>
          </label>
        </div>
      </div>
    </div>
  )
}
