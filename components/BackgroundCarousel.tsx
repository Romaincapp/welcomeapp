'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface BackgroundCarouselProps {
  images: string[]
  interval?: number
}

export default function BackgroundCarousel({ images, interval = 5000 }: BackgroundCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (images.length === 0) return

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, interval)

    return () => clearInterval(timer)
  }, [images.length, interval])

  if (images.length === 0) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 -z-10" />
    )
  }

  return (
    <div className="fixed inset-0 -z-10">
      {images.map((image, index) => (
        <div
          key={image}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={image}
            alt={`Background ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0}
            quality={90}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ))}
    </div>
  )
}
