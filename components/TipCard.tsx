'use client'

import Image from 'next/image'
import { TipWithDetails } from '@/types'
import { MapPin, Edit, Trash2 } from 'lucide-react'

interface TipCardProps {
  tip: TipWithDetails
  onClick: () => void
  isEditMode?: boolean
  onEdit?: () => void
  onDelete?: () => void
  compact?: boolean
}

export default function TipCard({ tip, onClick, isEditMode = false, onEdit, onDelete, compact = false }: TipCardProps) {
  const mainMedia = tip.media.sort((a, b) => a.order - b.order)[0]

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
                src={mainMedia.url}
                alt={tip.title}
                fill
                className="object-cover"
              />
            ) : (
              <video
                src={mainMedia.url}
                className="w-full h-full object-cover"
                muted
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              Aucune image
            </div>
          )}

          {/* Catégorie badge */}
          {tip.category && (
            <div className="absolute top-1.5 left-1.5 bg-white bg-opacity-90 px-1.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-0.5">
              {tip.category.icon && <span className="text-xs">{tip.category.icon}</span>}
              <span>{tip.category.name}</span>
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="p-2">
          <h3 className="text-sm font-bold mb-1 line-clamp-2 leading-tight">{tip.title}</h3>
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
  return (
    <div
      className="relative flex-shrink-0 w-52 xs:w-56 sm:w-64 md:w-72 bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition hover:scale-105 active:scale-95"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-36 xs:h-40 sm:h-44 md:h-48 bg-gray-200">
        {mainMedia ? (
          mainMedia.type === 'image' ? (
            <Image
              src={mainMedia.url}
              alt={tip.title}
              fill
              className="object-cover"
            />
          ) : (
            <video
              src={mainMedia.url}
              className="w-full h-full object-cover"
              muted
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Aucune image
          </div>
        )}

        {/* Catégorie badge */}
        {tip.category && (
          <div className="absolute top-1.5 xs:top-2 sm:top-3 left-1.5 xs:left-2 sm:left-3 bg-white bg-opacity-90 px-1.5 py-0.5 xs:px-2 xs:py-1 sm:px-3 sm:py-1 rounded-full text-[10px] xs:text-xs sm:text-sm font-semibold flex items-center gap-0.5 xs:gap-1 sm:gap-2">
            {tip.category.icon && <span className="text-xs xs:text-sm sm:text-base">{tip.category.icon}</span>}
            <span>{tip.category.name}</span>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-2.5 xs:p-3 sm:p-4">
        <h3 className="text-base xs:text-lg sm:text-xl font-bold mb-1 xs:mb-1 sm:mb-2 line-clamp-2">{tip.title}</h3>
        {tip.comment && (
          <p className="text-gray-600 text-[10px] xs:text-xs sm:text-sm line-clamp-2 mb-1.5 xs:mb-2 sm:mb-3">{tip.comment}</p>
        )}
        {tip.location && (
          <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-2 text-gray-500 text-[10px] xs:text-xs sm:text-sm">
            <MapPin className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="line-clamp-1">{tip.location}</span>
          </div>
        )}
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
