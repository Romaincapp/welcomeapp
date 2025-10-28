/**
 * Hook React pour la traduction côté client
 *
 * Usage:
 * ```tsx
 * const { translated, isLoading } = useClientTranslation(
 *   tip.comment,
 *   'fr',
 *   'en'
 * )
 * ```
 */

import { useState, useEffect, useRef } from 'react'
import { translateClientSide } from '@/lib/client-translation'

interface UseClientTranslationResult {
  translated: string
  isLoading: boolean
  error: string | null
}

export function useClientTranslation(
  text: string,
  sourceLang: string,
  targetLang: string
): UseClientTranslationResult {
  const [translated, setTranslated] = useState(text)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Utiliser useRef pour éviter les re-renders inutiles
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    // Si la langue source et cible sont identiques, pas besoin de traduire
    if (sourceLang === targetLang) {
      setTranslated(text)
      setIsLoading(false)
      setError(null)
      return
    }

    // Si le texte est vide, pas besoin de traduire
    if (!text || text.trim() === '') {
      setTranslated(text)
      setIsLoading(false)
      setError(null)
      return
    }

    // Annuler la traduction précédente si elle est en cours
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Créer un nouveau AbortController pour cette traduction
    abortControllerRef.current = new AbortController()

    let isMounted = true

    async function translate() {
      setIsLoading(true)
      setError(null)

      try {
        const result = await translateClientSide(text, sourceLang, targetLang)

        if (isMounted) {
          setTranslated(result)
          setIsLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Translation failed'
          setError(errorMessage)
          setTranslated(text) // Fallback vers texte original
          setIsLoading(false)
        }
      }
    }

    translate()

    // Cleanup: Annuler la traduction si le composant est démonté
    return () => {
      isMounted = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [text, sourceLang, targetLang])

  return { translated, isLoading, error }
}

/**
 * Hook pour traduire plusieurs textes en parallèle
 *
 * Usage:
 * ```tsx
 * const { translations, isLoading } = useClientTranslationBatch(
 *   [tip1.comment, tip2.comment, tip3.comment],
 *   'fr',
 *   'en'
 * )
 * ```
 */
export function useClientTranslationBatch(
  texts: string[],
  sourceLang: string,
  targetLang: string
): { translations: string[]; isLoading: boolean } {
  const [translations, setTranslations] = useState<string[]>(texts)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (sourceLang === targetLang) {
      setTranslations(texts)
      setIsLoading(false)
      return
    }

    let isMounted = true

    async function translateAll() {
      setIsLoading(true)

      try {
        const promises = texts.map(text =>
          translateClientSide(text, sourceLang, targetLang)
        )
        const results = await Promise.all(promises)

        if (isMounted) {
          setTranslations(results)
          setIsLoading(false)
        }
      } catch (error) {
        if (isMounted) {
          setTranslations(texts) // Fallback vers textes originaux
          setIsLoading(false)
        }
      }
    }

    translateAll()

    return () => {
      isMounted = false
    }
  }, [texts.join('|'), sourceLang, targetLang])

  return { translations, isLoading }
}
