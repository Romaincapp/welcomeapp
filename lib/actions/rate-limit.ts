'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface CooldownStatus {
  canGenerate: boolean
  lastGenerationAt: string | null
  secondsRemaining: number
}

export interface QuotaStatus {
  canGenerate: boolean
  usedCount: number
  maxCount: number
}

/**
 * Vérifie si le client peut générer des commentaires (cooldown de 5 min)
 */
export async function checkGenerationCooldown(clientId: string): Promise<CooldownStatus> {
  const supabase = await createServerSupabaseClient()

  try {
    const { data, error } = await (supabase as any)
      .rpc('check_generation_cooldown', { p_client_id: clientId })

    if (error) {
      console.error('[RATE LIMIT] Erreur cooldown check:', error)
      // En cas d'erreur, on autorise (fail-open)
      return { canGenerate: true, lastGenerationAt: null, secondsRemaining: 0 }
    }

    const result = data[0]
    return {
      canGenerate: result.can_generate,
      lastGenerationAt: result.last_generation_at,
      secondsRemaining: result.seconds_remaining || 0,
    }
  } catch (error) {
    console.error('[RATE LIMIT] Erreur:', error)
    return { canGenerate: true, lastGenerationAt: null, secondsRemaining: 0 }
  }
}

/**
 * Vérifie le quota quotidien (max 100 générations/jour)
 */
export async function checkDailyQuota(clientId: string): Promise<QuotaStatus> {
  const supabase = await createServerSupabaseClient()

  try {
    const { data, error } = await (supabase as any)
      .rpc('check_daily_quota', { p_client_id: clientId })

    if (error) {
      console.error('[RATE LIMIT] Erreur quota check:', error)
      // En cas d'erreur, on autorise (fail-open)
      return { canGenerate: true, usedCount: 0, maxCount: 100 }
    }

    const result = data[0]
    return {
      canGenerate: result.can_generate,
      usedCount: result.used_count || 0,
      maxCount: result.max_count || 100,
    }
  } catch (error) {
    console.error('[RATE LIMIT] Erreur:', error)
    return { canGenerate: true, usedCount: 0, maxCount: 100 }
  }
}

/**
 * Enregistre une génération dans les logs
 */
export async function logGeneration(
  clientId: string,
  tipsCount: number,
  providerUsed: string,
  successCount: number,
  failedCount: number
): Promise<void> {
  const supabase = await createServerSupabaseClient()

  try {
    // Note: La table ai_generation_logs n'est pas encore dans database.types.ts
    // Elle sera ajoutée après l'application de la migration 20251027
    const { error } = await (supabase as any)
      .from('ai_generation_logs')
      .insert({
        client_id: clientId,
        tips_count: tipsCount,
        provider_used: providerUsed,
        success_count: successCount,
        failed_count: failedCount,
      })

    if (error) {
      console.error('[RATE LIMIT] Erreur log insertion:', error)
    } else {
      console.log(`[RATE LIMIT] ✅ Log enregistré: ${tipsCount} tips, ${providerUsed}`)
    }
  } catch (error) {
    console.error('[RATE LIMIT] Erreur:', error)
  }
}
