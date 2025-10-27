import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const dynamic = 'force-dynamic'

// Configuration des providers (même que generate-comment)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const groq = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: 'https://api.groq.com/openai/v1' })
const gemini = process.env.GOOGLE_GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY) : null
const mistral = new OpenAI({ apiKey: process.env.MISTRAL_API_KEY, baseURL: 'https://api.mistral.ai/v1' })

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
  providerName: string
): Promise<GeneratedComment[]> {
  console.log(`[BATCH GENERATE] 🤖 Tentative avec ${providerName} pour ${tips.length} tips...`)

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

  console.log(`[BATCH GENERATE] ✅ ${providerName} - ${comments.filter(c => c.comment).length}/${tips.length} commentaires générés`)
  return comments
}

async function generateBatchWithGemini(tips: TipToGenerate[]): Promise<GeneratedComment[]> {
  if (!gemini) throw new Error('Gemini non configuré')

  console.log(`[BATCH GENERATE] 🤖 Tentative avec Google Gemini pour ${tips.length} tips...`)

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

  const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' })
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

  console.log(`[BATCH GENERATE] ✅ Google Gemini - ${comments.filter(c => c.comment).length}/${tips.length} commentaires générés`)
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

    // Stratégie de rotation (même ordre que generate-comment)
    const providers = [
      {
        name: 'OpenAI GPT-4o-mini',
        key: process.env.OPENAI_API_KEY,
        execute: () => generateBatchWithOpenAICompatible(openai, 'gpt-4o-mini', tips, 'OpenAI GPT-4o-mini'),
      },
      {
        name: 'Groq Mixtral',
        key: process.env.GROQ_API_KEY,
        execute: () => generateBatchWithOpenAICompatible(groq, 'mixtral-8x7b-32768', tips, 'Groq Mixtral'),
      },
      {
        name: 'Google Gemini',
        key: process.env.GOOGLE_GEMINI_API_KEY,
        execute: () => generateBatchWithGemini(tips),
      },
      {
        name: 'Mistral AI',
        key: process.env.MISTRAL_API_KEY,
        execute: () => generateBatchWithOpenAICompatible(mistral, 'mistral-small-latest', tips, 'Mistral AI'),
      },
    ]

    // Essayer chaque provider
    for (const provider of providers) {
      if (comments.length > 0) break

      if (!provider.key) {
        console.log(`[BATCH GENERATE] ⏭️ ${provider.name} - Clé non configurée`)
        continue
      }

      try {
        comments = await provider.execute()
        break
      } catch (error: any) {
        const isRateLimit = error?.status === 429 || error?.code === 'rate_limit_exceeded'
        const isQuotaExceeded = error?.message?.includes('quota') || error?.message?.includes('insufficient_quota')

        if (isRateLimit || isQuotaExceeded) {
          console.warn(`[BATCH GENERATE] ⚠️ ${provider.name} - Quota atteint`)
          console.log('[BATCH GENERATE] 🔄 Tentative avec le provider suivant...')
        } else {
          console.error(`[BATCH GENERATE] ❌ ${provider.name} - Erreur:`, error.message)
        }
      }
    }

    if (comments.length === 0) {
      console.warn('[BATCH GENERATE] 💥 Tous les providers ont échoué')
    }

    return NextResponse.json({ comments })
  } catch (error: any) {
    console.error('[BATCH GENERATE] 💥 Erreur fatale:', error)
    return NextResponse.json({ comments: [] }, { status: 200 })
  }
}
