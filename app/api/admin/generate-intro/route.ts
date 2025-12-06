import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const dynamic = 'force-dynamic'

// Système de rotation automatique des clés API
function getApiKeys(prefix: string): string[] {
  const keys: string[] = []
  const mainKey = process.env[`${prefix}_API_KEY`]
  if (mainKey) keys.push(mainKey)

  for (let i = 2; i <= 5; i++) {
    const key = process.env[`${prefix}_API_KEY_${i}`]
    if (key) keys.push(key)
  }
  return keys
}

const openaiClients = getApiKeys('OPENAI').map(key => new OpenAI({ apiKey: key }))
const groqClients = getApiKeys('GROQ').map(key => new OpenAI({ apiKey: key, baseURL: 'https://api.groq.com/openai/v1' }))
const geminiClients = getApiKeys('GOOGLE_GEMINI').map(key => new GoogleGenerativeAI(key))

interface FeatureItem {
  title: string
  description: string
  emoji: string
}

async function generateWithOpenAICompatible(
  client: OpenAI,
  model: string,
  prompt: string,
  providerName: string,
  keyIndex: number = 0
): Promise<string> {
  console.log(`[GENERATE INTRO] Tentative avec ${providerName} (clé #${keyIndex + 1}, ${model})...`)

  const completion = await client.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'Tu es un expert en copywriting et email marketing pour une plateforme SaaS de gestion de welcomebooks pour locations de vacances.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 300,
  })

  const result = completion.choices[0]?.message?.content?.trim() || ''
  console.log(`[GENERATE INTRO] ${providerName} (clé #${keyIndex + 1}) - Intro générée: ${result.substring(0, 50)}...`)
  return result
}

async function generateWithGemini(client: GoogleGenerativeAI, prompt: string, keyIndex: number = 0): Promise<string> {
  console.log(`[GENERATE INTRO] Tentative avec Google Gemini (clé #${keyIndex + 1})...`)

  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })
  const fullPrompt = `Tu es un expert en copywriting et email marketing pour une plateforme SaaS de gestion de welcomebooks pour locations de vacances.

${prompt}`

  const result = await model.generateContent(fullPrompt)
  const response = await result.response
  const generatedIntro = response.text().trim()

  console.log(`[GENERATE INTRO] Google Gemini (clé #${keyIndex + 1}) - Intro générée: ${generatedIntro.substring(0, 50)}...`)
  return generatedIntro
}

export async function POST(request: NextRequest) {
  try {
    const { features, segment } = await request.json() as { features: FeatureItem[]; segment: string }

    if (!features || !Array.isArray(features) || features.length === 0) {
      return NextResponse.json({ error: 'Aucune fonctionnalité fournie' }, { status: 400 })
    }

    // Construire la liste des fonctionnalités pour le prompt
    const featuresList = features
      .map((f, i) => `${i + 1}. ${f.emoji} ${f.title}: ${f.description}`)
      .join('\n')

    // Adapter le message selon le segment
    let segmentContext = ''
    switch (segment) {
      case 'Inactif':
        segmentContext = 'Ces gestionnaires n\'ont pas encore créé de conseils. L\'intro doit être encourageante et montrer comment ces fonctionnalités vont les aider à démarrer.'
        break
      case 'Débutant':
        segmentContext = 'Ces gestionnaires débutent avec 1-3 conseils. L\'intro doit valoriser leurs premiers pas et les motiver à explorer plus de fonctionnalités.'
        break
      case 'Intermédiaire':
        segmentContext = 'Ces gestionnaires ont 4-7 conseils. L\'intro doit les encourager à passer au niveau supérieur avec des fonctionnalités avancées.'
        break
      case 'Avancé':
        segmentContext = 'Ces gestionnaires ont 8-15 conseils. L\'intro peut être plus technique et montrer des fonctionnalités avancées pour optimiser leur welcomebook.'
        break
      case 'Expert':
        segmentContext = 'Ces gestionnaires sont des power users avec 16+ conseils. L\'intro doit les traiter en experts et présenter les nouveautés comme des outils professionnels.'
        break
      default:
        segmentContext = 'L\'intro s\'adresse à tous les gestionnaires, du débutant à l\'expert. Elle doit être accessible et engageante pour tous.'
    }

    const prompt = `Tu rédiges l'introduction d'un email marketing pour WelcomeApp, une plateforme qui aide les propriétaires de locations de vacances à créer des welcomebooks numériques pour leurs voyageurs.

FONCTIONNALITÉS À METTRE EN AVANT :
${featuresList}

CONTEXTE SEGMENT :
${segmentContext}

Ta mission : Rédige une introduction courte (2-3 phrases maximum, environ 50-80 mots) qui :
- Interpelle le gestionnaire de façon personnelle et chaleureuse
- Crée de l'excitation autour des fonctionnalités présentées
- Donne envie de lire la suite de l'email
- Utilise un ton amical mais professionnel
- NE PAS utiliser "Cher(e)" ou "Bonjour" en début (l'email a déjà un header)
- NE PAS lister les fonctionnalités (elles sont présentées après)
- NE PAS faire de phrases trop longues ou complexes

Exemples de styles attendus :
- "Vous cherchez à offrir une expérience inoubliable à vos voyageurs ? Nous avons travaillé sur quelques pépites qui vont transformer votre welcomebook en véritable guide personnalisé !"
- "Cette semaine, on a quelque chose de spécial pour vous. Des fonctionnalités que vous nous avez demandées, et d'autres qui vont vous surprendre..."
- "Bonne nouvelle : votre welcomebook vient de gagner en puissance ! Voici ce qui change pour vous et vos voyageurs."

Rédige uniquement l'introduction, sans titre ni signature.`

    let generatedIntro = ''

    // 1. Essayer OpenAI
    for (let i = 0; i < openaiClients.length && !generatedIntro; i++) {
      try {
        generatedIntro = await generateWithOpenAICompatible(openaiClients[i], 'gpt-4o-mini', prompt, 'OpenAI GPT-4o-mini', i)
        break
      } catch (error: unknown) {
        const err = error as { status?: number; code?: string; message?: string }
        const isRateLimit = err?.status === 429 || err?.code === 'rate_limit_exceeded'
        const isQuotaExceeded = err?.message?.includes('quota') || err?.message?.includes('insufficient_quota')

        if (isRateLimit || isQuotaExceeded) {
          console.warn(`[GENERATE INTRO] OpenAI (clé #${i + 1}) - Quota atteint`)
        } else {
          console.error(`[GENERATE INTRO] OpenAI (clé #${i + 1}) - Erreur:`, err?.message)
        }
      }
    }

    // 2. Essayer Groq
    for (let i = 0; i < groqClients.length && !generatedIntro; i++) {
      try {
        generatedIntro = await generateWithOpenAICompatible(groqClients[i], 'llama-3.3-70b-versatile', prompt, 'Groq Llama 3.3', i)
        break
      } catch (error: unknown) {
        const err = error as { status?: number; code?: string; message?: string }
        const isRateLimit = err?.status === 429 || err?.code === 'rate_limit_exceeded'
        const isQuotaExceeded = err?.message?.includes('quota') || err?.message?.includes('insufficient_quota')

        if (isRateLimit || isQuotaExceeded) {
          console.warn(`[GENERATE INTRO] Groq (clé #${i + 1}) - Quota atteint`)
        } else {
          console.error(`[GENERATE INTRO] Groq (clé #${i + 1}) - Erreur:`, err?.message)
        }
      }
    }

    // 3. Essayer Gemini
    for (let i = 0; i < geminiClients.length && !generatedIntro; i++) {
      try {
        generatedIntro = await generateWithGemini(geminiClients[i], prompt, i)
        break
      } catch (error: unknown) {
        const err = error as { status?: number; code?: string; message?: string }
        const isRateLimit = err?.status === 429 || err?.code === 'rate_limit_exceeded'
        const isQuotaExceeded = err?.message?.includes('quota') || err?.message?.includes('insufficient_quota')

        if (isRateLimit || isQuotaExceeded) {
          console.warn(`[GENERATE INTRO] Gemini (clé #${i + 1}) - Quota atteint`)
        } else {
          console.error(`[GENERATE INTRO] Gemini (clé #${i + 1}) - Erreur:`, err?.message)
        }
      }
    }

    if (!generatedIntro) {
      console.warn('[GENERATE INTRO] Tous les providers ont échoué')
      return NextResponse.json({ error: 'Impossible de générer l\'introduction' }, { status: 500 })
    }

    return NextResponse.json({ intro: generatedIntro })
  } catch (error: unknown) {
    const err = error as Error
    console.error('[GENERATE INTRO] Erreur fatale:', err)
    return NextResponse.json({ error: err?.message || 'Erreur interne' }, { status: 500 })
  }
}
