/**
 * Helper pour traduire automatiquement du texte via l'API OpenAI
 */

export type SupportedLanguage = 'en' | 'es' | 'nl' | 'de' | 'it' | 'pt'

export interface TranslationResult {
  [key: string]: string
}

/**
 * Traduit un texte en plusieurs langues via l'API /api/translate
 */
export async function translateText(
  text: string,
  targetLanguages: SupportedLanguage[],
  context?: string
): Promise<TranslationResult> {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        targetLanguages,
        context,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erreur lors de la traduction')
    }

    const data = await response.json()
    return data.translations
  } catch (error) {
    console.error('[translateText] Erreur:', error)
    throw error
  }
}

/**
 * Traduit tous les champs d'un objet (ex: title, comment) en plusieurs langues
 */
export async function translateFields(
  fields: Record<string, string>,
  targetLanguages: SupportedLanguage[],
  context?: string
): Promise<Record<string, TranslationResult>> {
  const results: Record<string, TranslationResult> = {}

  for (const [fieldName, fieldValue] of Object.entries(fields)) {
    if (fieldValue && fieldValue.trim()) {
      try {
        results[fieldName] = await translateText(fieldValue, targetLanguages, context)
      } catch (error) {
        console.error(`[translateFields] Erreur pour le champ "${fieldName}":`, error)
        // En cas d'erreur, on met des chaînes vides pour les traductions
        results[fieldName] = Object.fromEntries(
          targetLanguages.map((lang) => [lang, ''])
        )
      }
    } else {
      // Champ vide, on met des chaînes vides pour toutes les langues
      results[fieldName] = Object.fromEntries(
        targetLanguages.map((lang) => [lang, ''])
      )
    }
  }

  return results
}

/**
 * Langues supportées par le système
 */
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'es', 'nl', 'de', 'it', 'pt']

/**
 * Génère un commentaire inspiré des avis Google via l'API OpenAI
 */
export async function generateCommentFromReviews(
  reviews: Array<{
    author_name: string
    rating: number
    text: string
    relative_time_description: string
  }>,
  placeName: string,
  rating: number | null,
  userRatingsTotal: number
): Promise<string> {
  try {
    if (!reviews || reviews.length === 0) {
      return ''
    }

    const response = await fetch('/api/generate-comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reviews,
        placeName,
        rating,
        userRatingsTotal,
      }),
    })

    if (!response.ok) {
      console.warn('[generateCommentFromReviews] Erreur API:', response.status)
      return ''
    }

    const data = await response.json()
    return data.comment || ''
  } catch (error) {
    console.error('[generateCommentFromReviews] Erreur:', error)
    return ''
  }
}
