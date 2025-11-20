/**
 * Helper pour télécharger et uploader des photos Google vers Supabase Storage
 * Résout le problème d'expiration des photo_reference tokens
 */

import { createClient } from '@/lib/supabase/client'

/**
 * Télécharge une photo Google via le proxy et l'uploade vers Supabase Storage
 * @param googlePhotoUrl URL proxy Google (ex: /api/places/photo?photo_reference=xxx)
 * @param tipId ID du tip auquel la photo appartient
 * @returns URL publique Supabase permanente ou null si erreur
 */
export async function downloadAndUploadGooglePhoto(
  googlePhotoUrl: string,
  tipId: string
): Promise<string | null> {
  try {
    console.log('[MEDIA UPLOAD] Téléchargement photo Google:', googlePhotoUrl)

    // 1. Télécharger l'image depuis le proxy
    const response = await fetch(googlePhotoUrl)

    if (!response.ok) {
      console.error('[MEDIA UPLOAD] Erreur téléchargement:', response.status, response.statusText)
      return null
    }

    const blob = await response.blob()

    // Vérifier que c'est bien une image
    if (!blob.type.startsWith('image/')) {
      console.error('[MEDIA UPLOAD] Type de fichier invalide:', blob.type)
      return null
    }

    console.log('[MEDIA UPLOAD] Photo téléchargée, taille:', (blob.size / 1024).toFixed(2), 'KB')

    // 2. Générer un nom de fichier unique
    const fileExt = blob.type.split('/')[1] || 'jpg'
    const fileName = `${tipId}-google-${Date.now()}.${fileExt}`
    const filePath = `tips/${fileName}`

    // 3. Uploader vers Supabase Storage
    const supabase = createClient()

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, blob, {
        contentType: blob.type,
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('[MEDIA UPLOAD] Erreur upload Supabase:', uploadError)
      return null
    }

    // 4. Récupérer l'URL publique permanente
    const { data: publicUrlData } = supabase.storage
      .from('media')
      .getPublicUrl(filePath)

    console.log('[MEDIA UPLOAD] ✅ Upload réussi:', publicUrlData.publicUrl)

    return publicUrlData.publicUrl

  } catch (error) {
    console.error('[MEDIA UPLOAD] Erreur inattendue:', error)
    return null
  }
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
