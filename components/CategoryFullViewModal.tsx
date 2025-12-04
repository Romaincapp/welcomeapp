'use client'

import { useEffect } from 'react'
import { X, MapPin, Star, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { TipWithDetails, Category } from '@/types'
import { type Locale } from '@/i18n/request'
import { useClientTranslation } from '@/hooks/useClientTranslation'

interface CategoryFullViewModalProps {
  isOpen: boolean
  onClose: () => void
  category: Category
  tips: TipWithDetails[]
  onTipClick: (tip: TipWithDetails) => void
  themeColor?: string
  locale?: Locale
  isFavorite?: (tipId: string) => boolean
  onToggleFavorite?: (tipId: string) => void
}

/**
 * Modal plein écran affichant tous les conseils d'une catégorie
 * sur fond blanc avec une grille responsive.
 */
export default function CategoryFullViewModal({
  isOpen,
  onClose,
  category,
  tips,
  onTipClick,
  themeColor = '#4F46E5',
  locale = 'fr',
  isFavorite,
  onToggleFavorite,
}: CategoryFullViewModalProps) {
  // Traduction du nom de la catégorie
  const { translated: categoryName } = useClientTranslation(
    category.name,
    'fr',
    locale
  )

  // Traductions
  const { translated: tTips } = useClientTranslation('conseils', 'fr', locale)
  const { translated: tClose } = useClientTranslation('Fermer', 'fr', locale)

  // Bloquer le scroll du body quand la modal est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
    }
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white">
      {/* Header */}
      <header
        className="sticky top-0 z-10 px-4 py-4 shadow-md flex items-center justify-between"
        style={{ backgroundColor: themeColor }}
      >
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            {categoryName}
          </h1>
          <p className="text-sm text-white/80">
            {tips.length} {tTips}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          aria-label={tClose}
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </header>

      {/* Contenu scrollable */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {/* Grille de conseils */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {tips.map((tip) => (
              <TipFullCard
                key={tip.id}
                tip={tip}
                onClick={() => onTipClick(tip)}
                themeColor={themeColor}
                locale={locale}
                isFavorite={isFavorite ? isFavorite(tip.id) : false}
                onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(tip.id) : undefined}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

/**
 * Carte de conseil pour la vue complète - plus grande et détaillée
 */
function TipFullCard({
  tip,
  onClick,
  themeColor,
  locale = 'fr',
  isFavorite,
  onToggleFavorite,
}: {
  tip: TipWithDetails
  onClick: () => void
  themeColor: string
  locale?: Locale
  isFavorite: boolean
  onToggleFavorite?: () => void
}) {
  // Traductions
  const { translated: tipTitle } = useClientTranslation(tip.title, 'fr', locale)
  const { translated: tipComment } = useClientTranslation(
    tip.comment || '',
    'fr',
    locale
  )

  // Image principale du conseil
  const mainImage = tip.media?.find((m) => m.type === 'image')
  const hasCoordinates = !!tip.coordinates_parsed

  return (
    <article
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group relative"
      onClick={onClick}
    >
      {/* Bouton favoris */}
      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite()
          }}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-all active:scale-95"
          aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <svg
            className={`w-5 h-5 transition-colors ${
              isFavorite ? 'fill-red-500 text-red-500' : 'fill-none text-gray-400'
            }`}
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      )}

      {/* Image */}
      <div className="relative h-48 sm:h-56 bg-gray-100">
        {mainImage ? (
          <Image
            src={mainImage.url}
            alt={tipTitle}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-4xl">📍</span>
          </div>
        )}

        {/* Badge rating si disponible */}
        {tip.rating && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium text-gray-800">
              {tip.rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Badge localisation */}
        {hasCoordinates && (
          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm p-1.5 rounded-full shadow-sm">
            <MapPin className="w-4 h-4" style={{ color: themeColor }} />
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
          {tipTitle}
        </h3>

        {tipComment && (
          <p className="text-gray-600 text-sm line-clamp-3">
            {tipComment}
          </p>
        )}

        {/* Lien externe si disponible */}
        {tip.route_url && (
          <div className="mt-3 flex items-center gap-1 text-sm" style={{ color: themeColor }}>
            <ExternalLink className="w-4 h-4" />
            <span className="truncate">{(() => { try { return new URL(tip.route_url).hostname } catch { return tip.route_url } })()}</span>
          </div>
        )}

        {/* Nombre de médias */}
        {tip.media && tip.media.length > 1 && (
          <div className="mt-3 text-xs text-gray-500">
            📷 {tip.media.length} photos/vidéos
          </div>
        )}
      </div>
    </article>
  )
}
