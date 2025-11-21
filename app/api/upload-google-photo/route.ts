/**
 * API Route pour télécharger, optimiser et uploader une photo Google vers Supabase Storage
 * Utilise Sharp (server-side) pour compression WebP ~70% d'économie de stockage
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs' // Sharp requiert Node.js

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let { googlePhotoUrl, tipId } = body

    if (!googlePhotoUrl || !tipId) {
      return NextResponse.json(
        { error: 'Missing googlePhotoUrl or tipId parameter' },
        { status: 400 }
      )
    }

    // Si c'est une URL de notre proxy local, extraire photo_reference et appeler Google directement
    // (fetch côté serveur ne peut pas résoudre les URLs relatives)
    if (googlePhotoUrl.includes('/api/places/photo') || (googlePhotoUrl.includes('photo_reference') && !googlePhotoUrl.includes('googleapis.com'))) {
      const url = new URL(googlePhotoUrl, 'http://localhost')
      const photoReference = url.searchParams.get('photo_reference')
      const maxwidth = url.searchParams.get('maxwidth') || '1000'

      if (!photoReference) {
        return NextResponse.json(
          { error: 'Missing photo_reference in URL' },
          { status: 400 }
        )
      }

      googlePhotoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photo_reference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`
      console.log('[UPLOAD API] URL proxy détectée, conversion vers Google API directe')
    }

    console.log('[UPLOAD API] Téléchargement photo Google:', googlePhotoUrl.substring(0, 80))

    // 1. Télécharger l'image depuis Google Places API
    const photoResponse = await fetch(googlePhotoUrl, {
      headers: {
        'User-Agent': 'WelcomeApp/1.0'
      },
      redirect: 'follow' // Suivre les redirections Google
    })

    if (!photoResponse.ok) {
      console.error('[UPLOAD API] Erreur téléchargement:', photoResponse.status)
      return NextResponse.json(
        { error: 'Failed to download image from Google' },
        { status: photoResponse.status }
      )
    }

    const blob = await photoResponse.blob()
    const originalSize = blob.size

    // Vérifier le type
    if (!blob.type.startsWith('image/')) {
      return NextResponse.json(
        { error: `Invalid file type: ${blob.type}` },
        { status: 400 }
      )
    }

    console.log(`[UPLOAD API] Image téléchargée: ${(originalSize / 1024).toFixed(2)} KB`)

    // 2. Optimiser avec Sharp (WebP + resize + compression)
    const arrayBuffer = await blob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const optimizedBuffer = await sharp(buffer)
      .resize(1000, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: 80 })
      .toBuffer()

    const optimizedSize = optimizedBuffer.length
    const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(1)

    console.log(`[UPLOAD API] ✅ Optimisé: ${(optimizedSize / 1024).toFixed(2)} KB (économie: ${savings}%)`)

    // 3. Upload vers Supabase Storage
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const fileName = `${tipId}-google-${Date.now()}.webp`
    const filePath = `tips/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, optimizedBuffer, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('[UPLOAD API] Erreur upload:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload to storage', details: uploadError.message },
        { status: 500 }
      )
    }

    // 4. Récupérer l'URL publique
    const { data: publicUrlData } = supabase.storage
      .from('media')
      .getPublicUrl(filePath)

    console.log('[UPLOAD API] ✅ Upload réussi:', publicUrlData.publicUrl)

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      originalSize,
      optimizedSize,
      savings: parseFloat(savings)
    })

  } catch (error) {
    console.error('[UPLOAD API] Erreur inattendue:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
