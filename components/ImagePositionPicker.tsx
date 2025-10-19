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

  // Positions prédéfinies avec valeurs en pourcentage pour un meilleur contrôle
  const presetPositions = [
    { value: '50% 0%', label: 'Haut', desc: 'Centré en haut' },
    { value: '50% 50%', label: 'Centre', desc: 'Centré' },
    { value: '50% 100%', label: 'Bas', desc: 'Centré en bas' },
    { value: '0% 50%', label: 'Gauche', desc: 'À gauche' },
    { value: '100% 50%', label: 'Droite', desc: 'À droite' },
    { value: '50% 30%', label: 'Haut-Centre', desc: 'Légèrement haut' },
    { value: '50% 70%', label: 'Bas-Centre', desc: 'Légèrement bas' },
    { value: 'custom', label: 'Personnalisé', desc: 'Valeur libre' },
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
    } else if (newPosition.includes('%')) {
      // Si c'est une position prédéfinie en pourcentage, extraire X et Y pour l'aperçu
      const [x, y] = newPosition.split(' ').map(v => parseInt(v))
      setCustomX(x)
      setCustomY(y)
      onPositionChange(newPosition)
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {presetPositions.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => handlePositionChange(preset.value)}
              className={`px-2 py-2 rounded-lg text-left transition ${
                position === preset.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="text-xs font-semibold">{preset.label}</div>
              <div className="text-[10px] opacity-75 mt-0.5">{preset.desc}</div>
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

            {/* Aperçu de l'image - utilise auto 100% pour correspondre au mobile */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: 'auto 100%',
                backgroundPosition: position === 'custom' || position.includes('%')
                  ? `${customX}% ${customY}%`
                  : position,
                backgroundRepeat: 'no-repeat',
              }}
            >
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-center">
                  <Move className="w-8 h-8 text-white opacity-50 mx-auto mb-1" />
                  <div className="text-white text-[10px] opacity-75 bg-black/50 px-2 py-1 rounded">
                    {customX}% / {customY}%
                  </div>
                </div>
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
