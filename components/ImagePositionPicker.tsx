'use client'

import { useState, useEffect } from 'react'
import { Move } from 'lucide-react'

interface ImagePositionPickerProps {
  imageUrl: string | null
  initialPosition?: string
  onPositionChange: (position: string) => void
}

export default function ImagePositionPicker({
  imageUrl,
  initialPosition = 'center',
  onPositionChange,
}: ImagePositionPickerProps) {
  const [position, setPosition] = useState(initialPosition)
  const [customX, setCustomX] = useState(50)
  const [customY, setCustomY] = useState(50)

  // Positions prédéfinies
  const presetPositions = [
    { value: 'top', label: 'Haut' },
    { value: 'center', label: 'Centre' },
    { value: 'bottom', label: 'Bas' },
    { value: 'left', label: 'Gauche' },
    { value: 'right', label: 'Droite' },
    { value: 'custom', label: 'Personnalisé' },
  ]

  useEffect(() => {
    // Parser la position initiale
    if (initialPosition.includes('%')) {
      const [x, y] = initialPosition.split(' ').map(v => parseInt(v))
      setCustomX(x || 50)
      setCustomY(y || 50)
      setPosition('custom')
    } else {
      setPosition(initialPosition)
    }
  }, [initialPosition])

  const handlePositionChange = (newPosition: string) => {
    setPosition(newPosition)
    if (newPosition === 'custom') {
      onPositionChange(`${customX}% ${customY}%`)
    } else {
      onPositionChange(newPosition)
    }
  }

  const handleCustomChange = (x: number, y: number) => {
    setCustomX(x)
    setCustomY(y)
    if (position === 'custom') {
      onPositionChange(`${x}% ${y}%`)
    }
  }

  if (!imageUrl) {
    return (
      <div className="text-center text-gray-500 text-sm py-4">
        Téléchargez d'abord une image de fond pour ajuster la position mobile
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Position sur mobile
        </label>
        <p className="text-xs text-gray-600 mb-3">
          Choisissez comment l'image sera cadrée sur les écrans mobiles
        </p>

        {/* Positions prédéfinies */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {presetPositions.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => handlePositionChange(preset.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                position === preset.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Contrôles personnalisés */}
        {position === 'custom' && (
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Position horizontale: {customX}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={customX}
                onChange={(e) => handleCustomChange(parseInt(e.target.value), customY)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Position verticale: {customY}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={customY}
                onChange={(e) => handleCustomChange(customX, parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Aperçu mobile */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Aperçu mobile
        </label>
        <div className="bg-gray-900 rounded-lg p-4 flex justify-center items-center">
          {/* Simulateur de téléphone */}
          <div className="relative w-48 h-96 bg-white rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-800">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-10" />

            {/* Aperçu de l'image */}
            <div
              className="absolute inset-0 bg-cover"
              style={{
                backgroundImage: `url(${imageUrl})`,
                backgroundPosition: position === 'custom' ? `${customX}% ${customY}%` : position,
              }}
            >
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Move className="w-8 h-8 text-white opacity-50" />
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Cet aperçu simule comment l'image apparaîtra sur mobile
        </p>
      </div>
    </div>
  )
}
