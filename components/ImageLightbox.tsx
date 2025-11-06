'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Dialog, DialogContent, DialogPortal, DialogOverlay } from '@/components/ui/dialog'
import { ImageLightboxProps } from '@/types'

export default function ImageLightbox({
  media,
  selectedIndex,
  isOpen,
  onClose,
  tipTitle = '',
  themeColor = '#3b82f6',
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(selectedIndex)

  // Reset current index when selectedIndex changes
  useEffect(() => {
    setCurrentIndex(selectedIndex)
  }, [selectedIndex])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft') {
        handlePrev()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex, media.length])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length)
  }

  if (!media || media.length === 0) return null

  const currentMedia = media[currentIndex]
  const isImage = currentMedia?.type === 'image'
  const isVideo = currentMedia?.type === 'video'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="bg-black/95 backdrop-blur-sm" />
        <DialogContent
          className="max-w-[100vw] w-screen h-screen max-h-screen p-0 border-0 bg-transparent focus:outline-none focus-visible:ring-0"
          aria-describedby={undefined}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-[60] p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors text-white"
            aria-label="Fermer"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Counter */}
          {media.length > 1 && (
            <div className="absolute top-4 left-4 z-[60] px-3 py-1.5 rounded-full bg-black/50 text-white text-sm font-medium">
              {currentIndex + 1} / {media.length}
            </div>
          )}

          {/* Title */}
          {tipTitle && (
            <div className="absolute top-16 left-4 right-4 z-[60] text-center">
              <h2 className="text-white text-lg font-semibold drop-shadow-lg">{tipTitle}</h2>
            </div>
          )}

          {/* Main content container */}
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Previous button */}
            {media.length > 1 && (
              <button
                onClick={handlePrev}
                className="absolute left-4 z-[60] p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors text-white"
                style={{ backgroundColor: `${themeColor}33` }}
                aria-label="Image précédente"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Media display */}
            <div className="relative w-full h-full flex items-center justify-center p-4">
              {isImage && (
                <div className="relative w-full h-full max-w-7xl max-h-[90vh]">
                  <Image
                    src={currentMedia.url}
                    alt={tipTitle || 'Image'}
                    fill
                    className="object-contain"
                    quality={85}
                    priority
                    sizes="100vw"
                  />
                </div>
              )}

              {isVideo && (
                <video
                  src={currentMedia.url}
                  controls
                  autoPlay
                  className="max-w-7xl max-h-[90vh] w-full h-full object-contain"
                >
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
              )}
            </div>

            {/* Next button */}
            {media.length > 1 && (
              <button
                onClick={handleNext}
                className="absolute right-4 z-[60] p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors text-white"
                style={{ backgroundColor: `${themeColor}33` }}
                aria-label="Image suivante"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Pagination indicators */}
          {media.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[60] flex gap-2">
              {media.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'w-8 bg-white'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Aller à l'image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
