/**
 * API Route pour migrer les photos Google vers Supabase Storage
 * Usage: POST /api/admin/migrate-google-photos
 * Body: { clientSlug: "campingduwignet" } ou { clientId: "xxx" }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes max

interface MigrationResult {
  mediaId: string
  tipTitle: string
  success: boolean
  oldUrl?: string
  newUrl?: string
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !GOOGLE_PLACES_API_KEY) {
      return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 })
    }

    const body = await request.json()
    const { clientSlug, clientId } = body

    if (!clientSlug && !clientId) {
      return NextResponse.json({ error: 'Missing clientSlug or clientId' }, { status: 400 })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // 1. Récupérer toutes les images Google non migrées pour ce client
    let query = supabase
      .from('tip_media')
      .select(`
        id,
        url,
        tip_id,
        tips!inner(
          id,
          title,
          client_id,
          clients!inner(id, slug)
        )
      `)
      .or('url.ilike.%googleapis.com%,url.ilike.%googleusercontent.com%,url.ilike.%/api/places%')

    if (clientSlug) {
      query = query.eq('tips.clients.slug', clientSlug)
    } else {
      query = query.eq('tips.clients.id', clientId)
    }

    const { data: mediaToMigrate, error: fetchError } = await query

    if (fetchError) {
      console.error('[MIGRATE] Erreur fetch:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch media', details: fetchError.message }, { status: 500 })
    }

    if (!mediaToMigrate || mediaToMigrate.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No Google photos to migrate',
        migrated: 0
      })
    }

    console.log(`[MIGRATE] 📸 ${mediaToMigrate.length} images à migrer`)

    const results: MigrationResult[] = []

    // 2. Migrer chaque image
    for (const media of mediaToMigrate) {
      // Supabase returns nested relations, extract tip data safely
      const tipData = media.tips as unknown as { id: string; title: string; client_id: string }
      console.log(`[MIGRATE] Processing: ${tipData.title}`)

      try {
        let googlePhotoUrl = media.url

        // Extraire photo_reference si nécessaire
        if (googlePhotoUrl.includes('photo_reference') && googlePhotoUrl.includes('googleapis.com')) {
          // URL déjà correcte, on la garde
        } else if (googlePhotoUrl.includes('/api/places/photo')) {
          const url = new URL(googlePhotoUrl, 'http://localhost')
          const photoReference = url.searchParams.get('photo_reference')
          const maxwidth = url.searchParams.get('maxwidth') || '1200'
          if (photoReference) {
            googlePhotoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photo_reference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`
          }
        }

        // Télécharger l'image
        const photoResponse = await fetch(googlePhotoUrl, {
          headers: { 'User-Agent': 'WelcomeApp/1.0' },
          redirect: 'follow'
        })

        if (!photoResponse.ok) {
          throw new Error(`Failed to download: ${photoResponse.status}`)
        }

        const blob = await photoResponse.blob()
        if (!blob.type.startsWith('image/')) {
          throw new Error(`Invalid file type: ${blob.type}`)
        }

        // Optimiser avec Sharp
        const arrayBuffer = await blob.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const optimizedBuffer = await sharp(buffer)
          .resize(1200, null, { withoutEnlargement: true, fit: 'inside' })
          .webp({ quality: 80 })
          .toBuffer()

        // Upload vers Supabase
        const fileName = `${tipData.id}-migrated-${Date.now()}.webp`
        const filePath = `tips/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, optimizedBuffer, {
            contentType: 'image/webp',
            cacheControl: '31536000', // 1 an
            upsert: false
          })

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`)
        }

        // Récupérer l'URL publique
        const { data: publicUrlData } = supabase.storage
          .from('media')
          .getPublicUrl(filePath)

        const newUrl = publicUrlData.publicUrl

        // Mettre à jour la DB
        const { error: updateError } = await supabase
          .from('tip_media')
          .update({ url: newUrl })
          .eq('id', media.id)

        if (updateError) {
          throw new Error(`DB update failed: ${updateError.message}`)
        }

        console.log(`[MIGRATE] ✅ ${tipData.title}: migré avec succès`)

        results.push({
          mediaId: media.id,
          tipTitle: tipData.title,
          success: true,
          oldUrl: media.url.substring(0, 50) + '...',
          newUrl
        })

      } catch (error) {
        console.error(`[MIGRATE] ❌ ${tipData.title}:`, error)
        results.push({
          mediaId: media.id,
          tipTitle: tipData.title,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }

      // Petit délai pour éviter le rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    console.log(`[MIGRATE] 🏁 Terminé: ${successCount} succès, ${failCount} échecs`)

    return NextResponse.json({
      success: true,
      total: mediaToMigrate.length,
      migrated: successCount,
      failed: failCount,
      results
    })

  } catch (error) {
    console.error('[MIGRATE] Erreur inattendue:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
