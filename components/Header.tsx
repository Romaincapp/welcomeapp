'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Client } from '@/types'
import { Settings, Info, Share2, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import SecureSectionModal from './SecureSectionModal'
import ShareModal from './ShareModal'
import LanguageSelector from './LanguageSelector'
import { type Locale } from '@/i18n/request'
import { getTranslatedField } from '@/lib/i18n-helpers'
import { useClientTranslation } from '@/hooks/useClientTranslation'

interface HeaderProps {
  client: Client
  isEditMode?: boolean
  onEdit?: () => void
  hasSecureSection?: boolean
  locale?: Locale
  onLocaleChange?: (locale: Locale) => void // NOUVEAU : Callback pour changer la langue
}

export default function Header({ client, isEditMode = false, onEdit, hasSecureSection = false, locale = 'fr', onLocaleChange }: HeaderProps) {
  const [isSecureModalOpen, setIsSecureModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isCompact, setIsCompact] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Construire l'URL complète du welcomeapp
  const welcomebookUrl = typeof window !== 'undefined' ? window.location.href : `https://welcomeapp.be/${client.slug}`

  // 📜 Détection du scroll pour mode compact
  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 100 // Seuil en pixels
      setIsCompact(window.scrollY > scrollThreshold)
    }

    // Écouter le scroll
    window.addEventListener('scroll', handleScroll)

    // Nettoyer l'écouteur au démontage
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Récupérer les textes traduits
  const clientName = getTranslatedField(client, 'name', locale)

  // 🌍 Traduction du sous-titre (client-side)
  const defaultSubtitle = 'Bienvenue dans votre guide personnalisé'
  const rawSubtitle = client.header_subtitle || defaultSubtitle
  const { translated: headerSubtitle } = useClientTranslation(rawSubtitle, 'fr', locale)

  // 🌍 Traduction des labels de boutons
  const { translated: tShare } = useClientTranslation('Partager', 'fr', locale)
  const { translated: tArrivalInfo } = useClientTranslation("Infos d'arrivée", 'fr', locale)
  const { translated: tDashboard } = useClientTranslation('Dashboard', 'fr', locale)
  const { translated: tSettings } = useClientTranslation('Paramètres', 'fr', locale)

  // Handler pour changer de langue
  const handleLocaleChange = (newLocale: Locale) => {
    // 🌍 NOUVEAU : Utiliser le callback depuis WelcomeBookClient si disponible
    if (onLocaleChange) {
      onLocaleChange(newLocale)
    } else {
      // Fallback : Ancienne méthode avec navigation URL (pour pages publiques)
      const pathParts = pathname.split('/').filter(Boolean)
      const slug = pathParts[pathParts.length - 1]

      if (newLocale === 'fr') {
        router.push(`/${slug}`)
      } else {
        router.push(`/${newLocale}/${slug}`)
      }
    }
  }

  return (
    <>
      {/* Header fixe */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 px-4 md:px-6 text-white transition-all duration-300 ease-in-out ${
          isCompact ? 'py-2 shadow-lg' : 'py-4 md:py-8'
        }`}
        style={{ backgroundColor: client.header_color ?? '#4F46E5' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
            <div className="flex-1">
              <h1 className={`font-bold transition-all duration-300 ease-in-out ${
                isCompact ? 'text-lg sm:text-xl md:text-2xl mb-0' : 'text-2xl sm:text-3xl md:text-4xl mb-1 md:mb-2'
              }`}>
                {clientName}
              </h1>
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isCompact ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100'
              }`}>
                <p className="text-sm sm:text-base md:text-lg opacity-90">{headerSubtitle}</p>
                <a
                  href="/"
                  className="text-xs opacity-70 hover:opacity-100 transition-opacity mt-1 inline-block hover:underline"
                >
                  Powered by welcomeapp
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Sélecteur de langue */}
              <LanguageSelector
                currentLocale={locale}
                onLocaleChange={handleLocaleChange}
              />
              {/* Bouton Partager - Visible pour tous */}
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center justify-center gap-2 h-9 bg-white bg-opacity-20 backdrop-blur-sm text-white px-3 rounded-lg hover:bg-opacity-30 transition-all duration-300 text-sm border border-white border-opacity-30"
                title={tShare}
              >
                <Share2 size={16} className="flex-shrink-0" />
                <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${
                  isCompact ? 'max-w-0 opacity-0' : 'max-w-xs opacity-100'
                }`}>
                  {tShare}
                </span>
              </button>

              {/* Bouton Infos d'arrivée - Visible seulement si section existe - GARDE TOUJOURS SON TEXTE */}
              {hasSecureSection && (
                <button
                  onClick={() => setIsSecureModalOpen(true)}
                  className="flex items-center justify-center gap-2 h-9 bg-white bg-opacity-20 backdrop-blur-sm text-white px-3 rounded-lg hover:bg-opacity-30 transition-all duration-300 text-sm border border-white border-opacity-30"
                  title={tArrivalInfo}
                >
                  <Info size={16} className="flex-shrink-0" />
                  <span className="whitespace-nowrap">{tArrivalInfo}</span>
                </button>
              )}

              {/* Boutons mode édition */}
              {isEditMode && (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-center gap-2 h-9 bg-white bg-opacity-20 backdrop-blur-sm text-white px-3 rounded-lg hover:bg-opacity-30 transition-all duration-300 text-sm border border-white border-opacity-30"
                    title={tDashboard}
                  >
                    <LayoutDashboard size={16} className="flex-shrink-0" />
                    <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${
                      isCompact ? 'max-w-0 opacity-0' : 'max-w-xs opacity-100'
                    }`}>
                      {tDashboard}
                    </span>
                  </Link>

                  <button
                    onClick={onEdit}
                    className="flex items-center justify-center gap-2 h-9 bg-white text-gray-800 px-3 rounded-lg hover:bg-gray-100 transition-all duration-300 text-sm"
                    title={tSettings}
                  >
                    <Settings size={16} className="flex-shrink-0" />
                    <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${
                      isCompact ? 'max-w-0 opacity-0' : 'max-w-xs opacity-100'
                    }`}>
                      {tSettings}
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Spacer pour compenser le header fixe - prend la même hauteur que le header */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isCompact ? 'h-[60px] sm:h-[56px]' : 'h-[140px] sm:h-[160px] md:h-[180px]'
        }`}
        aria-hidden="true"
      />

      {/* Modales */}
      <SecureSectionModal
        isOpen={isSecureModalOpen}
        onClose={() => setIsSecureModalOpen(false)}
        clientId={client.id}
        locale={locale}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        welcomebookUrl={welcomebookUrl}
        clientName={client.name}
      />
    </>
  )
}
