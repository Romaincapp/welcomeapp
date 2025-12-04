/**
 * Route API pour proxier les requêtes de traduction côté client vers MyMemory API
 * Évite les problèmes CORS en faisant l'appel côté serveur
 *
 * Différent de /api/translate qui utilise OpenAI pour la traduction en masse
 * Celui-ci est pour la traduction en temps réel côté client (100% gratuit)
 *
 * MyMemory API : 10 000 requêtes/jour gratuites sans clé API
 * Meilleure qualité que LibreTranslate et toujours gratuit
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const MYMEMORY_API = 'https://api.mymemory.translated.net/get'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, sourceLang, targetLang } = body

    if (!text || !sourceLang || !targetLang) {
      return NextResponse.json(
        { error: 'Missing required parameters: text, sourceLang, targetLang' },
        { status: 400 }
      )
    }

    console.log('[TRANSLATE CLIENT] Requête:', { sourceLang, targetLang, textLength: text.length })

    // MyMemory utilise GET avec query params
    const url = new URL(MYMEMORY_API)
    url.searchParams.append('q', text)
    url.searchParams.append('langpair', `${sourceLang}|${targetLang}`)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[TRANSLATE CLIENT] Erreur MyMemory:', response.status, errorText)
      return NextResponse.json(
        { error: `MyMemory error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()

    // MyMemory retourne { responseData: { translatedText: "..." }, responseStatus: 200 }
    if (data.responseStatus !== 200) {
      console.error('[TRANSLATE CLIENT] MyMemory response error:', data)
      return NextResponse.json(
        { error: `Translation failed: ${data.responseDetails || 'Unknown error'}` },
        { status: 400 }
      )
    }

    let translatedText = data.responseData.translatedText

    // Protection contre les réponses invalides de MyMemory
    // Parfois l'API retourne des placeholders comme ":subject" au lieu de traduire
    if (translatedText && translatedText.startsWith(':') && !text.startsWith(':')) {
      console.warn('[TRANSLATE CLIENT] ⚠️ Réponse invalide détectée:', translatedText, '→ fallback vers texte original')
      translatedText = text // Fallback vers le texte original
    }

    console.log('[TRANSLATE CLIENT] ✅ Traduction réussie')

    return NextResponse.json({ translatedText })
  } catch (error) {
    console.error('[TRANSLATE CLIENT] Erreur:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Translation failed' },
      { status: 500 }
    )
  }
}
