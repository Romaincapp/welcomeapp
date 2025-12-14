'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react'
import { TipWithDetails } from '@/types'
import { HikeData } from '@/types'
import HikeDisplay from './HikeDisplay'
import Image from 'next/image'

interface FullScreenHikeModalProps {
  tip: TipWithDetails
  isOpen: boolean
  onClose: () => void
  themeColor?: string
}

export default function FullScreenHikeModal({
  tip,
  isOpen,
  onClose,
  themeColor = '#4F46E5'
}: FullScreenHikeModalProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [showFullMedia, setShowFullMedia] = useState(false)

  // Reset quand le tip change
  useEffect(() => {
    setCurrentMediaIndex(0)
    setShowFullMedia(false)
  }, [tip?.id])

  if (!isOpen || !tip) return null

  const sortedMedia = tip.media.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const hikeData = tip.hike_data as HikeData | null

  const nextMedia = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % sortedMedia.length)
  }

  const prevMedia = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + sortedMedia.length) % sortedMedia.length)
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      {/* Header fixe */}
      <div
        className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-white text-xl font-bold line-clamp-1">{tip.title}</h2>
            {tip.category && (
              <p className="text-white/80 text-sm mt-1">{tip.category.name}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Layout: Image compacte + Carte grande */}
      <div className="h-full flex flex-col">
        {/* Miniature média (compacte, 20% de hauteur) */}
        {sortedMedia.length > 0 && (
          <div className="relative h-[20vh] bg-gray-900 flex-shrink-0">
            <button
              onClick={() => setShowFullMedia(!showFullMedia)}
              className="absolute top-2 right-2 z-10 p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition"
            >
              {showFullMedia ? (
                <Minimize2 className="w-5 h-5 text-white" />
              ) : (
                <Maximize2 className="w-5 h-5 text-white" />
              )}
            </button>

            {sortedMedia[currentMediaIndex].type === 'image' ? (
              <Image
                src={sortedMedia[currentMediaIndex].url}
                alt={tip.title}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            ) : (
              <video
                src={sortedMedia[currentMediaIndex].url}
                className="w-full h-full object-cover"
                controls
                playsInline
              />
            )}

            {/* Contrôles carrousel */}
            {sortedMedia.length > 1 && (
              <>
                <button
                  onClick={prevMedia}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={nextMedia}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>

                {/* Indicateurs */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {sortedMedia.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentMediaIndex(index)}
                      className={`w-2 h-2 rounded-full transition ${
                        index === currentMediaIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Zone carte et guidage (80% de hauteur) */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="p-4 max-w-6xl mx-auto">
            {hikeData ? (
              <HikeDisplay hikeData={hikeData} />
            ) : (
              <div className="bg-white rounded-xl p-8 text-center">
                <p className="text-gray-500">Aucune donnée de randonnée disponible</p>
              </div>
            )}

            {/* Infos supplémentaires en dessous */}
            {tip.comment && (
              <div className="mt-4 bg-white rounded-xl p-4">
                <h3 className="font-bold text-lg mb-2" style={{ color: themeColor }}>
                  Description
                </h3>
                <p className="text-gray-700">{tip.comment}</p>
              </div>
            )}

            {/* Contact compact */}
            {(tip.contact_phone || tip.contact_email || tip.location) && (
              <div className="mt-4 bg-white rounded-xl p-4">
                <h3 className="font-bold text-lg mb-3" style={{ color: themeColor }}>
                  Informations pratiques
                </h3>
                <div className="space-y-2 text-sm">
                  {tip.location && (
                    <p className="text-gray-700">📍 {tip.location}</p>
                  )}
                  {tip.contact_phone && (
                    <p className="text-gray-700">📞 {tip.contact_phone}</p>
                  )}
                  {tip.contact_email && (
                    <p className="text-gray-700">✉️ {tip.contact_email}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox image plein écran */}
      {showFullMedia && sortedMedia[currentMediaIndex].type === 'image' && (
        <div
          className="fixed inset-0 z-30 bg-black flex items-center justify-center"
          onClick={() => setShowFullMedia(false)}
        >
          <Image
            src={sortedMedia[currentMediaIndex].url}
            alt={tip.title}
            fill
            className="object-contain"
            sizes="100vw"
          />
          <button
            onClick={() => setShowFullMedia(false)}
            className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      )}
    </div>
  )
}
