/**
 * Utilitaires améliorés pour la détection de doublons SmartFill
 * Résout les problèmes de faux positifs du substring matching
 */

/**
 * Normalisation avancée d'une chaîne
 * - Supprime accents (é → e)
 * - Convertit cédille (ç → c)
 * - Convertit ligatures (œ → oe, æ → ae)
 * - Supprime apostrophes et tirets
 * - Convertit espaces multiples en un seul
 */
export function normalizeAdvanced(str: string): string {
  if (!str) return ''

  return str
    .toLowerCase()
    // Normalisation Unicode NFD (décompose é en e + accent)
    .normalize('NFD')
    // Supprime les accents (diacritiques)
    .replace(/[\u0300-\u036f]/g, '')
    // Caractères spéciaux français
    .replace(/ç/g, 'c')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    // Apostrophes (variantes)
    .replace(/[''ʼ]/g, ' ')
    // Tirets et traits d'union → espaces
    .replace(/[-–—]/g, ' ')
    // Ponctuation → espaces
    .replace(/[.,;:!?]/g, ' ')
    // Multiples espaces → un seul
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Extrait les mots significatifs d'une chaîne
 * Filtre les mots courts (<3 caractères) : "le", "la", "de", "du", etc.
 */
export function extractWords(str: string): Set<string> {
  const normalized = normalizeAdvanced(str)
  const words = normalized.split(' ')

  // Mots français courts à ignorer
  const stopWords = new Set([
    'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de',
    'au', 'aux', 'et', 'ou', 'en', 'dans', 'sur', 'pour',
    'par', 'avec', 'sans', 'sous', 'chez', 'ce', 'cet',
    'cette', 'ces', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes',
    'son', 'sa', 'ses', 'rue', 'avenue', 'place', 'bd',
    'boulevard', 'chemin', 'all', 'allee', 'allée'
  ])

  return new Set(
    words.filter(word =>
      word.length >= 3 && !stopWords.has(word)
    )
  )
}

/**
 * Calcule la distance de Levenshtein entre deux chaînes
 * Utilisé pour détecter les typos (ex: "Bistrot" vs "Bistro")
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  const matrix: number[][] = []

  // Initialisation
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  // Calcul
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // Substitution
          matrix[i][j - 1] + 1,     // Insertion
          matrix[i - 1][j] + 1      // Suppression
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

/**
 * Vérifie si deux chaînes sont similaires avec fuzzy matching
 * @param str1 Première chaîne
 * @param str2 Deuxième chaîne
 * @param threshold Distance maximale acceptée (par défaut 2)
 */
export function isFuzzyMatch(str1: string, str2: string, threshold: number = 2): boolean {
  const normalized1 = normalizeAdvanced(str1)
  const normalized2 = normalizeAdvanced(str2)

  // Si identiques après normalisation
  if (normalized1 === normalized2) return true

  // Si trop différents en longueur, pas la peine de calculer
  if (Math.abs(normalized1.length - normalized2.length) > threshold) {
    return false
  }

  const distance = levenshteinDistance(normalized1, normalized2)
  return distance <= threshold
}

/**
 * Détection de doublons améliorée avec word-based matching
 * Résout les problèmes de faux positifs du substring matching
 */
export function isDuplicateImproved(
  placeName: string,
  placeAddress: string,
  existingTips: Array<{ title: string; location: string | null }>
): boolean {
  const placeWords = extractWords(placeName)
  const addressWords = extractWords(placeAddress)

  for (const tip of existingTips) {
    const tipWords = extractWords(tip.title || '')
    const tipLocationWords = extractWords(tip.location || '')

    // ========================================
    // Critère 1 : Match exact sur le nom
    // ========================================
    // Tous les mots significatifs du lieu sont dans le tip
    if (placeWords.size > 0 && tipWords.size > 0) {
      const allWordsMatch = [...placeWords].every(word => tipWords.has(word))

      if (allWordsMatch) {
        return true // Doublon certain
      }
    }

    // ========================================
    // Critère 2 : Fuzzy match sur le nom
    // ========================================
    // Détecte typos : "Le Petit Bistrot" vs "Le Petit Bistro"
    const placeNameNorm = normalizeAdvanced(placeName)
    const tipNameNorm = normalizeAdvanced(tip.title || '')

    if (placeNameNorm.length > 5 && tipNameNorm.length > 5) {
      if (isFuzzyMatch(placeNameNorm, tipNameNorm, 3)) {
        return true // Probablement un doublon (typo)
      }
    }

    // ========================================
    // Critère 3 : Match adresse (au moins 2 mots communs)
    // ========================================
    // Ex: "15 Rue de la Gare" vs "Rue de la Gare"
    if (addressWords.size >= 2 && tipLocationWords.size >= 2) {
      const commonWords = [...addressWords].filter(word =>
        tipLocationWords.has(word)
      )

      // Au moins 2 mots significatifs en commun
      if (commonWords.length >= 2) {
        // Vérifier que ce ne sont pas juste des mots génériques
        const significantCommonWords = commonWords.filter(word =>
          !['rue', 'avenue', 'place', 'boulevard', 'chemin'].includes(word)
        )

        if (significantCommonWords.length >= 2) {
          return true // Probablement même adresse
        }
      }
    }

    // ========================================
    // Critère 4 : Match nom + au moins 1 mot adresse
    // ========================================
    // Ex: "Bistrot Le Petit" à "Rue de la Gare" vs "Le Petit Bistrot" à "Gare Station"
    if (placeWords.size > 0 && tipWords.size > 0) {
      const nameOverlap = [...placeWords].filter(word => tipWords.has(word))

      if (nameOverlap.length >= Math.min(placeWords.size, tipWords.size) * 0.7) {
        // 70% des mots du nom matchent
        const addressOverlap = [...addressWords].filter(word =>
          tipLocationWords.has(word)
        )

        if (addressOverlap.length >= 1) {
          return true // Nom similaire + adresse similaire
        }
      }
    }
  }

  return false // Pas de doublon détecté
}

/**
 * Détecte les doublons avec statistiques de confiance
 * Utile pour debugging ou affichage de warning
 */
export interface DuplicateMatch {
  isDuplicate: boolean
  matchedTip: { title: string; location: string | null } | null
  confidence: number // 0-100
  reason: string
}

export function detectDuplicateWithConfidence(
  placeName: string,
  placeAddress: string,
  existingTips: Array<{ title: string; location: string | null }>
): DuplicateMatch {
  const placeWords = extractWords(placeName)
  const addressWords = extractWords(placeAddress)

  for (const tip of existingTips) {
    const tipWords = extractWords(tip.title || '')
    const tipLocationWords = extractWords(tip.location || '')

    // Match exact nom
    if (placeWords.size > 0 && tipWords.size > 0) {
      const allWordsMatch = [...placeWords].every(word => tipWords.has(word))
      if (allWordsMatch) {
        return {
          isDuplicate: true,
          matchedTip: tip,
          confidence: 95,
          reason: 'Nom identique (tous les mots matchent)'
        }
      }
    }

    // Fuzzy match
    const placeNameNorm = normalizeAdvanced(placeName)
    const tipNameNorm = normalizeAdvanced(tip.title || '')

    if (placeNameNorm.length > 5 && tipNameNorm.length > 5) {
      if (isFuzzyMatch(placeNameNorm, tipNameNorm, 2)) {
        return {
          isDuplicate: true,
          matchedTip: tip,
          confidence: 85,
          reason: 'Nom très similaire (possible typo)'
        }
      }
    }

    // Match adresse
    if (addressWords.size >= 2 && tipLocationWords.size >= 2) {
      const commonWords = [...addressWords].filter(word =>
        tipLocationWords.has(word)
      )
      const significantCommonWords = commonWords.filter(word =>
        !['rue', 'avenue', 'place', 'boulevard', 'chemin'].includes(word)
      )

      if (significantCommonWords.length >= 2) {
        return {
          isDuplicate: true,
          matchedTip: tip,
          confidence: 80,
          reason: `Adresse similaire (${significantCommonWords.length} mots communs)`
        }
      }
    }

    // Match partiel nom + adresse
    if (placeWords.size > 0 && tipWords.size > 0) {
      const nameOverlap = [...placeWords].filter(word => tipWords.has(word))
      if (nameOverlap.length >= Math.min(placeWords.size, tipWords.size) * 0.7) {
        const addressOverlap = [...addressWords].filter(word =>
          tipLocationWords.has(word)
        )
        if (addressOverlap.length >= 1) {
          return {
            isDuplicate: true,
            matchedTip: tip,
            confidence: 70,
            reason: 'Nom et adresse partiellement similaires'
          }
        }
      }
    }
  }

  return {
    isDuplicate: false,
    matchedTip: null,
    confidence: 0,
    reason: 'Aucun doublon détecté'
  }
}
