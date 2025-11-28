'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { revalidatePath } from 'next/cache'
import type { OfficialSocialPost, OfficialSocialPostWithStats } from '@/types'

/**
 * Récupère tous les posts officiels (avec stats optionnelles)
 */
export async function getAllOfficialPosts(includeStats: boolean = false): Promise<{
  success: boolean
  data?: OfficialSocialPostWithStats[]
  error?: string
}> {
  try {
    await requireAdmin()
    const supabase = await createServerSupabaseClient()

    if (includeStats) {
      // Utiliser la vue SQL avec stats
      const { data, error } = await (supabase as any)
        .from('official_posts_analytics')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)
      return { success: true, data: data || [] }
    } else {
      // Simple query sans stats
      const { data, error } = await (supabase
        .from('official_social_posts') as any)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)
      return { success: true, data: data || [] }
    }
  } catch (error) {
    console.error('[GET ALL OFFICIAL POSTS] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

/**
 * Récupère un post officiel par ID
 */
export async function getOfficialPostById(postId: string): Promise<{
  success: boolean
  data?: OfficialSocialPost
  error?: string
}> {
  try {
    await requireAdmin()
    const supabase = await createServerSupabaseClient()

    const { data, error } = await (supabase
      .from('official_social_posts') as any)
      .select('*')
      .eq('id', postId)
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (!data) throw new Error('Post non trouvé')

    return { success: true, data }
  } catch (error) {
    console.error('[GET OFFICIAL POST BY ID] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

/**
 * Crée un nouveau post officiel
 */
export async function createOfficialPost(params: {
  platform: string
  post_url: string
  thumbnail_url?: string
  caption: string
  category?: string
  credits_reward: number
}): Promise<{ success: boolean; data?: OfficialSocialPost; error?: string }> {
  try {
    await requireAdmin()
    const supabase = await createServerSupabaseClient()

    // Validation
    const validPlatforms = ['instagram', 'linkedin', 'facebook', 'twitter', 'blog', 'newsletter']
    if (!validPlatforms.includes(params.platform)) {
      throw new Error(`Plateforme invalide: ${params.platform}`)
    }

    if (params.credits_reward < 0) {
      throw new Error('Les crédits doivent être >= 0')
    }

    if (!params.caption || params.caption.length < 10) {
      throw new Error('Le caption doit contenir au moins 10 caractères')
    }

    // Insertion
    const { data, error } = await (supabase
      .from('official_social_posts') as any)
      .insert({
        platform: params.platform,
        post_url: params.post_url,
        thumbnail_url: params.thumbnail_url || null,
        caption: params.caption,
        category: params.category || null,
        credits_reward: params.credits_reward,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    revalidatePath('/admin/social-posts')
    revalidatePath('/dashboard/credits/earn')

    console.log('[CREATE OFFICIAL POST] Succès ✅', data.id)
    return { success: true, data }
  } catch (error) {
    console.error('[CREATE OFFICIAL POST] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

/**
 * Met à jour un post officiel
 */
export async function updateOfficialPost(
  postId: string,
  updates: Partial<OfficialSocialPost>
): Promise<{ success: boolean; data?: OfficialSocialPost; error?: string }> {
  try {
    await requireAdmin()
    const supabase = await createServerSupabaseClient()

    const { data, error } = await (supabase
      .from('official_social_posts') as any)
      .update(updates)
      .eq('id', postId)
      .select()
      .single()

    if (error) throw new Error(error.message)

    revalidatePath('/admin/social-posts')
    revalidatePath('/dashboard/credits/earn')

    console.log('[UPDATE OFFICIAL POST] Succès ✅', postId)
    return { success: true, data }
  } catch (error) {
    console.error('[UPDATE OFFICIAL POST] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

/**
 * Supprime un post officiel
 */
export async function deleteOfficialPost(postId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    await requireAdmin()
    const supabase = await createServerSupabaseClient()

    const { error } = await (supabase
      .from('official_social_posts') as any)
      .delete()
      .eq('id', postId)

    if (error) throw new Error(error.message)

    revalidatePath('/admin/social-posts')
    revalidatePath('/dashboard/credits/earn')

    console.log('[DELETE OFFICIAL POST] Succès ✅', postId)
    return { success: true }
  } catch (error) {
    console.error('[DELETE OFFICIAL POST] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

/**
 * Active/désactive un post officiel
 */
export async function togglePostActive(postId: string, isActive: boolean): Promise<{
  success: boolean
  error?: string
}> {
  try {
    await requireAdmin()
    const supabase = await createServerSupabaseClient()

    const { error } = await (supabase
      .from('official_social_posts') as any)
      .update({ is_active: isActive })
      .eq('id', postId)

    if (error) throw new Error(error.message)

    revalidatePath('/admin/social-posts')
    revalidatePath('/dashboard/credits/earn')

    console.log('[TOGGLE POST ACTIVE] Succès ✅', postId, isActive)
    return { success: true }
  } catch (error) {
    console.error('[TOGGLE POST ACTIVE] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

/**
 * Récupère les stats globales des partages sociaux
 */
export async function getSocialPostsStats(): Promise<{
  success: boolean
  data?: {
    total_posts: number
    active_posts: number
    total_shares: number
    total_credits_distributed: number
    unique_sharers: number
  }
  error?: string
}> {
  try {
    await requireAdmin()
    const supabase = await createServerSupabaseClient()

    // Total posts
    const { count: total_posts } = await (supabase
      .from('official_social_posts') as any)
      .select('id', { count: 'exact', head: true })

    // Active posts
    const { count: active_posts } = await (supabase
      .from('official_social_posts') as any)
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)

    // Total shares
    const { count: total_shares } = await (supabase
      .from('social_post_shares') as any)
      .select('id', { count: 'exact', head: true })

    // Total credits distributed
    const { data: creditsData } = await (supabase as any)
      .from('social_post_shares')
      .select('credits_awarded')

    const total_credits_distributed = creditsData?.reduce(
      (sum: number, row: any) => sum + row.credits_awarded,
      0
    ) || 0

    // Unique sharers
    const { data: sharersData } = await (supabase as any)
      .from('social_post_shares')
      .select('user_email')

    const unique_sharers = new Set(sharersData?.map((row: any) => row.user_email) || []).size

    return {
      success: true,
      data: {
        total_posts: total_posts || 0,
        active_posts: active_posts || 0,
        total_shares: total_shares || 0,
        total_credits_distributed,
        unique_sharers,
      },
    }
  } catch (error) {
    console.error('[GET SOCIAL POSTS STATS] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}
