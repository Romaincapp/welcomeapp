import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const dynamic = 'force-dynamic'

// Configuration OpenAI (prioritaire - payant mais meilleure qualité)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Configuration Groq (fallback 1 - gratuit, ultra-rapide)
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
})

// Configuration Google Gemini (fallback 2 - gratuit, 60 req/min)
const gemini = process.env.GOOGLE_GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY)
  : null

// Configuration Mistral AI (fallback 3 - gratuit avec limitations)
const mistral = new OpenAI({
  apiKey: process.env.MISTRAL_API_KEY,
  baseURL: 'https://api.mistral.ai/v1',
})

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
  providerName: string
): Promise<string> {
  console.log(`[GENERATE COMMENT] 🤖 Tentative avec ${providerName} (${model})...`)

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
  console.log(`[GENERATE COMMENT] ✅ ${providerName} - Commentaire généré:`, generatedComment.substring(0, 50) + '...')
  return generatedComment
}

async function generateWithGemini(prompt: string): Promise<string> {
  if (!gemini) {
    throw new Error('Gemini non configuré')
  }

  console.log('[GENERATE COMMENT] 🤖 Tentative avec Google Gemini (gemini-1.5-flash)...')

  const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const fullPrompt = `Tu es un expert en rédaction de recommandations de voyage authentiques et engageantes.

${prompt}`

  const result = await model.generateContent(fullPrompt)
  const response = await result.response
  const generatedComment = response.text().trim()

  console.log('[GENERATE COMMENT] ✅ Google Gemini - Commentaire généré:', generatedComment.substring(0, 50) + '...')
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

    // 🎯 STRATÉGIE DE ROTATION INTELLIGENTE
    // Ordre : OpenAI → Groq → Gemini → Mistral
    // En cas de quota atteint, bascule automatiquement sur le suivant

    const providers = [
      {
        name: 'OpenAI GPT-4o-mini',
        key: process.env.OPENAI_API_KEY,
        execute: () => generateWithOpenAICompatible(openai, 'gpt-4o-mini', prompt, 'OpenAI GPT-4o-mini'),
      },
      {
        name: 'Groq Mixtral',
        key: process.env.GROQ_API_KEY,
        execute: () => generateWithOpenAICompatible(groq, 'mixtral-8x7b-32768', prompt, 'Groq Mixtral'),
      },
      {
        name: 'Google Gemini',
        key: process.env.GOOGLE_GEMINI_API_KEY,
        execute: () => generateWithGemini(prompt),
      },
      {
        name: 'Mistral AI',
        key: process.env.MISTRAL_API_KEY,
        execute: () => generateWithOpenAICompatible(mistral, 'mistral-small-latest', prompt, 'Mistral AI'),
      },
    ]

    // Essayer chaque provider dans l'ordre
    for (const provider of providers) {
      if (generatedComment) break // Déjà généré, on sort

      if (!provider.key) {
        console.log(`[GENERATE COMMENT] ⏭️ ${provider.name} - Clé API non configurée, passage au suivant`)
        continue
      }

      try {
        generatedComment = await provider.execute()
        break // Succès, on arrête la boucle
      } catch (error: any) {
        const isRateLimit = error?.status === 429 || error?.code === 'rate_limit_exceeded'
        const isQuotaExceeded = error?.message?.includes('quota') || error?.message?.includes('insufficient_quota')

        if (isRateLimit || isQuotaExceeded) {
          console.warn(`[GENERATE COMMENT] ⚠️ ${provider.name} - Quota/limite atteint:`, error.message)
          console.log('[GENERATE COMMENT] 🔄 Tentative avec le provider suivant...')
        } else {
          console.error(`[GENERATE COMMENT] ❌ ${provider.name} - Erreur:`, error.message)
          // Continuer quand même avec le provider suivant
        }
      }
    }

    if (!generatedComment) {
      console.warn('[GENERATE COMMENT] 💥 Tous les providers ont échoué ou ne sont pas configurés')
    }

    return NextResponse.json({ comment: generatedComment })
  } catch (error: any) {
    console.error('[GENERATE COMMENT] 💥 Erreur fatale:', error)
    // En cas d'erreur, retourner une chaîne vide au lieu de crasher
    return NextResponse.json({ comment: '' }, { status: 200 })
  }
}
