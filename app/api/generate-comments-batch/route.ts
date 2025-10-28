import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const dynamic = 'force-dynamic'

// 🔄 SYSTÈME DE ROTATION AUTOMATIQUE DES CLÉS API
// Détecte automatiquement toutes les clés disponibles (GROQ_API_KEY, GROQ_API_KEY_2, etc.)
function getApiKeys(prefix: string): string[] {
  const keys: string[] = []

  // Clé principale
  const mainKey = process.env[`${prefix}_API_KEY`]
  if (mainKey) keys.push(mainKey)

  // Clés secondaires (_2, _3, _4, _5)
  for (let i = 2; i <= 5; i++) {
    const key = process.env[`${prefix}_API_KEY_${i}`]
    if (key) keys.push(key)
  }

  return keys
}

// Créer tous les clients disponibles pour chaque provider
const openaiClients = getApiKeys('OPENAI').map(key => new OpenAI({ apiKey: key }))
const groqClients = getApiKeys('GROQ').map(key => new OpenAI({ apiKey: key, baseURL: 'https://api.groq.com/openai/v1' }))
const geminiClients = getApiKeys('GOOGLE_GEMINI').map(key => new GoogleGenerativeAI(key))
const mistralClients = getApiKeys('MISTRAL').map(key => new OpenAI({ apiKey: key, baseURL: 'https://api.mistral.ai/v1' }))

console.log(`[API KEYS] 🔑 Clés détectées - OpenAI: ${openaiClients.length}, Groq: ${groqClients.length}, Gemini: ${geminiClients.length}, Mistral: ${mistralClients.length}`)

interface TipToGenerate {
  id: string
  title: string
  reviews: Array<{ author_name: string; rating: number; text: string }>
  rating: number | null
  user_ratings_total: number
}

interface GeneratedComment {
  tipId: string
  comment: string
}

async function generateBatchWithOpenAICompatible(
  client: OpenAI,
  model: string,
  tips: TipToGenerate[],
  providerName: string,
  keyIndex: number = 0
): Promise<GeneratedComment[]> {
  console.log(`[BATCH GENERATE] 🤖 Tentative avec ${providerName} (clé #${keyIndex + 1}) pour ${tips.length} tips...`)

  // Construire le prompt pour le batch
  const tipsPrompts = tips.map((tip, index) => {
    const bestReviews = tip.reviews.filter(r => r.rating >= 4).slice(0, 3)
    const reviewTexts = bestReviews.map((r, i) => `   ${i + 1}. "${r.text}" (${r.rating}⭐)`).join('\n')

    return `${index + 1}. "${tip.title}" (${tip.rating}/5, ${tip.user_ratings_total} avis)
Avis :
${reviewTexts}`
  }).join('\n\n')

  const prompt = `Tu es un expert en rédaction de recommandations de voyage authentiques et engageantes.

Je vais te donner ${tips.length} lieux avec leurs avis Google. Pour CHAQUE lieu, rédige un commentaire personnel chaleureux et engageant (2-3 phrases maximum) qui :
- Capture l'essence du lieu en te basant sur les meilleurs avis
- Se concentre sur l'EXPÉRIENCE PRINCIPALE :
  * Restaurant/Café : plats phares, ambiance, accueil, saveurs
  * Activité : ce qu'on y fait, sensations, ce qu'on apprend
  * Site/Musée : ce qu'on y voit, atmosphère, découvertes
- Utilise un ton authentique et amical, comme si tu parlais à un ami
- Met en avant ce qui rend ce lieu spécial et mémorable
- Donne envie d'y aller sans être trop commercial
- Évite les phrases génériques
- IMPORTANT : IGNORE les détails techniques/pratiques (parking, toilettes, wifi, paiement) sauf s'ils sont EXCEPTIONNELS et font la réputation du lieu

IMPORTANT : Réponds UNIQUEMENT avec les commentaires numérotés, un par ligne, sans introduction ni conclusion.

Format attendu :
1. [Commentaire pour le 1er lieu]
2. [Commentaire pour le 2ème lieu]
3. [Commentaire pour le 3ème lieu]

Voici les lieux :

${tipsPrompts}`

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: 'Tu es un expert en rédaction de recommandations de voyage. Tu réponds uniquement avec les commentaires numérotés.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.8,
    max_tokens: 500 * tips.length, // ~500 tokens par commentaire
  })

  const response = completion.choices[0]?.message?.content?.trim() || ''

  // Parser la réponse (format: "1. Commentaire\n2. Commentaire\n...")
  const lines = response.split('\n').filter(line => line.trim())
  const comments: GeneratedComment[] = []

  for (let i = 0; i < tips.length; i++) {
    // Chercher la ligne qui commence par "1.", "2.", etc.
    const regex = new RegExp(`^${i + 1}\\.\\s*(.+)$`)
    const line = lines.find(l => regex.test(l.trim()))

    if (line) {
      const match = line.match(regex)
      const comment = match ? match[1].trim() : ''
      comments.push({ tipId: tips[i].id, comment })
    } else {
      // Fallback : essayer de splitter par numéros
      comments.push({ tipId: tips[i].id, comment: '' })
    }
  }

  console.log(`[BATCH GENERATE] ✅ ${providerName} (clé #${keyIndex + 1}) - ${comments.filter(c => c.comment).length}/${tips.length} commentaires générés`)
  return comments
}

async function generateBatchWithGemini(client: GoogleGenerativeAI, tips: TipToGenerate[], keyIndex: number = 0): Promise<GeneratedComment[]> {
  console.log(`[BATCH GENERATE] 🤖 Tentative avec Google Gemini (clé #${keyIndex + 1}) pour ${tips.length} tips...`)

  const tipsPrompts = tips.map((tip, index) => {
    const bestReviews = tip.reviews.filter(r => r.rating >= 4).slice(0, 3)
    const reviewTexts = bestReviews.map((r, i) => `   ${i + 1}. "${r.text}" (${r.rating}⭐)`).join('\n')

    return `${index + 1}. "${tip.title}" (${tip.rating}/5, ${tip.user_ratings_total} avis)
Avis :
${reviewTexts}`
  }).join('\n\n')

  const prompt = `Tu es un expert en rédaction de recommandations de voyage authentiques et engageantes.

Je vais te donner ${tips.length} lieux avec leurs avis Google. Pour CHAQUE lieu, rédige un commentaire personnel chaleureux et engageant (2-3 phrases maximum) qui :
- Se concentre sur l'EXPÉRIENCE PRINCIPALE (plats, ambiance, activités, découvertes)
- Utilise un ton authentique et amical
- Met en avant ce qui rend ce lieu spécial et mémorable
- IGNORE les détails techniques (parking, toilettes, wifi, paiement)

IMPORTANT : Réponds UNIQUEMENT avec les commentaires numérotés, un par ligne.

Format attendu :
1. [Commentaire pour le 1er lieu]
2. [Commentaire pour le 2ème lieu]

Voici les lieux :

${tipsPrompts}`

  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })
  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text().trim()

  // Parser la réponse
  const lines = text.split('\n').filter(line => line.trim())
  const comments: GeneratedComment[] = []

  for (let i = 0; i < tips.length; i++) {
    const regex = new RegExp(`^${i + 1}\\.\\s*(.+)$`)
    const line = lines.find(l => regex.test(l.trim()))

    if (line) {
      const match = line.match(regex)
      const comment = match ? match[1].trim() : ''
      comments.push({ tipId: tips[i].id, comment })
    } else {
      comments.push({ tipId: tips[i].id, comment: '' })
    }
  }

  console.log(`[BATCH GENERATE] ✅ Google Gemini (clé #${keyIndex + 1}) - ${comments.filter(c => c.comment).length}/${tips.length} commentaires générés`)
  return comments
}

export async function POST(request: NextRequest) {
  try {
    const { tips }: { tips: TipToGenerate[] } = await request.json()

    if (!tips || !Array.isArray(tips) || tips.length === 0) {
      return NextResponse.json({ comments: [] }, { status: 200 })
    }

    console.log(`[BATCH GENERATE] 📦 Génération batch pour ${tips.length} tips`)

    let comments: GeneratedComment[] = []

    // 🔄 ROTATION AUTOMATIQUE : Essayer toutes les clés de chaque provider
    // Ordre de priorité : OpenAI → Groq → Gemini → Mistral

    // 1. Essayer toutes les clés OpenAI (même si quota dépassé, se remettra à zéro un jour)
    for (let i = 0; i < openaiClients.length && comments.length === 0; i++) {
      try {
        console.log(`[BATCH GENERATE] 🚀 Tentative OpenAI GPT-4o-mini (clé #${i + 1}/${openaiClients.length})...`)
        comments = await generateBatchWithOpenAICompatible(openaiClients[i], 'gpt-4o-mini', tips, 'OpenAI GPT-4o-mini', i)
        console.log(`[BATCH GENERATE] ✅ OpenAI GPT-4o-mini (clé #${i + 1}) - Succès !`)
        break
      } catch (error: any) {
        const isRateLimit = error?.status === 429 || error?.code === 'rate_limit_exceeded'
        const isQuotaExceeded = error?.message?.includes('quota') || error?.message?.includes('insufficient_quota')

        if (isRateLimit || isQuotaExceeded) {
          console.warn(`[BATCH GENERATE] ⚠️ OpenAI (clé #${i + 1}) - Quota atteint`)
          if (i < openaiClients.length - 1) {
            console.log(`[BATCH GENERATE] 🔄 Rotation vers clé OpenAI #${i + 2}...`)
          }
        } else {
          console.error(`[BATCH GENERATE] ❌ OpenAI (clé #${i + 1}) - Erreur:`, error.message)
        }
      }
    }

    // 2. Essayer toutes les clés Groq (ultra-rapide, quota généreux)
    for (let i = 0; i < groqClients.length && comments.length === 0; i++) {
      try {
        console.log(`[BATCH GENERATE] 🚀 Tentative Groq Llama 3.3 (clé #${i + 1}/${groqClients.length})...`)
        comments = await generateBatchWithOpenAICompatible(groqClients[i], 'llama-3.3-70b-versatile', tips, 'Groq Llama 3.3', i)
        console.log(`[BATCH GENERATE] ✅ Groq Llama 3.3 (clé #${i + 1}) - Succès !`)
        break
      } catch (error: any) {
        const isRateLimit = error?.status === 429 || error?.code === 'rate_limit_exceeded'
        const isQuotaExceeded = error?.message?.includes('quota') || error?.message?.includes('insufficient_quota')

        if (isRateLimit || isQuotaExceeded) {
          console.warn(`[BATCH GENERATE] ⚠️ Groq (clé #${i + 1}) - Quota atteint`)
          if (i < groqClients.length - 1) {
            console.log(`[BATCH GENERATE] 🔄 Rotation vers clé Groq #${i + 2}...`)
          }
        } else {
          console.error(`[BATCH GENERATE] ❌ Groq (clé #${i + 1}) - Erreur:`, error.message)
        }
      }
    }

    // 3. Essayer toutes les clés Google Gemini
    for (let i = 0; i < geminiClients.length && comments.length === 0; i++) {
      try {
        console.log(`[BATCH GENERATE] 🚀 Tentative Google Gemini (clé #${i + 1}/${geminiClients.length})...`)
        comments = await generateBatchWithGemini(geminiClients[i], tips, i)
        console.log(`[BATCH GENERATE] ✅ Google Gemini (clé #${i + 1}) - Succès !`)
        break
      } catch (error: any) {
        const isRateLimit = error?.status === 429 || error?.code === 'rate_limit_exceeded'
        const isQuotaExceeded = error?.message?.includes('quota') || error?.message?.includes('insufficient_quota')

        if (isRateLimit || isQuotaExceeded) {
          console.warn(`[BATCH GENERATE] ⚠️ Gemini (clé #${i + 1}) - Quota atteint`)
          if (i < geminiClients.length - 1) {
            console.log(`[BATCH GENERATE] 🔄 Rotation vers clé Gemini #${i + 2}...`)
          }
        } else {
          console.error(`[BATCH GENERATE] ❌ Gemini (clé #${i + 1}) - Erreur:`, error.message)
        }
      }
    }

    // 4. Essayer toutes les clés Mistral AI
    for (let i = 0; i < mistralClients.length && comments.length === 0; i++) {
      try {
        console.log(`[BATCH GENERATE] 🚀 Tentative Mistral AI (clé #${i + 1}/${mistralClients.length})...`)
        comments = await generateBatchWithOpenAICompatible(mistralClients[i], 'mistral-small-latest', tips, 'Mistral AI', i)
        console.log(`[BATCH GENERATE] ✅ Mistral AI (clé #${i + 1}) - Succès !`)
        break
      } catch (error: any) {
        const isRateLimit = error?.status === 429 || error?.code === 'rate_limit_exceeded'
        const isQuotaExceeded = error?.message?.includes('quota') || error?.message?.includes('insufficient_quota')

        if (isRateLimit || isQuotaExceeded) {
          console.warn(`[BATCH GENERATE] ⚠️ Mistral (clé #${i + 1}) - Quota atteint`)
          if (i < mistralClients.length - 1) {
            console.log(`[BATCH GENERATE] 🔄 Rotation vers clé Mistral #${i + 2}...`)
          }
        } else {
          console.error(`[BATCH GENERATE] ❌ Mistral (clé #${i + 1}) - Erreur:`, error.message)
        }
      }
    }

    if (comments.length === 0) {
      const totalKeys = openaiClients.length + groqClients.length + geminiClients.length + mistralClients.length
      console.warn(`[BATCH GENERATE] 💥 Tous les providers ont échoué (${totalKeys} clés testées)`)
    }

    return NextResponse.json({ comments })
  } catch (error: any) {
    console.error('[BATCH GENERATE] 💥 Erreur fatale:', error)
    return NextResponse.json({ comments: [] }, { status: 200 })
  }
}
