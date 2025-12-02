'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'

interface BackgroundCarouselProps {
  images: string[]
  interval?: number
}

export default function BackgroundCarousel({ images, interval = 5000 }: BackgroundCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [previousIndex, setPreviousIndex] = useState<number | null>(null)
  const animationKeyRef = useRef(0)

  useEffect(() => {
    if (images.length === 0) return

    const timer = setInterval(() => {
      setPreviousIndex(currentIndex)
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
      animationKeyRef.current += 1
    }, interval)

    return () => clearInterval(timer)
  }, [images.length, interval, currentIndex])

  // Nettoyer previousIndex après la transition de fade (1000ms)
  useEffect(() => {
    if (previousIndex === null) return
    const timeout = setTimeout(() => {
      setPreviousIndex(null)
    }, 1000)
    return () => clearTimeout(timeout)
  }, [previousIndex])

  if (images.length === 0) {
    return (
      <div className="bg-fixed-mobile bg-gradient-to-br from-indigo-500 to-purple-600 -z-10" />
    )
  }

  return (
    <div className="bg-fixed-mobile -z-10 overflow-hidden">
      {images.map((image, index) => {
        const isActive = index === currentIndex
        const isExiting = index === previousIndex

        // L'image active zoome de 1.15 → 1.0
        // L'image sortante reste à scale(1) pendant le fade-out
        // Les autres restent prêtes à scale(1.15)
        const getScale = () => {
          if (isActive) return 'scale(1)'
          if (isExiting) return 'scale(1)'
          return 'scale(1.15)'
        }

        return (
          <div
            key={image}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              isActive ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Container avec overflow hidden pour masquer le zoom */}
            <div className="absolute inset-0 overflow-hidden">
              <div
                key={isActive ? `active-${animationKeyRef.current}` : `idle-${index}`}
                className="absolute inset-0 will-change-transform"
                style={{
                  transform: isActive ? 'scale(1.15)' : getScale(),
                  animation: isActive ? `zoomOut ${interval}ms ease-out forwards` : 'none',
                }}
              >
                <Image
                  src={image}
                  alt={`Background ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  loading={index === 0 ? undefined : 'lazy'}
                  quality={75}
                  sizes="100vw"
                />
              </div>
            </div>
            <div className="absolute inset-0 bg-black/40" />
          </div>
        )
      })}

      {/* Animation CSS pour le zoom arrière fluide */}
      <style jsx>{`
        @keyframes zoomOut {
          from {
            transform: scale(1.15);
          }
          to {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}
