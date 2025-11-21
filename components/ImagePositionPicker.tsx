'use client'

import { useState, useEffect, useRef } from 'react'
import { Move, RotateCcw } from 'lucide-react'

interface ImagePositionPickerProps {
  imageUrl: string | null
  initialPosition?: string
  onPositionChange: (position: string) => void
}

export default function ImagePositionPicker({
  imageUrl,
  initialPosition = '50% 50%',
  onPositionChange,
}: ImagePositionPickerProps) {
  const [positionX, setPositionX] = useState(50)
  const [positionY, setPositionY] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Parser la position initiale
  useEffect(() => {
    if (initialPosition && initialPosition.includes('%')) {
      const [x, y] = initialPosition.split(' ').map(v => parseInt(v))
      setPositionX(x || 50)
      setPositionY(y || 50)
    }
  }, [initialPosition])

  // Calculer la position basée sur les coordonnées du clic/touch
  const calculatePosition = (clientX: number, clientY: number) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * 100
    const y = ((clientY - rect.top) / rect.height) * 100

    // Clamp entre 0 et 100
    const clampedX = Math.max(0, Math.min(100, x))
    const clampedY = Math.max(0, Math.min(100, y))

    setPositionX(Math.round(clampedX))
    setPositionY(Math.round(clampedY))
    onPositionChange(`${Math.round(clampedX)}% ${Math.round(clampedY)}%`)
  }

  // Handlers souris (desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    calculatePosition(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    calculatePosition(e.clientX, e.clientY)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  // Handlers tactile (mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    const touch = e.touches[0]
    calculatePosition(touch.clientX, touch.clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    e.preventDefault() // Empêche le scroll pendant le drag
    const touch = e.touches[0]
    calculatePosition(touch.clientX, touch.clientY)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Reset vers le centre
  const handleReset = () => {
    setPositionX(50)
    setPositionY(50)
    onPositionChange('50% 50%')
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
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Position sur mobile
          </label>
          <p className="text-xs text-gray-600">
            Cliquez ou glissez pour ajuster la zone visible
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Centrer
        </button>
      </div>

      {/* Zone de drag interactive */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 flex justify-center items-center">
        {/* Simulateur de téléphone */}
        <div className="relative">
          <div
            ref={containerRef}
            className={`relative w-52 h-[26rem] bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border-[6px] border-gray-900 ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-3xl z-20" />

            {/* Image de fond */}
            <div
              className="absolute inset-0 transition-none"
              style={{
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: `${positionX}% ${positionY}%`,
                backgroundRepeat: 'no-repeat',
              }}
            />

            {/* Overlay avec instructions */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-10">
              <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2">
                <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full">
                  <div className="flex items-center gap-2 text-white">
                    <Move className="w-4 h-4" />
                    <span className="text-xs font-medium">
                      {positionX}% × {positionY}%
                    </span>
                  </div>
                </div>
                {!isDragging && (
                  <p className="text-white/80 text-[10px] font-medium px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                    Cliquez et glissez
                  </p>
                )}
              </div>
            </div>

            {/* Point focal (croix) */}
            <div
              className="absolute w-8 h-8 pointer-events-none z-10 transition-opacity"
              style={{
                left: `${positionX}%`,
                top: `${positionY}%`,
                transform: 'translate(-50%, -50%)',
                opacity: isDragging ? 1 : 0.4,
              }}
            >
              {/* Croix centrale */}
              <div className="absolute inset-0">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white shadow-lg -translate-y-1/2" />
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white shadow-lg -translate-x-1/2" />
              </div>
              {/* Cercle central */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full shadow-lg ring-2 ring-indigo-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Aperçu de comment l'image sera cadrée sur les smartphones
      </p>
    </div>
  )
}
