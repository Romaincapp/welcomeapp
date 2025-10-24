'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Client } from '@/types'
import { Settings, Lock, Share2, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import SecureSectionModal from './SecureSectionModal'
import ShareModal from './ShareModal'
import LanguageSelector from './LanguageSelector'
import { type Locale } from '@/i18n/request'
import { getTranslatedField } from '@/lib/i18n-helpers'

interface HeaderProps {
  client: Client
  isEditMode?: boolean
  onEdit?: () => void
  hasSecureSection?: boolean
  locale?: Locale
}

export default function Header({ client, isEditMode = false, onEdit, hasSecureSection = false, locale = 'fr' }: HeaderProps) {
  const [isSecureModalOpen, setIsSecureModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Construire l'URL complète du welcomeapp
  const welcomebookUrl = typeof window !== 'undefined' ? window.location.href : `https://welcomeapp.be/${client.slug}`

  // Récupérer les textes traduits
  const clientName = getTranslatedField(client, 'name', locale)
  const headerSubtitle = getTranslatedField(client, 'header_subtitle', locale) || 'Bienvenue dans votre guide personnalisé'

  // Handler pour changer de langue
  const handleLocaleChange = (newLocale: Locale) => {
    // Extraire le slug depuis le pathname
    const pathParts = pathname.split('/').filter(Boolean)
    const slug = pathParts[pathParts.length - 1]

    if (newLocale === 'fr') {
      router.push(`/${slug}`)
    } else {
      router.push(`/${newLocale}/${slug}`)
    }
  }

  return (
    <>
      <header
        className="relative py-4 md:py-8 px-4 md:px-6 text-white"
        style={{ backgroundColor: client.header_color }}
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
                <span className="hidden sm:inline">Partager</span>
              </button>

              {/* Bouton Infos d'arrivée - Visible seulement si section existe */}
              {hasSecureSection && (
                <button
                  onClick={() => setIsSecureModalOpen(true)}
                  className="flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm text-white px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-opacity-30 transition text-sm md:text-base border border-white border-opacity-30"
                >
                  <Lock size={16} className="md:w-[18px] md:h-[18px]" />
                  <span>Infos d'arrivée</span>
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
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>

                  <button
                    onClick={onEdit}
                    className="flex items-center gap-2 bg-white text-gray-800 px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-gray-100 transition text-sm md:text-base"
                  >
                    <Settings size={16} className="md:w-[18px] md:h-[18px]" />
                    <span className="hidden sm:inline">Paramètres</span>
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
