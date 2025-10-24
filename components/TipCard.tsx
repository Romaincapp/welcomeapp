'use client'

import Image from 'next/image'
import { TipWithDetails } from '@/types'
import { MapPin, Edit, Trash2, Star } from 'lucide-react'

interface TipCardProps {
  tip: TipWithDetails
  onClick: () => void
  isEditMode?: boolean
  onEdit?: () => void
  onDelete?: () => void
  compact?: boolean
  themeColor?: string
}

export default function TipCard({ tip, onClick, isEditMode = false, onEdit, onDelete, compact = false, themeColor = '#4F46E5' }: TipCardProps) {
  const mainMedia = tip.media.sort((a, b) => a.order - b.order)[0]
  // Utiliser thumbnail_url pour les aperçus (plus léger), sinon fallback sur l'URL originale
  const thumbnailUrl = mainMedia?.thumbnail_url || mainMedia?.url

  // Mode compact pour les popups de carte
  if (compact) {
    return (
      <div
        className="relative w-full bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition hover:scale-105 active:scale-95"
        onClick={onClick}
        style={{ width: '180px' }}
      >
        {/* Image */}
        <div className="relative h-28 bg-gray-200">
          {mainMedia ? (
            mainMedia.type === 'image' ? (
              <Image
                src={thumbnailUrl || mainMedia.url}
                alt={tip.title}
                fill
                className="object-cover"
                loading="lazy"
                quality={60}
                sizes="180px"
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
          {tip.category && (
            <div
              className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-0.5"
              style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
            >
              {tip.category.icon && <span className="text-xs">{tip.category.icon}</span>}
              <span>{tip.category.name}</span>
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="p-2">
          {/* Note et prix */}
          {(tip.rating || tip.price_level !== null && tip.price_level !== undefined) && (
            <div className="flex items-center gap-1 mb-1">
              {tip.rating && (
                <div className="flex items-center gap-0.5 bg-yellow-50 px-1 py-0.5 rounded-full">
                  <Star className="w-2 h-2 fill-yellow-400 text-yellow-400" />
                  <span className="text-[9px] font-bold text-gray-800">{tip.rating.toFixed(1)}</span>
                  {tip.user_ratings_total > 0 && (
                    <span className="text-[8px] text-gray-500">({tip.user_ratings_total})</span>
                  )}
                </div>
              )}
              {tip.price_level !== null && tip.price_level !== undefined && tip.price_level > 0 && (
                <div className="text-[9px] text-gray-600 font-semibold">
                  {'€'.repeat(tip.price_level)}
                </div>
              )}
            </div>
          )}
          <h3 className="text-sm font-bold mb-1 line-clamp-2 leading-tight" style={{ color: themeColor }}>{tip.title}</h3>
          {tip.comment && (
            <p className="text-gray-600 text-[10px] line-clamp-2 mb-1.5 leading-snug">{tip.comment}</p>
          )}
          {tip.location && (
            <div className="flex items-center gap-0.5 text-gray-500 text-[10px]">
              <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="line-clamp-1">{tip.location}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Mode normal pour les sections de conseils
  // Réduction de 10% supplémentaires sur mobile: w-44 -> w-40 (176px -> 160px soit -9%)
  return (
    <div
      className="relative flex-shrink-0 w-40 xs:w-44 sm:w-64 md:w-72 bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition hover:scale-105 active:scale-95"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-28 xs:h-32 sm:h-44 md:h-48 bg-gray-200">
        {mainMedia ? (
          mainMedia.type === 'image' ? (
            <Image
              src={thumbnailUrl || mainMedia.url}
              alt={tip.title}
              fill
              className="object-cover"
              loading="lazy"
              quality={65}
              sizes="(max-width: 400px) 160px, (max-width: 640px) 176px, (max-width: 768px) 256px, 288px"
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
        {tip.category && (
          <div
            className="absolute top-1.5 xs:top-2 sm:top-3 left-1.5 xs:left-2 sm:left-3 px-1.5 py-0.5 xs:px-2 xs:py-1 sm:px-3 sm:py-1 rounded-full text-[10px] xs:text-xs sm:text-sm font-semibold flex items-center gap-0.5 xs:gap-1 sm:gap-2"
            style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
          >
            {tip.category.icon && <span className="text-xs xs:text-sm sm:text-base">{tip.category.icon}</span>}
            <span>{tip.category.name}</span>
          </div>
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
                <span className="text-[10px] xs:text-xs sm:text-sm font-bold text-gray-800">{tip.rating.toFixed(1)}</span>
                {tip.user_ratings_total > 0 && (
                  <span className="text-[9px] xs:text-[10px] sm:text-xs text-gray-500">({tip.user_ratings_total})</span>
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
        <h3 className="text-sm xs:text-base sm:text-xl font-bold line-clamp-2" style={{ color: themeColor }}>{tip.title}</h3>
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
