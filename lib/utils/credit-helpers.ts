/**
 * Helpers pour le système de crédits
 * Fonctions utilitaires synchrones (non async)
 */

/**
 * Calcule le score de personnalisation (100-150%)
 * 100% = copié-collé, 150% = ultra personnalisé
 */
export function calculatePersonalizationScore(
  templateContent: string,
  userContent: string
): number {
  try {
    // Nettoyage des contenus
    const cleanTemplate = templateContent.toLowerCase().trim()
    const cleanUser = userContent.toLowerCase().trim()

    // Si identique = 100% (copié-collé)
    if (cleanTemplate === cleanUser) {
      return 100
    }

    // Calcul de similarité basé sur le nombre de mots modifiés
    const templateWords = cleanTemplate.split(/\s+/)
    const userWords = cleanUser.split(/\s+/)

    // Calcul de mots différents
    const templateSet = new Set(templateWords)
    const userSet = new Set(userWords)

    let commonWords = 0
    templateSet.forEach(word => {
      if (userSet.has(word)) commonWords++
    })

    const totalWords = Math.max(templateWords.length, userWords.length)
    const similarityRatio = commonWords / totalWords

    // Conversion en score 100-150%
    // 100% similarité = 100 score
    // 0% similarité = 150 score
    const score = Math.round(100 + (1 - similarityRatio) * 50)

    // Clamp entre 100 et 150
    return Math.max(100, Math.min(150, score))
  } catch (error) {
    console.error('[CALCULATE PERSONALIZATION SCORE] Erreur:', error)
    return 100 // Défaut conservateur
  }
}

/**
 * Calcule les crédits gagnés selon plateforme, type et score
 */
export function getCreditsForScore(
  platform: string,
  postType: string,
  personalizationScore: number
): number {
  // Base selon type de post
  const baseCredits: Record<string, Record<string, number>> = {
    linkedin: { post: 90, story: 30 },
    facebook: { post: 90, story: 21 },
    instagram: { post: 90, story: 21 },
    twitter: { post: 60, story: 21 },
    blog: { post: 180, story: 0 },
    newsletter: { post: 120, story: 0 }
  }

  const base = baseCredits[platform]?.[postType] || 30

  // Application du multiplicateur de personnalisation
  // 100% = 1x (100% des crédits)
  // 125% = 1.25x (125% des crédits)
  // 150% = 1.5x (150% des crédits)
  const multiplier = personalizationScore / 100
  const finalCredits = Math.round(base * multiplier)

  return finalCredits
}
