'use client'

import { useEffect } from 'react'
import { X, MapPin, Star, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { TipWithDetails, Category } from '@/types'
import { type Locale } from '@/i18n/request'
import { useClientTranslation } from '@/hooks/useClientTranslation'

/**
 * Nettoie le markdown brut et tronque le texte pour les cards compactes
 * - Supprime les balises markdown (**bold**, ==highlight==, __underline__, etc.)
 * - Tronque après ~120 caractères ou 2 phrases max
 */
function cleanAndTruncateText(text: string, maxLength: number = 120): string {
  if (!text) return ''

  // Nettoyer le markdown
  let cleaned = text
    .replace(/\*\*(.*?)\*\*/g, '$1')  // **bold** → bold
    .replace(/==(.*?)==/g, '$1')       // ==highlight== → highlight
    .replace(/__(.*?)__/g, '$1')       // __underline__ → underline
    .replace(/\*(.*?)\*/g, '$1')       // *italic* → italic
    .replace(/~~(.*?)~~/g, '$1')       // ~~strikethrough~~ → strikethrough
    .replace(/`(.*?)`/g, '$1')         // `code` → code
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // [link](url) → link
    .trim()

  // Tronquer après ~120 caractères ou après la première phrase complète
  if (cleaned.length <= maxLength) return cleaned

  // Chercher la fin de la première phrase dans les premiers caractères
  const firstSentenceEnd = cleaned.substring(0, maxLength + 50).search(/[.!?]\s/)

  if (firstSentenceEnd !== -1 && firstSentenceEnd < maxLength + 30) {
    // Tronquer à la fin de la phrase
    return cleaned.substring(0, firstSentenceEnd + 1)
  }

  // Sinon tronquer au dernier espace avant maxLength
  const lastSpace = cleaned.substring(0, maxLength).lastIndexOf(' ')
  if (lastSpace > maxLength * 0.7) {
    return cleaned.substring(0, lastSpace) + '...'
  }

  return cleaned.substring(0, maxLength) + '...'
}

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
      <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {/* Grille de conseils - 2 colonnes sur mobile pour afficher plus */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
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
      className="bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group relative"
      onClick={onClick}
    >
      {/* Bouton favoris - plus petit sur mobile */}
      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite()
          }}
          className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 z-10 p-1.5 sm:p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-all active:scale-95"
          aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <svg
            className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
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

      {/* Image - plus petite sur mobile */}
      <div className="relative h-28 sm:h-40 md:h-48 bg-gray-100">
        {mainImage ? (
          <Image
            src={mainImage.url}
            alt={tipTitle}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-2xl sm:text-4xl">📍</span>
          </div>
        )}

        {/* Badge rating si disponible - plus compact sur mobile */}
        {tip.rating && (
          <div className="absolute bottom-1.5 left-1.5 sm:bottom-3 sm:left-3 flex items-center gap-0.5 sm:gap-1 bg-white/95 backdrop-blur-sm px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full shadow-sm">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-xs sm:text-sm font-medium text-gray-800">
              {tip.rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Badge localisation - plus compact sur mobile */}
        {hasCoordinates && (
          <div className="absolute bottom-1.5 right-1.5 sm:bottom-3 sm:right-3 bg-white/95 backdrop-blur-sm p-1 sm:p-1.5 rounded-full shadow-sm">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: themeColor }} />
          </div>
        )}
      </div>

      {/* Contenu - plus compact sur mobile */}
      <div className="p-2 sm:p-3 md:p-4">
        <h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {tipTitle}
        </h3>

        {/* Commentaire tronqué et nettoyé - masqué sur mobile pour gagner de la place */}
        {tipComment && (
          <p className="hidden sm:block text-gray-600 text-sm line-clamp-2 mt-1">
            {cleanAndTruncateText(tipComment, 100)}
          </p>
        )}

        {/* Lien externe - masqué sur mobile */}
        {tip.route_url && (
          <div className="hidden sm:flex mt-2 items-center gap-1 text-xs sm:text-sm" style={{ color: themeColor }}>
            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="truncate">{(() => { try { return new URL(tip.route_url).hostname } catch { return tip.route_url } })()}</span>
          </div>
        )}

        {/* Nombre de médias - masqué sur mobile */}
        {tip.media && tip.media.length > 1 && (
          <div className="hidden sm:block mt-2 text-xs text-gray-500">
            📷 {tip.media.length} photos/vidéos
          </div>
        )}
      </div>
    </article>
  )
}
