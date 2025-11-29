/**
 * Script de migration des photos Google vers Supabase Storage
 * Usage: node scripts/migrate-google-photos.mjs
 */

import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Charger les variables d'environnement
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !GOOGLE_PLACES_API_KEY) {
  console.error('❌ Variables d\'environnement manquantes')
  console.error('SUPABASE_URL:', !!SUPABASE_URL)
  console.error('SUPABASE_SERVICE_KEY:', !!SUPABASE_SERVICE_KEY)
  console.error('GOOGLE_PLACES_API_KEY:', !!GOOGLE_PLACES_API_KEY)
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function migrateGooglePhotos(clientSlug) {
  console.log(`\n🚀 Migration des photos Google pour: ${clientSlug}\n`)

  // 1. Récupérer toutes les images Google non migrées
  const { data: mediaToMigrate, error: fetchError } = await supabase
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
    .eq('tips.clients.slug', clientSlug)

  if (fetchError) {
    console.error('❌ Erreur fetch:', fetchError)
    return
  }

  if (!mediaToMigrate || mediaToMigrate.length === 0) {
    console.log('✅ Aucune image Google à migrer')
    return
  }

  console.log(`📸 ${mediaToMigrate.length} images à migrer\n`)

  let successCount = 0
  let failCount = 0

  for (let i = 0; i < mediaToMigrate.length; i++) {
    const media = mediaToMigrate[i]
    const tipData = media.tips
    const progress = `[${i + 1}/${mediaToMigrate.length}]`

    console.log(`${progress} ${tipData.title}...`)

    try {
      let googlePhotoUrl = media.url

      // S'assurer que l'URL est complète
      if (googlePhotoUrl.includes('/api/places/photo')) {
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
        throw new Error(`Download failed: ${photoResponse.status}`)
      }

      const arrayBuffer = await photoResponse.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Optimiser avec Sharp
      const optimizedBuffer = await sharp(buffer)
        .resize(1200, null, { withoutEnlargement: true, fit: 'inside' })
        .webp({ quality: 80 })
        .toBuffer()

      const originalSize = buffer.length
      const optimizedSize = optimizedBuffer.length
      const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(1)

      // Upload vers Supabase
      const fileName = `${tipData.id}-migrated-${Date.now()}.webp`
      const filePath = `tips/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, optimizedBuffer, {
          contentType: 'image/webp',
          cacheControl: '31536000',
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

      console.log(`   ✅ Migré (${(originalSize/1024).toFixed(0)}KB → ${(optimizedSize/1024).toFixed(0)}KB, -${savings}%)`)
      successCount++

    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`)
      failCount++
    }

    // Petit délai pour éviter le rate limiting
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  console.log(`\n🏁 Migration terminée!`)
  console.log(`   ✅ Succès: ${successCount}`)
  console.log(`   ❌ Échecs: ${failCount}`)
}

// Lancer la migration
migrateGooglePhotos('campingduwignet')
