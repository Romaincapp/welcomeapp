/**
 * Système de rotation des clés API pour maximiser les quotas gratuits
 *
 * Comment ça marche :
 * 1. Plusieurs clés API pour chaque provider (ex: GROQ_API_KEY_2, GROQ_API_KEY_3)
 * 2. Rotation automatique si une clé atteint sa limite (429 ou quota exceeded)
 * 3. Tracking de l'utilisation pour optimiser la distribution
 */

import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Récupérer toutes les clés disponibles pour un provider
function getApiKeys(prefix: string): string[] {
  const keys: string[] = []

  // Clé principale
  const mainKey = process.env[`${prefix}_API_KEY`]
  if (mainKey) keys.push(mainKey)

  // Clés secondaires (_2, _3, etc.)
  for (let i = 2; i <= 5; i++) {
    const key = process.env[`${prefix}_API_KEY_${i}`]
    if (key) keys.push(key)
  }

  return keys
}

// Créer plusieurs clients OpenAI-compatible (Groq, Mistral) avec rotation
export function createGroqClients(): OpenAI[] {
  const keys = getApiKeys('GROQ')
  return keys.map(key => new OpenAI({
    apiKey: key,
    baseURL: 'https://api.groq.com/openai/v1',
  }))
}

export function createMistralClients(): OpenAI[] {
  const keys = getApiKeys('MISTRAL')
  return keys.map(key => new OpenAI({
    apiKey: key,
    baseURL: 'https://api.mistral.ai/v1',
  }))
}

export function createOpenAIClients(): OpenAI[] {
  const keys = getApiKeys('OPENAI')
  return keys.map(key => new OpenAI({ apiKey: key }))
}

// Créer plusieurs clients Gemini avec rotation
export function createGeminiClients(): GoogleGenerativeAI[] {
  const keys = getApiKeys('GOOGLE_GEMINI')
  return keys.map(key => new GoogleGenerativeAI(key))
}

// Fonction helper pour essayer plusieurs clés avec rotation automatique
export async function tryWithRotation<T>(
  clients: any[],
  providerName: string,
  executeFn: (client: any, index: number) => Promise<T>
): Promise<{ result: T | null; usedKeyIndex: number }> {

  for (let i = 0; i < clients.length; i++) {
    try {
      console.log(`[ROTATION] 🔑 Tentative avec ${providerName} - Clé #${i + 1}/${clients.length}`)
      const result = await executeFn(clients[i], i)
      console.log(`[ROTATION] ✅ ${providerName} - Clé #${i + 1} - Succès !`)
      return { result, usedKeyIndex: i }
    } catch (error: any) {
      const isRateLimit = error?.status === 429 || error?.code === 'rate_limit_exceeded'
      const isQuotaExceeded = error?.message?.includes('quota') || error?.message?.includes('insufficient_quota')

      if (isRateLimit || isQuotaExceeded) {
        console.warn(`[ROTATION] ⚠️ ${providerName} - Clé #${i + 1} - Quota atteint`)
        if (i < clients.length - 1) {
          console.log(`[ROTATION] 🔄 Rotation vers clé #${i + 2}...`)
          continue // Essayer la prochaine clé
        }
      } else {
        // Erreur non liée au quota → Ne pas essayer les autres clés
        console.error(`[ROTATION] ❌ ${providerName} - Clé #${i + 1} - Erreur:`, error.message)
        throw error
      }
    }
  }

  console.warn(`[ROTATION] 💥 ${providerName} - Toutes les clés ont échoué`)
  return { result: null, usedKeyIndex: -1 }
}

// Stats d'utilisation des clés (optionnel - pour monitoring)
export interface KeyUsageStats {
  provider: string
  keyIndex: number
  successCount: number
  failureCount: number
  lastUsed: Date
}

const keyUsageStats = new Map<string, KeyUsageStats>()

export function trackKeyUsage(provider: string, keyIndex: number, success: boolean) {
  const key = `${provider}_${keyIndex}`
  const stats = keyUsageStats.get(key) || {
    provider,
    keyIndex,
    successCount: 0,
    failureCount: 0,
    lastUsed: new Date()
  }

  if (success) {
    stats.successCount++
  } else {
    stats.failureCount++
  }
  stats.lastUsed = new Date()

  keyUsageStats.set(key, stats)
}

export function getKeyStats(): KeyUsageStats[] {
  return Array.from(keyUsageStats.values())
}
