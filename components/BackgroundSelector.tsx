'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Check } from 'lucide-react'
import { AVAILABLE_BACKGROUNDS, type BackgroundOption } from '@/lib/backgrounds'

interface BackgroundSelectorProps {
  selectedBackground: string
  onSelectBackground: (backgroundPath: string) => void
  className?: string
}

export default function BackgroundSelector({
  selectedBackground,
  onSelectBackground,
  className = ''
}: BackgroundSelectorProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const handleSelect = (background: BackgroundOption) => {
    onSelectBackground(background.path)
  }

  return (
    <div className={`background-selector ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Choisissez votre image de fond
        </h3>
        <p className="text-sm text-gray-600">
          Vous pourrez la modifier à tout moment en mode édition
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {AVAILABLE_BACKGROUNDS.map((background) => {
          const isSelected = selectedBackground === background.path
          const isLoading = loadingStates[background.id]

          return (
            <button
              key={background.id}
              onClick={() => handleSelect(background)}
              className={`
                relative aspect-video rounded-lg overflow-hidden border-2 transition-all
                hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500
                ${isSelected
                  ? 'border-indigo-600 ring-2 ring-indigo-500 shadow-lg'
                  : 'border-gray-200 hover:border-indigo-300'
                }
              `}
              title={background.description}
            >
              <Image
                src={background.path}
                alt={background.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
                loading="lazy"
                quality={50}
                onLoadingComplete={() =>
                  setLoadingStates(prev => ({ ...prev, [background.id]: false }))
                }
              />

              {/* Overlay avec le nom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 flex items-end p-2">
                <span className="text-white text-sm font-medium drop-shadow-lg">
                  {background.name}
                </span>
              </div>

              {/* Badge de sélection */}
              {isSelected && (
                <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1 shadow-lg">
                  <Check size={16} />
                </div>
              )}

              {/* Loading state */}
              {isLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              )}
            </button>
          )
        })}
      </div>

      <style jsx>{`
        .background-selector {
          width: 100%;
        }
      `}</style>
    </div>
  )
}
