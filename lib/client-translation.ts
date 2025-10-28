/**
 * Service de traduction côté client
 *
 * Utilise le Browser Translation API (Chrome 125+) en premier,
 * puis fallback sur MyMemory API si nécessaire (10 000 requêtes/jour gratuites).
 *
 * Cache les traductions dans IndexedDB pour performance.
 */

import { get, set } from 'idb-keyval'

// Types pour l'API expérimentale Chrome
declare global {
  interface Window {
    translation?: {
      createTranslator(options: {
        sourceLanguage: string
        targetLanguage: string
      }): Promise<{
        translate(text: string): Promise<string>
        destroy(): void
      }>
      canTranslate(options: {
        sourceLanguage: string
        targetLanguage: string
      }): Promise<'readily' | 'after-download' | 'no'>
    }
  }
}

const CACHE_PREFIX = 'trans_v1_'

/**
 * Traduction via Browser Translation API (Chrome 125+)
 */
async function translateWithBrowserAPI(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string | null> {
  if (!window.translation) {
    return null
  }

  try {
    // Vérifier si la traduction est disponible
    const canTranslate = await window.translation.canTranslate({
      sourceLanguage: sourceLang,
      targetLanguage: targetLang
    })

    if (canTranslate === 'no') {
      console.log('[BROWSER API] Translation not available for', sourceLang, '→', targetLang)
      return null
    }

    if (canTranslate === 'after-download') {
      console.log('[BROWSER API] Model needs download, will fallback to LibreTranslate')
      return null
    }

    // Créer le traducteur
    const translator = await window.translation.createTranslator({
      sourceLanguage: sourceLang,
      targetLanguage: targetLang
    })

    // Traduire
    const result = await translator.translate(text)

    // Détruire le traducteur (libérer mémoire)
    translator.destroy()

    console.log('[BROWSER API] ✅ Translated:', text.substring(0, 30), '→', result.substring(0, 30))
    return result
  } catch (error) {
    console.error('[BROWSER API] Translation error:', error)
    return null
  }
}

/**
 * Traduction via MyMemory API (fallback)
 * Utilise notre route API Next.js pour éviter les problèmes CORS
 * MyMemory est 100% gratuit (10 000 requêtes/jour)
 */
async function translateWithMyMemory(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string | null> {
  try {
    const response = await fetch('/api/translate-client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        sourceLang,
        targetLang
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    const translated = data.translatedText

    console.log('[MYMEMORY] ✅ Translated:', text.substring(0, 30), '→', translated.substring(0, 30))
    return translated
  } catch (error) {
    console.error('[MYMEMORY] Translation error:', error)
    return null
  }
}

/**
 * Fonction principale de traduction avec fallback en cascade
 */
export async function translateClientSide(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  // Cas trivial : même langue
  if (sourceLang === targetLang) {
    return text
  }

  // Texte vide
  if (!text || text.trim() === '') {
    return text
  }

  // Vérifier le cache d'abord
  const cacheKey = `${CACHE_PREFIX}${sourceLang}_${targetLang}_${text}`
  try {
    const cached = await get(cacheKey)
    if (cached) {
      console.log('[CACHE HIT]', text.substring(0, 30))
      return cached as string
    }
  } catch (error) {
    console.warn('[CACHE] Read error:', error)
  }

  // Stratégie de fallback
  let translated: string | null = null

  // 1. Essayer Browser Translation API (Chrome 125+)
  translated = await translateWithBrowserAPI(text, sourceLang, targetLang)

  // 2. Fallback sur MyMemory
  if (!translated) {
    console.log('[FALLBACK] Trying MyMemory...')
    translated = await translateWithMyMemory(text, sourceLang, targetLang)
  }

  // 3. Fallback final : texte original
  if (!translated) {
    console.warn('[FALLBACK] No translation available, showing original text')
    translated = text
  }

  // Mettre en cache le résultat (sauf si c'est le texte original)
  if (translated !== text) {
    try {
      await set(cacheKey, translated)
    } catch (error) {
      console.warn('[CACHE] Write error:', error)
    }
  }

  return translated
}

/**
 * Traduction en batch (optimisation performance)
 */
export async function translateBatch(
  texts: string[],
  sourceLang: string,
  targetLang: string
): Promise<string[]> {
  // Pour l'instant, traduire individuellement
  // TODO: Implémenter vraie traduction batch si LibreTranslate le supporte
  const promises = texts.map(text => translateClientSide(text, sourceLang, targetLang))
  return Promise.all(promises)
}

/**
 * Vérifier si la traduction navigateur est disponible
 */
export function isBrowserTranslationAvailable(): boolean {
  return typeof window !== 'undefined' && 'translation' in window
}

/**
 * Vider le cache de traduction (utile pour debug)
 */
export async function clearTranslationCache(): Promise<void> {
  console.log('[CACHE] Clearing translation cache...')
  // Note: idb-keyval ne permet pas de supprimer par préfixe facilement
  // Pour l'instant, cette fonction est un placeholder
  // Une implémentation complète nécessiterait d'itérer sur toutes les clés
}
