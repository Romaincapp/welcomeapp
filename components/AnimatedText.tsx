'use client'

import { useState, useEffect } from 'react'

interface AnimatedTextProps {
  texts: string[]
  className?: string
  typingSpeed?: number
  deletingSpeed?: number
  pauseDuration?: number
}

export default function AnimatedText({
  texts,
  className = '',
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000
}: AnimatedTextProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const currentFullText = texts[currentTextIndex]

    // Si on est en pause, attendre avant de supprimer
    if (isPaused) {
      const pauseTimeout = setTimeout(() => {
        setIsPaused(false)
        setIsDeleting(true)
      }, pauseDuration)
      return () => clearTimeout(pauseTimeout)
    }

    // Si on est en train de supprimer
    if (isDeleting) {
      if (displayedText === '') {
        // Texte complètement supprimé, passer au suivant
        setIsDeleting(false)
        setCurrentTextIndex((prev) => (prev + 1) % texts.length)
        return
      }

      const timeout = setTimeout(() => {
        setDisplayedText(currentFullText.substring(0, displayedText.length - 1))
      }, deletingSpeed)

      return () => clearTimeout(timeout)
    }

    // Si on est en train d'écrire
    if (displayedText !== currentFullText) {
      const timeout = setTimeout(() => {
        setDisplayedText(currentFullText.substring(0, displayedText.length + 1))
      }, typingSpeed)

      return () => clearTimeout(timeout)
    }

    // Texte complètement écrit, mettre en pause
    if (displayedText === currentFullText && !isPaused) {
      setIsPaused(true)
    }
  }, [
    displayedText,
    isDeleting,
    isPaused,
    currentTextIndex,
    texts,
    typingSpeed,
    deletingSpeed,
    pauseDuration
  ])

  return (
    <span className={className}>
      {displayedText}
      <span className="animate-pulse">|</span>
    </span>
  )
}
