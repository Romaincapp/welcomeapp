'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Client } from '@/types'
import { Settings, Info, Share2, LayoutDashboard, Plus, Sparkles, Palette, LogOut, X } from 'lucide-react'
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
  isOwner?: boolean // Est-ce que l'utilisateur connecté est propriétaire
  onEdit?: () => void
  hasSecureSection?: boolean
  locale?: Locale
  onLocaleChange?: (locale: Locale) => void // Callback pour changer la langue
  onAddTip?: () => void // Callback pour ouvrir AddTipModal
  onSmartFill?: () => void // Callback pour ouvrir SmartFillModal
  onToggleEditMode?: () => void // Callback pour toggle le mode édition
  onLogout?: () => void // Callback pour déconnexion
}

export default function Header({ client, isEditMode = false, isOwner = false, onEdit, hasSecureSection = false, locale = 'fr', onLocaleChange, onAddTip, onSmartFill, onToggleEditMode, onLogout }: HeaderProps) {
  const [isSecureModalOpen, setIsSecureModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isCompact, setIsCompact] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Construire l'URL complète du welcomeapp
  const welcomebookUrl = typeof window !== 'undefined' ? window.location.href : `https://welcomeapp.be/${client.slug}`

  // 📜 Détection du scroll pour mode compact avec hystérésis
  useEffect(() => {
    const handleScroll = () => {
      // Hystérésis pour éviter l'oscillation infinie à la limite du seuil
      setIsCompact((prev) => {
        if (!prev && window.scrollY > 100) return true   // FULL → COMPACT: seuil 100px
        if (prev && window.scrollY < 80) return false    // COMPACT → FULL: seuil 80px
        return prev  // Zone morte [80-100px]: conserver l'état actuel
      })
    }

    // Écouter le scroll
    window.addEventListener('scroll', handleScroll)

    // Nettoyer l'écouteur au démontage
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 🎯 Détection du clic en dehors du menu et ESC
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscKey)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [isMenuOpen])

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
  const { translated: tAddTip } = useClientTranslation('Ajouter un conseil', 'fr', locale)
  const { translated: tSmartFill } = useClientTranslation('Remplissage automatique', 'fr', locale)
  const { translated: tCustomize } = useClientTranslation('Personnaliser', 'fr', locale)
  const { translated: tExitEdit } = useClientTranslation("Quitter l'édition", 'fr', locale)
  const { translated: tLogout } = useClientTranslation('Déconnexion', 'fr', locale)
  const { translated: tMenu } = useClientTranslation('Menu', 'fr', locale)
  const { translated: tEditMode } = useClientTranslation('Mode édition', 'fr', locale)

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
                compactMode={isOwner}
              />
              {/* Bouton Partager - Visible uniquement pour les visiteurs (pas pour les gestionnaires) */}
              {!isOwner && (
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
              )}

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

              {/* Bouton pour activer le mode édition (visible uniquement pour le propriétaire hors mode édition) */}
              {isOwner && !isEditMode && onToggleEditMode && (
                <button
                  onClick={onToggleEditMode}
                  className="flex items-center justify-center gap-2 h-9 bg-white text-gray-800 px-3 rounded-lg hover:bg-gray-100 transition-all duration-300 text-sm"
                  title={tEditMode}
                >
                  <Settings size={16} className="flex-shrink-0" />
                  <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${
                    isCompact ? 'max-w-0 opacity-0' : 'max-w-xs opacity-100'
                  }`}>
                    {tEditMode}
                  </span>
                </button>
              )}

              {/* Bouton menu mode édition */}
              {isEditMode && (
                <div ref={menuRef} className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center justify-center gap-2 h-9 bg-white text-gray-800 px-3 rounded-lg hover:bg-gray-100 transition-all duration-300 text-sm"
                    title={tMenu}
                  >
                    {isMenuOpen ? <X size={16} className="flex-shrink-0" /> : <Plus size={16} className="flex-shrink-0" />}
                    <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${
                      isCompact ? 'max-w-0 opacity-0' : 'max-w-xs opacity-100'
                    }`}>
                      {tMenu}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-2xl border border-gray-200 py-2 z-[70] animate-fade-in">
                      {/* Ajouter un conseil */}
                      {onAddTip && (
                        <button
                          onClick={() => {
                            onAddTip()
                            setIsMenuOpen(false)
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left text-gray-700"
                        >
                          <Plus size={18} className="flex-shrink-0 text-blue-600" />
                          <span className="font-medium">{tAddTip}</span>
                        </button>
                      )}

                      {/* Remplissage automatique */}
                      {onSmartFill && (
                        <button
                          onClick={() => {
                            onSmartFill()
                            setIsMenuOpen(false)
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left text-gray-700"
                        >
                          <Sparkles size={18} className="flex-shrink-0 text-purple-600" />
                          <span className="font-medium">{tSmartFill}</span>
                        </button>
                      )}

                      {/* Personnaliser */}
                      {onEdit && (
                        <button
                          onClick={() => {
                            onEdit()
                            setIsMenuOpen(false)
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left text-gray-700"
                        >
                          <Palette size={18} className="flex-shrink-0 text-pink-600" />
                          <span className="font-medium">{tCustomize}</span>
                        </button>
                      )}

                      {/* Divider */}
                      <div className="border-t border-gray-200 my-2" />

                      {/* Dashboard */}
                      <Link
                        href="/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left text-gray-700"
                      >
                        <LayoutDashboard size={18} className="flex-shrink-0 text-indigo-600" />
                        <span className="font-medium">{tDashboard}</span>
                      </Link>

                      {/* Paramètres */}
                      <Link
                        href="/dashboard/settings"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left text-gray-700"
                      >
                        <Settings size={18} className="flex-shrink-0 text-gray-600" />
                        <span className="font-medium">{tSettings}</span>
                      </Link>

                      {/* Divider */}
                      <div className="border-t border-gray-200 my-2" />

                      {/* Quitter l'édition */}
                      {onToggleEditMode && (
                        <button
                          onClick={() => {
                            onToggleEditMode()
                            setIsMenuOpen(false)
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left text-gray-700"
                        >
                          <LogOut size={18} className="flex-shrink-0 text-orange-600" />
                          <span className="font-medium">{tExitEdit}</span>
                        </button>
                      )}

                      {/* Déconnexion */}
                      {onLogout && (
                        <button
                          onClick={() => {
                            onLogout()
                            setIsMenuOpen(false)
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left text-red-600"
                        >
                          <LogOut size={18} className="flex-shrink-0" />
                          <span className="font-medium">{tLogout}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Spacer pour compenser le header fixe - prend la même hauteur que le header */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isCompact ? 'h-[64px] sm:h-[60px]' : 'h-[160px] sm:h-[180px] md:h-[200px]'
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
        clientId={client.id}
        clientSlug={client.slug}
      />
    </>
  )
}
