/**
 * Utilitaires de cache pour SmartFill
 * Réduit les coûts API Google Places en cachant les résultats de recherches identiques
 */

import { createClient } from '@/lib/supabase/client'

interface CacheEntry {
  id: string
  cache_key: string
  results: any
  created_at: string
  expires_at: string
  hit_count: number
  last_hit_at: string | null
}

/**
 * Génère une clé de cache unique basée sur les paramètres de recherche
 * Format: lat_lng_radius_category
 * Exemple: "48.8566_2.3522_5000_restaurants"
 */
export function generateCacheKey(
  lat: number,
  lng: number,
  radius: number,
  category: string
): string {
  // Arrondir les coordonnées à 4 décimales (~11m de précision)
  // pour permettre le cache même avec de légères variations GPS
  const roundedLat = Math.round(lat * 10000) / 10000
  const roundedLng = Math.round(lng * 10000) / 10000

  return `${roundedLat}_${roundedLng}_${radius}_${category}`
}

/**
 * Récupère les résultats du cache s'ils existent et ne sont pas expirés
 * @param cacheKey Clé de cache générée par generateCacheKey
 * @returns Résultats cachés ou null si pas trouvé/expiré
 */
export async function getCachedResults(cacheKey: string): Promise<any | null> {
  try {
    const supabase = createClient()

    const { data, error } = await (supabase as any)
      .from('smartfill_cache')
      .select('*')
      .eq('cache_key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error || !data) {
      return null
    }

    // Incrémenter le compteur d'utilisation
    await (supabase as any)
      .from('smartfill_cache')
      .update({
        hit_count: data.hit_count + 1,
        last_hit_at: new Date().toISOString(),
      })
      .eq('id', data.id)

    console.log(`[Cache HIT] ${cacheKey} (hit #${data.hit_count + 1})`)
    return data.results
  } catch (error) {
    console.error('[Cache Error]', error)
    return null
  }
}

/**
 * Stocke les résultats dans le cache
 * @param cacheKey Clé de cache
 * @param results Résultats à cacher
 * @param ttlMinutes Durée de vie en minutes (par défaut 60)
 */
export async function setCachedResults(
  cacheKey: string,
  results: any,
  ttlMinutes: number = 60
): Promise<void> {
  try {
    const supabase = createClient()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000)

    const { error } = await (supabase as any)
      .from('smartfill_cache')
      .upsert({
        cache_key: cacheKey,
        results,
        expires_at: expiresAt.toISOString(),
        hit_count: 0,
        last_hit_at: null,
      }, {
        onConflict: 'cache_key'
      })

    if (error) {
      console.error('[Cache SET Error]', error)
    } else {
      console.log(`[Cache SET] ${cacheKey} (expires in ${ttlMinutes}min)`)
    }
  } catch (error) {
    console.error('[Cache Error]', error)
  }
}

/**
 * Nettoie les entrées expirées du cache
 * À appeler périodiquement (ex: cron job quotidien)
 */
export async function cleanExpiredCache(): Promise<number> {
  try {
    const supabase = createClient()

    const { data, error } = await (supabase as any)
      .from('smartfill_cache')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select()

    if (error) {
      console.error('[Cache Clean Error]', error)
      return 0
    }

    const deletedCount = data?.length || 0
    console.log(`[Cache Clean] Deleted ${deletedCount} expired entries`)
    return deletedCount
  } catch (error) {
    console.error('[Cache Error]', error)
    return 0
  }
}

/**
 * Obtient des statistiques d'utilisation du cache
 */
export async function getCacheStats(): Promise<{
  totalEntries: number
  activeEntries: number
  totalHits: number
  mostUsedKeys: Array<{ cache_key: string; hit_count: number }>
}> {
  try {
    const supabase = createClient()

    // Total d'entrées
    const { count: totalEntries } = await (supabase as any)
      .from('smartfill_cache')
      .select('*', { count: 'exact', head: true })

    // Entrées actives (non expirées)
    const { count: activeEntries } = await (supabase as any)
      .from('smartfill_cache')
      .select('*', { count: 'exact', head: true })
      .gt('expires_at', new Date().toISOString())

    // Total de hits
    const { data: hitsData } = await (supabase as any)
      .from('smartfill_cache')
      .select('hit_count')

    const totalHits = hitsData?.reduce((sum: number, entry: any) => sum + entry.hit_count, 0) || 0

    // Top 10 clés les plus utilisées
    const { data: topKeys } = await (supabase as any)
      .from('smartfill_cache')
      .select('cache_key, hit_count')
      .order('hit_count', { ascending: false })
      .limit(10)

    return {
      totalEntries: totalEntries || 0,
      activeEntries: activeEntries || 0,
      totalHits,
      mostUsedKeys: topKeys || [],
    }
  } catch (error) {
    console.error('[Cache Stats Error]', error)
    return {
      totalEntries: 0,
      activeEntries: 0,
      totalHits: 0,
      mostUsedKeys: [],
    }
  }
}
