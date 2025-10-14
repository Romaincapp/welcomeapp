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
}

export default function TipCard({ tip, onClick, isEditMode = false, onEdit, onDelete }: TipCardProps) {
  const mainMedia = tip.media.sort((a, b) => a.order - b.order)[0]

  return (
    <div
      className="relative flex-shrink-0 w-72 bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition hover:scale-105"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
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
          <div className="absolute top-3 left-3 bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
            {tip.category.icon && <span>{tip.category.icon}</span>}
            <span>{tip.category.name}</span>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2 line-clamp-2">{tip.title}</h3>
        {tip.comment && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{tip.comment}</p>
        )}
        {tip.location && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{tip.location}</span>
          </div>
        )}
      </div>

      {/* Boutons d'édition et suppression */}
      {isEditMode && (
        <div className="absolute top-3 right-3 flex gap-2">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition"
            >
              <Edit className="w-4 h-4 text-gray-700" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="bg-white p-2 rounded-full shadow-lg hover:bg-red-100 transition"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
