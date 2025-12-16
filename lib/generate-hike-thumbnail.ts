/**
 * Génère et upload une miniature de carte pour un itinéraire de randonnée
 * Utilise l'API Geoapify pour générer l'image, puis la compresse et l'upload vers Supabase Storage
 */

import { HikeWaypoint } from '@/types'
import { createClient } from '@/lib/supabase/client'

interface GenerateThumbnailResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Génère une miniature de carte pour un itinéraire et l'upload vers Supabase Storage
 */
export async function generateAndUploadHikeThumbnail(
  waypoints: HikeWaypoint[],
  tipId: string
): Promise<GenerateThumbnailResult> {
  try {
    if (!waypoints || waypoints.length === 0) {
      return { success: false, error: 'No waypoints provided' }
    }

    // Calculer les bounds
    const lats = waypoints.map(w => w.lat)
    const lngs = waypoints.map(w => w.lng)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)

    const centerLat = (minLat + maxLat) / 2
    const centerLng = (minLng + maxLng) / 2

    // Calculer le zoom
    const latDiff = maxLat - minLat
    const lngDiff = maxLng - minLng
    const maxDiff = Math.max(latDiff, lngDiff)

    let zoom = 12
    if (maxDiff > 0.5) zoom = 9
    else if (maxDiff > 0.2) zoom = 10
    else if (maxDiff > 0.1) zoom = 11
    else if (maxDiff > 0.05) zoom = 12
    else zoom = 13

    // Créer les markers
    const startMarker = `lonlat:${waypoints[0].lng},${waypoints[0].lat};color:%23059669;size:medium`
    const endMarker = `lonlat:${waypoints[waypoints.length - 1].lng},${waypoints[waypoints.length - 1].lat};color:%23dc2626;size:medium`

    // Créer le path (simplifier à max 30 points)
    const step = Math.max(1, Math.floor(waypoints.length / 30))
    const routePoints = waypoints
      .filter((_, i) => i % step === 0 || i === waypoints.length - 1)
      .map(w => `${w.lat},${w.lng}`)
      .join(',')

    const geometry = `polyline:${routePoints};strokecolor:%232563eb;strokewidth:5`

    // Générer l'URL de l'API Geoapify
    const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || 'demo'
    const width = 600
    const height = 400

    const imageUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=${width}&height=${height}&center=lonlat:${centerLng},${centerLat}&zoom=${zoom}&marker=${startMarker}&marker=${endMarker}&geometry=${geometry}&apiKey=${apiKey}`

    console.log('[GenerateThumbnail] Fetching image from:', imageUrl)

    // Télécharger l'image depuis Geoapify
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`)
    }

    // Convertir en blob
    const imageBlob = await imageResponse.blob()

    // Créer un nom de fichier unique
    const fileName = `hike-thumbnail-${tipId}-${Date.now()}.png`
    const filePath = `hike-thumbnails/${fileName}`

    // Upload vers Supabase Storage
    const supabase = createClient()
    const { data, error } = await supabase.storage
      .from('tips-media')
      .upload(filePath, imageBlob, {
        contentType: 'image/png',
        cacheControl: '31536000', // 1 an de cache
        upsert: false
      })

    if (error) {
      console.error('[GenerateThumbnail] Upload error:', error)
      return { success: false, error: error.message }
    }

    // Obtenir l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('tips-media')
      .getPublicUrl(filePath)

    console.log('[GenerateThumbnail] Successfully uploaded to:', publicUrl)

    return {
      success: true,
      url: publicUrl
    }
  } catch (error) {
    console.error('[GenerateThumbnail] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Supprime l'ancienne miniature de carte si elle existe
 */
export async function deleteHikeThumbnail(url: string): Promise<void> {
  try {
    // Extraire le path depuis l'URL
    const urlObj = new URL(url)
    const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/tips-media\/(.+)/)

    if (!pathMatch) {
      console.warn('[DeleteThumbnail] Could not extract path from URL:', url)
      return
    }

    const filePath = pathMatch[1]

    const supabase = createClient()
    const { error } = await supabase.storage
      .from('tips-media')
      .remove([filePath])

    if (error) {
      console.error('[DeleteThumbnail] Error deleting:', error)
    } else {
      console.log('[DeleteThumbnail] Successfully deleted:', filePath)
    }
  } catch (error) {
    console.error('[DeleteThumbnail] Error:', error)
  }
}
