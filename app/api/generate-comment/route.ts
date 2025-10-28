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

interface Review {
  author_name: string
  rating: number
  text: string
  relative_time_description: string
}

async function generateWithOpenAICompatible(
  client: OpenAI,
  model: string,
  prompt: string,
  providerName: string,
  keyIndex: number = 0
): Promise<string> {
  console.log(`[GENERATE COMMENT] 🤖 Tentative avec ${providerName} (clé #${keyIndex + 1}, ${model})...`)

  const completion = await client.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'Tu es un expert en rédaction de recommandations de voyage authentiques et engageantes.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.8,
    max_tokens: 200,
  })

  const generatedComment = completion.choices[0]?.message?.content?.trim() || ''
  console.log(`[GENERATE COMMENT] ✅ ${providerName} (clé #${keyIndex + 1}) - Commentaire généré:`, generatedComment.substring(0, 50) + '...')
  return generatedComment
}

async function generateWithGemini(client: GoogleGenerativeAI, prompt: string, keyIndex: number = 0): Promise<string> {
  console.log(`[GENERATE COMMENT] 🤖 Tentative avec Google Gemini (clé #${keyIndex + 1})...`)

  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })

  const fullPrompt = `Tu es un expert en rédaction de recommandations de voyage authentiques et engageantes.

${prompt}`

  const result = await model.generateContent(fullPrompt)
  const response = await result.response
  const generatedComment = response.text().trim()

  console.log(`[GENERATE COMMENT] ✅ Google Gemini (clé #${keyIndex + 1}) - Commentaire généré:`, generatedComment.substring(0, 50) + '...')
  return generatedComment
}

export async function POST(request: NextRequest) {
  try {
    const { reviews, placeName, rating, userRatingsTotal } = await request.json()

    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return NextResponse.json({ comment: '' }, { status: 200 })
    }

    // Filtrer les meilleurs avis (rating >= 4) et prendre les 5 premiers
    const bestReviews = reviews
      .filter((r: Review) => r.rating >= 4)
      .slice(0, 5)

    if (bestReviews.length === 0) {
      return NextResponse.json({ comment: '' }, { status: 200 })
    }

    // Construire le prompt
    const reviewTexts = bestReviews
      .map((r: Review, i: number) => `${i + 1}. "${r.text}" (${r.rating}⭐)`)
      .join('\n')

    const prompt = `Tu es un gestionnaire de location de vacances passionné qui rédige des recommandations personnelles pour ses voyageurs.

Voici les avis Google du lieu "${placeName}" (note moyenne : ${rating}/5, ${userRatingsTotal} avis) :

${reviewTexts}

Ta mission : Rédige un commentaire personnel chaleureux et engageant (2-3 phrases maximum) qui :
- Capture l'essence de ce lieu en te basant sur les meilleurs avis
- Se concentre sur l'EXPÉRIENCE PRINCIPALE :
  * Restaurant/Café : plats phares, ambiance, accueil, saveurs
  * Activité : ce qu'on y fait, sensations, ce qu'on apprend
  * Site/Musée : ce qu'on y voit, atmosphère, découvertes
- Utilise un ton authentique et amical, comme si tu parlais à un ami
- Met en avant ce qui rend ce lieu spécial et mémorable
- Donne envie d'y aller sans être trop commercial
- Évite les phrases génériques type "très bon établissement"
- IMPORTANT : IGNORE les détails techniques/pratiques (parking, toilettes, wifi, paiement) sauf s'ils sont EXCEPTIONNELS et font la réputation du lieu

Exemples de style attendu :
- "Un petit restaurant italien familial où l'on se sent immédiatement chez soi. Leurs pâtes fraîches sont une tuerie, et l'accueil de Marco est toujours aussi chaleureux !"
- "La meilleure adresse pour bruncher dans le quartier ! L'avocado toast est légendaire et la terrasse cachée est parfaite pour se détendre."
- "Ce musée est un bijou méconnu. Les collections sont passionnantes et il n'y a jamais trop de monde, contrairement aux grands musées touristiques."

Rédige uniquement le commentaire, sans introduction ni conclusion. Maximum 3 phrases.`

    let generatedComment = ''

    // 🔄 ROTATION AUTOMATIQUE : Essayer toutes les clés de chaque provider
    // Ordre de priorité : OpenAI → Groq → Gemini → Mistral

    // 1. Essayer toutes les clés OpenAI (même si quota dépassé, se remettra à zéro un jour)
    for (let i = 0; i < openaiClients.length && !generatedComment; i++) {
      try {
        console.log(`[GENERATE COMMENT] 🚀 Tentative OpenAI GPT-4o-mini (clé #${i + 1}/${openaiClients.length})...`)
        generatedComment = await generateWithOpenAICompatible(openaiClients[i], 'gpt-4o-mini', prompt, 'OpenAI GPT-4o-mini', i)
        console.log(`[GENERATE COMMENT] ✅ OpenAI GPT-4o-mini (clé #${i + 1}) - Succès !`)
        break
      } catch (error: any) {
        const isRateLimit = error?.status === 429 || error?.code === 'rate_limit_exceeded'
        const isQuotaExceeded = error?.message?.includes('quota') || error?.message?.includes('insufficient_quota')

        if (isRateLimit || isQuotaExceeded) {
          console.warn(`[GENERATE COMMENT] ⚠️ OpenAI (clé #${i + 1}) - Quota atteint`)
          if (i < openaiClients.length - 1) {
            console.log(`[GENERATE COMMENT] 🔄 Rotation vers clé OpenAI #${i + 2}...`)
          }
        } else {
          console.error(`[GENERATE COMMENT] ❌ OpenAI (clé #${i + 1}) - Erreur:`, error.message)
        }
      }
    }

    // 2. Essayer toutes les clés Groq (ultra-rapide, quota généreux)
    for (let i = 0; i < groqClients.length && !generatedComment; i++) {
      try {
        console.log(`[GENERATE COMMENT] 🚀 Tentative Groq Llama 3.3 (clé #${i + 1}/${groqClients.length})...`)
        generatedComment = await generateWithOpenAICompatible(groqClients[i], 'llama-3.3-70b-versatile', prompt, 'Groq Llama 3.3', i)
        console.log(`[GENERATE COMMENT] ✅ Groq Llama 3.3 (clé #${i + 1}) - Succès !`)
        break
      } catch (error: any) {
        const isRateLimit = error?.status === 429 || error?.code === 'rate_limit_exceeded'
        const isQuotaExceeded = error?.message?.includes('quota') || error?.message?.includes('insufficient_quota')

        if (isRateLimit || isQuotaExceeded) {
          console.warn(`[GENERATE COMMENT] ⚠️ Groq (clé #${i + 1}) - Quota atteint`)
          if (i < groqClients.length - 1) {
            console.log(`[GENERATE COMMENT] 🔄 Rotation vers clé Groq #${i + 2}...`)
          }
        } else {
          console.error(`[GENERATE COMMENT] ❌ Groq (clé #${i + 1}) - Erreur:`, error.message)
        }
      }
    }

    // 3. Essayer toutes les clés Google Gemini
    for (let i = 0; i < geminiClients.length && !generatedComment; i++) {
      try {
        console.log(`[GENERATE COMMENT] 🚀 Tentative Google Gemini (clé #${i + 1}/${geminiClients.length})...`)
        generatedComment = await generateWithGemini(geminiClients[i], prompt, i)
        console.log(`[GENERATE COMMENT] ✅ Google Gemini (clé #${i + 1}) - Succès !`)
        break
      } catch (error: any) {
        const isRateLimit = error?.status === 429 || error?.code === 'rate_limit_exceeded'
        const isQuotaExceeded = error?.message?.includes('quota') || error?.message?.includes('insufficient_quota')

        if (isRateLimit || isQuotaExceeded) {
          console.warn(`[GENERATE COMMENT] ⚠️ Gemini (clé #${i + 1}) - Quota atteint`)
          if (i < geminiClients.length - 1) {
            console.log(`[GENERATE COMMENT] 🔄 Rotation vers clé Gemini #${i + 2}...`)
          }
        } else {
          console.error(`[GENERATE COMMENT] ❌ Gemini (clé #${i + 1}) - Erreur:`, error.message)
        }
      }
    }

    // 4. Essayer toutes les clés Mistral AI
    for (let i = 0; i < mistralClients.length && !generatedComment; i++) {
      try {
        console.log(`[GENERATE COMMENT] 🚀 Tentative Mistral AI (clé #${i + 1}/${mistralClients.length})...`)
        generatedComment = await generateWithOpenAICompatible(mistralClients[i], 'mistral-small-latest', prompt, 'Mistral AI', i)
        console.log(`[GENERATE COMMENT] ✅ Mistral AI (clé #${i + 1}) - Succès !`)
        break
      } catch (error: any) {
        const isRateLimit = error?.status === 429 || error?.code === 'rate_limit_exceeded'
        const isQuotaExceeded = error?.message?.includes('quota') || error?.message?.includes('insufficient_quota')

        if (isRateLimit || isQuotaExceeded) {
          console.warn(`[GENERATE COMMENT] ⚠️ Mistral (clé #${i + 1}) - Quota atteint`)
          if (i < mistralClients.length - 1) {
            console.log(`[GENERATE COMMENT] 🔄 Rotation vers clé Mistral #${i + 2}...`)
          }
        } else {
          console.error(`[GENERATE COMMENT] ❌ Mistral (clé #${i + 1}) - Erreur:`, error.message)
        }
      }
    }

    if (!generatedComment) {
      const totalKeys = openaiClients.length + groqClients.length + geminiClients.length + mistralClients.length
      console.warn(`[GENERATE COMMENT] 💥 Tous les providers ont échoué (${totalKeys} clés testées)`)
    }

    return NextResponse.json({ comment: generatedComment })
  } catch (error: any) {
    console.error('[GENERATE COMMENT] 💥 Erreur fatale:', error)
    // En cas d'erreur, retourner une chaîne vide au lieu de crasher
    return NextResponse.json({ comment: '' }, { status: 200 })
  }
}
