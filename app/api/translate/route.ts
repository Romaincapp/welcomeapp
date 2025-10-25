import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Fonction pour obtenir le client OpenAI (lazy initialization)
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY non configurée')
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

// Langues supportées
const SUPPORTED_LANGUAGES = {
  en: 'English',
  es: 'Spanish',
  nl: 'Dutch',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
}

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguages, context } = await request.json()

    // Validation
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Le champ "text" est requis et doit être une chaîne' },
        { status: 400 }
      )
    }

    if (!targetLanguages || !Array.isArray(targetLanguages)) {
      return NextResponse.json(
        { error: 'Le champ "targetLanguages" doit être un tableau de codes de langue' },
        { status: 400 }
      )
    }

    // Vérifier que toutes les langues sont supportées
    const unsupportedLangs = targetLanguages.filter(
      (lang) => !SUPPORTED_LANGUAGES[lang as keyof typeof SUPPORTED_LANGUAGES]
    )
    if (unsupportedLangs.length > 0) {
      return NextResponse.json(
        { error: `Langues non supportées: ${unsupportedLangs.join(', ')}` },
        { status: 400 }
      )
    }

    // Construire le prompt pour OpenAI
    const languageList = targetLanguages
      .map((lang) => `- ${SUPPORTED_LANGUAGES[lang as keyof typeof SUPPORTED_LANGUAGES]} (${lang})`)
      .join('\n')

    const systemPrompt = `Tu es un traducteur professionnel spécialisé dans les applications de voyage et d'hébergement touristique.
Traduis le texte fourni dans les langues demandées en conservant le ton, le style et l'intention du message original.

${context ? `Contexte: ${context}` : ''}

IMPORTANT:
- Conserve les émojis et la ponctuation
- Adapte les expressions idiomatiques au contexte culturel
- Pour les noms propres (restaurants, lieux), ne les traduis pas
- Pour les catégories génériques (Restaurants, Activités), traduis-les naturellement
- Retourne UNIQUEMENT un objet JSON avec les traductions, sans texte supplémentaire`

    const userPrompt = `Texte à traduire (en français): "${text}"

Langues cibles:
${languageList}

Retourne un objet JSON au format:
{
  "en": "traduction anglaise",
  "es": "traduction espagnole",
  ...
}`

    console.log('[TRANSLATE API] Demande de traduction:', {
      text: text.substring(0, 100),
      targetLanguages,
      context,
    })

    // Appeler OpenAI
    const openai = getOpenAIClient()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Modèle économique et rapide
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3, // Peu de créativité, traductions cohérentes
      response_format: { type: 'json_object' },
    })

    const translatedContent = completion.choices[0]?.message?.content
    if (!translatedContent) {
      throw new Error('Pas de réponse de l\'API OpenAI')
    }

    const translations = JSON.parse(translatedContent)

    console.log('[TRANSLATE API] Traductions réussies:', translations)

    return NextResponse.json({ translations })
  } catch (error) {
    console.error('[TRANSLATE API] Erreur:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Erreur de traduction: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur inconnue lors de la traduction' },
      { status: 500 }
    )
  }
}
