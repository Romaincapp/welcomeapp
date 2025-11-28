'use client'

import Image from 'next/image'
import { TipWithDetails } from '@/types'
import { MapPin, Edit, Trash2, Star, Heart } from 'lucide-react'
import { type Locale } from '@/i18n/request'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { FormattedDescription } from '@/components/FormattedDescription'

interface TipCardProps {
  tip: TipWithDetails
  onClick: () => void
  isEditMode?: boolean
  onEdit?: () => void
  onDelete?: () => void
  compact?: boolean
  themeColor?: string
  locale?: Locale
  showCategoryBadge?: boolean
  isFavorite?: boolean
  onToggleFavorite?: () => void
}

export default function TipCard({ tip, onClick, isEditMode = false, onEdit, onDelete, compact = false, themeColor = '#4F46E5', locale = 'fr', showCategoryBadge = true, isFavorite = false, onToggleFavorite }: TipCardProps) {
  const mainMedia = tip.media.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0]
  // Utiliser thumbnail_url pour les aperçus (plus léger), sinon fallback sur l'URL originale
  const thumbnailUrl = mainMedia?.thumbnail_url || mainMedia?.url

  // 🌍 Traduction côté client
  // ❌ NE PAS traduire le titre (nom de lieu/restaurant reste dans la langue d'origine)
  const title = tip.title

  // ✅ TRADUIRE le commentaire
  const { translated: translatedComment } = useClientTranslation(
    tip.comment || '',
    'fr',
    locale
  )

  // ✅ TRADUIRE le nom de catégorie
  const { translated: translatedCategoryName } = useClientTranslation(
    tip.category?.name || '',
    'fr',
    locale
  )
  const categoryName = tip.category ? translatedCategoryName : null

  // Mode compact pour les popups de carte
  if (compact) {
    return (
      <div
        data-tip-id={tip.id}
        className="relative w-28 xs:w-32 sm:w-36 bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition hover:scale-105 active:scale-95"
        onClick={onClick}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] w-full bg-gray-200">
          {mainMedia ? (
            mainMedia.type === 'image' ? (
              <Image
                src={thumbnailUrl || mainMedia.url}
                alt={title}
                fill
                className="object-cover"
                loading="lazy"
                quality={60}
                sizes="(max-width: 400px) 112px, (max-width: 640px) 128px, 144px"
              />
            ) : (
              <video
                src={mainMedia.url}
                className="w-full h-full object-cover"
                muted
                preload="none"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              Aucune image
            </div>
          )}

          {/* Catégorie badge */}
          {showCategoryBadge && tip.category && (
            <div
              className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-0.5"
              style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
            >
              <span>{categoryName}</span>
            </div>
          )}

          {/* Bouton favoris - visible uniquement pour les visiteurs */}
          {!isEditMode && onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite()
              }}
              className="absolute top-1.5 right-1.5 bg-white p-1 rounded-full shadow-lg hover:bg-gray-50 transition active:scale-95"
              aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              <Heart
                className={`w-3 h-3 transition ${
                  isFavorite
                    ? 'fill-red-500 text-red-500'
                    : 'text-gray-400'
                }`}
              />
            </button>
          )}
        </div>

        {/* Contenu */}
        <div className="p-2">
          {/* Note et prix */}
          {(tip.rating || tip.price_level !== null && tip.price_level !== undefined) && (
            <div className="flex items-center gap-1 mb-1">
              {tip.rating && (
                <div className="flex items-center gap-0.5 bg-yellow-50 px-1 py-0.5 rounded-full">
                  <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-[11px] font-bold text-gray-800">{tip.rating.toFixed(1)}</span>
                  {(tip.user_ratings_total ?? 0) > 0 && (
                    <span className="text-[11px] text-gray-500">({tip.user_ratings_total ?? 0})</span>
                  )}
                </div>
              )}
              {tip.price_level !== null && tip.price_level !== undefined && tip.price_level > 0 && (
                <div className="text-[11px] text-gray-600 font-semibold">
                  {'€'.repeat(tip.price_level)}
                </div>
              )}
            </div>
          )}
          <h3 className="text-sm font-bold line-clamp-2 leading-tight" style={{ color: themeColor }}>{title}</h3>
        </div>
      </div>
    )
  }

  // Mode normal pour les sections de conseils
  // Réduction de 15% par rapport aux tailles initiales
  return (
    <div
      data-tip-id={tip.id}
      className="relative flex-shrink-0 w-32 xs:w-40 sm:w-56 md:w-64 bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition hover:scale-105 active:scale-95"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full bg-gray-200">
        {mainMedia ? (
          mainMedia.type === 'image' ? (
            <Image
              src={thumbnailUrl || mainMedia.url}
              alt={title}
              fill
              className="object-cover"
              loading="lazy"
              quality={65}
              sizes="(max-width: 400px) 128px, (max-width: 640px) 160px, (max-width: 768px) 224px, 256px"
            />
          ) : (
            <video
              src={mainMedia.url}
              className="w-full h-full object-cover"
              muted
              preload="none"
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Aucune image
          </div>
        )}

        {/* Catégorie badge */}
        {showCategoryBadge && tip.category && (
          <div
            className="absolute top-1.5 xs:top-2 sm:top-3 left-1.5 xs:left-2 sm:left-3 px-1.5 py-0.5 xs:px-2 xs:py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-0.5 xs:gap-1 sm:gap-2"
            style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
          >
            <span>{categoryName}</span>
          </div>
        )}

        {/* Bouton favoris - visible uniquement pour les visiteurs */}
        {!isEditMode && onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite()
            }}
            className="absolute top-1.5 xs:top-2 sm:top-3 right-1.5 xs:right-2 sm:right-3 bg-white p-1 xs:p-1.5 sm:p-2 rounded-full shadow-lg hover:bg-gray-50 transition active:scale-95"
            aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Heart
              className={`w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 transition ${
                isFavorite
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-400'
              }`}
            />
          </button>
        )}
      </div>

      {/* Contenu */}
      <div className="p-2 xs:p-2.5 sm:p-4">
        {/* Note et prix */}
        {(tip.rating || tip.price_level !== null && tip.price_level !== undefined) && (
          <div className="flex items-center gap-1.5 xs:gap-2 mb-1.5 xs:mb-2">
            {tip.rating && (
              <div className="flex items-center gap-0.5 xs:gap-1 bg-yellow-50 px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full">
                <Star className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-xs sm:text-sm font-bold text-gray-800">{tip.rating.toFixed(1)}</span>
                {(tip.user_ratings_total ?? 0) > 0 && (
                  <span className="text-[11px] xs:text-xs sm:text-sm text-gray-500">({tip.user_ratings_total ?? 0})</span>
                )}
              </div>
            )}
            {tip.price_level !== null && tip.price_level !== undefined && tip.price_level > 0 && (
              <div className="text-xs xs:text-sm sm:text-base text-gray-600 font-semibold">
                {'€'.repeat(tip.price_level)}
              </div>
            )}
          </div>
        )}
        <h3 className="text-sm xs:text-base sm:text-xl font-bold line-clamp-2" style={{ color: themeColor }}>{title}</h3>
      </div>

      {/* Boutons d'édition et suppression */}
      {isEditMode && (
        <div className="absolute top-1.5 xs:top-2 sm:top-3 right-1.5 xs:right-2 sm:right-3 flex gap-1 sm:gap-2">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="bg-white p-1 xs:p-1.5 sm:p-2 rounded-full shadow-lg hover:bg-gray-100 transition active:scale-95"
            >
              <Edit className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-gray-700" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="bg-white p-1 xs:p-1.5 sm:p-2 rounded-full shadow-lg hover:bg-red-100 transition active:scale-95"
            >
              <Trash2 className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-red-600" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
