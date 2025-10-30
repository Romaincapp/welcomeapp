'use client'

import { useState } from 'react'
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
  const router = useRouter()
  const pathname = usePathname()

  // Construire l'URL complète du welcomeapp
  const welcomebookUrl = typeof window !== 'undefined' ? window.location.href : `https://welcomeapp.be/${client.slug}`

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
      <header
        className="relative py-4 md:py-8 px-4 md:px-6 text-white"
        style={{ backgroundColor: client.header_color ?? '#4F46E5' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 md:mb-2">{clientName}</h1>
              <p className="text-sm sm:text-base md:text-lg opacity-90">{headerSubtitle}</p>
              <a
                href="/"
                className="text-xs opacity-70 hover:opacity-100 transition-opacity mt-1 inline-block hover:underline"
              >
                Powered by welcomeapp
              </a>
            </div>

            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              {/* Sélecteur de langue */}
              <LanguageSelector
                currentLocale={locale}
                onLocaleChange={handleLocaleChange}
              />
              {/* Bouton Partager - Visible pour tous */}
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm text-white px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-opacity-30 transition text-sm md:text-base border border-white border-opacity-30"
              >
                <Share2 size={16} className="md:w-[18px] md:h-[18px]" />
                <span className="hidden sm:inline">{tShare}</span>
              </button>

              {/* Bouton Infos d'arrivée - Visible seulement si section existe */}
              {hasSecureSection && (
                <button
                  onClick={() => setIsSecureModalOpen(true)}
                  className="flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm text-white px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-opacity-30 transition text-sm md:text-base border border-white border-opacity-30"
                >
                  <Info size={16} className="md:w-[18px] md:h-[18px]" />
                  <span>{tArrivalInfo}</span>
                </button>
              )}

              {/* Boutons mode édition */}
              {isEditMode && (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm text-white px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-opacity-30 transition text-sm md:text-base border border-white border-opacity-30"
                  >
                    <LayoutDashboard size={16} className="md:w-[18px] md:h-[18px]" />
                    <span className="hidden sm:inline">{tDashboard}</span>
                  </Link>

                  <button
                    onClick={onEdit}
                    className="flex items-center gap-2 bg-white text-gray-800 px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-gray-100 transition text-sm md:text-base"
                  >
                    <Settings size={16} className="md:w-[18px] md:h-[18px]" />
                    <span className="hidden sm:inline">{tSettings}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

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
