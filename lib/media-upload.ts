/**
 * Helper pour télécharger et uploader des photos Google vers Supabase Storage
 * Résout le problème d'expiration des photo_reference tokens
 * Optimise les images avec Sharp (compression WebP, resize) pour économiser 70% de stockage
 *
 * ⚠️ SERVER-SIDE ONLY: Sharp requiert Node.js (fs, child_process)
 * Ce fichier ne peut être importé que dans des server actions ou API routes
 */

'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import sharp from 'sharp'

/**
 * Optimise une image avec Sharp : resize + compression WebP
 * Réduit la taille de ~70% (0,7 MB → 0,2 MB) sans perte de qualité perceptible
 * @param blob Image originale (JPEG/PNG)
 * @returns Buffer optimisé (WebP, quality 80%, max 1000px)
 */
async function optimizeImage(blob: Blob): Promise<{ buffer: Buffer; originalSize: number; optimizedSize: number }> {
  const arrayBuffer = await blob.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const originalSize = buffer.length

  const optimizedBuffer = await sharp(buffer)
    .resize(1000, null, {
      withoutEnlargement: true, // Ne pas agrandir les petites images
      fit: 'inside' // Préserve le ratio d'aspect
    })
    .webp({ quality: 80 }) // WebP 80% = qualité imperceptible, 50-70% plus léger
    .toBuffer()

  const optimizedSize = optimizedBuffer.length

  return { buffer: optimizedBuffer, originalSize, optimizedSize }
}

/**
 * Télécharge une photo Google via le proxy et l'uploade vers Supabase Storage
 * @param googlePhotoUrl URL proxy Google (ex: /api/places/photo?photo_reference=xxx)
 * @param tipId ID du tip auquel la photo appartient
 * @returns URL publique Supabase permanente ou null si erreur
 */
export async function downloadAndUploadGooglePhoto(
  googlePhotoUrl: string,
  tipId: string,
  retries: number = 3
): Promise<string | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[MEDIA UPLOAD] Téléchargement photo Google (tentative ${attempt}/${retries}):`, googlePhotoUrl)

      // 1. Télécharger l'image depuis le proxy
      const response = await fetch(googlePhotoUrl, {
        headers: {
          'User-Agent': 'WelcomeApp/1.0'
        }
      })

      if (!response.ok) {
        console.error(`[MEDIA UPLOAD] Erreur téléchargement (tentative ${attempt}):`, response.status, response.statusText)

        // Retry si erreur serveur (5xx) ou timeout
        if (attempt < retries && (response.status >= 500 || response.status === 408)) {
          const delay = attempt * 1000 // 1s, 2s, 3s
          console.log(`[MEDIA UPLOAD] Retry dans ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }

        return null
      }

      const blob = await response.blob()

      // Vérifier que c'est bien une image
      if (!blob.type.startsWith('image/')) {
        console.error('[MEDIA UPLOAD] Type de fichier invalide:', blob.type)
        return null
      }

      console.log('[MEDIA UPLOAD] Photo téléchargée, taille originale:', (blob.size / 1024).toFixed(2), 'KB')

      // 2. Optimiser l'image (compression WebP + resize)
      const { buffer: optimizedBuffer, originalSize, optimizedSize } = await optimizeImage(blob)
      const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(1)
      console.log(`[MEDIA UPLOAD] ✅ Image optimisée: ${(optimizedSize / 1024).toFixed(2)} KB (économie: ${savings}%)`)

      // 3. Générer un nom de fichier unique (avec extension .webp)
      const fileName = `${tipId}-google-${Date.now()}.webp`
      const filePath = `tips/${fileName}`

      // 4. Uploader vers Supabase Storage
      const supabase = await createServerSupabaseClient()

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, optimizedBuffer, {
          contentType: 'image/webp',
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('[MEDIA UPLOAD] Erreur upload Supabase:', uploadError)
        return null
      }

      // 5. Récupérer l'URL publique permanente
      const { data: publicUrlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath)

      console.log('[MEDIA UPLOAD] ✅ Upload réussi:', publicUrlData.publicUrl)

      return publicUrlData.publicUrl

    } catch (error) {
      console.error(`[MEDIA UPLOAD] Erreur inattendue (tentative ${attempt}/${retries}):`, error)

      // Retry en cas d'erreur réseau ou autre
      if (attempt < retries) {
        const delay = attempt * 1000 // 1s, 2s, 3s
        console.log(`[MEDIA UPLOAD] Retry dans ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }

      return null
    }
  }

  // Si toutes les tentatives ont échoué
  console.error('[MEDIA UPLOAD] ❌ Échec après', retries, 'tentatives')
  return null
}

/**
 * Télécharge et uploade plusieurs photos Google en parallèle
 * @param googlePhotoUrls Array d'URLs proxy Google
 * @param tipId ID du tip
 * @returns Array d'URLs publiques Supabase (null pour les échecs)
 */
export async function downloadAndUploadMultipleGooglePhotos(
  googlePhotoUrls: string[],
  tipId: string
): Promise<(string | null)[]> {
  console.log('[MEDIA UPLOAD] Upload de', googlePhotoUrls.length, 'photo(s) en parallèle')

  const promises = googlePhotoUrls.map(url =>
    downloadAndUploadGooglePhoto(url, tipId)
  )

  const results = await Promise.all(promises)

  const successCount = results.filter(r => r !== null).length
  console.log(`[MEDIA UPLOAD] ✅ ${successCount}/${googlePhotoUrls.length} photo(s) uploadée(s)`)

  return results
}
