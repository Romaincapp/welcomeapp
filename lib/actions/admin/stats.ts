'use server'

/**
 * Server actions pour les statistiques admin
 * Accès restreint aux administrateurs uniquement
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'

// =============================================================================
// TYPES
// =============================================================================

export interface PlatformOverviewStats {
  total_clients: number
  total_tips: number
  total_media: number
  total_qr_codes: number
  total_secure_sections: number
  total_views: number
  total_clicks: number
  total_shares: number
  total_pwa_installs: number
  active_clients: number
  average_rating: number | null
}

export interface SignupEvolutionData {
  signup_date: string
  new_signups: number
}

export interface TopWelcomebook {
  id: string
  email: string
  slug: string
  welcomebook_name: string | null
  created_at: string
  total_tips: number
  total_media: number
  total_views: number
  total_clicks: number
  has_shared: boolean
  has_secure_section: boolean
  has_qr_code: boolean
}

export interface ManagerCategory {
  id: string
  email: string
  slug: string
  created_at: string
  total_tips: number
  category: 'Inactif' | 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert'
  days_since_signup: number
}

// =============================================================================
// SERVER ACTIONS
// =============================================================================

/**
 * Récupère les statistiques globales de la plateforme
 */
export async function getAdminPlatformStats(): Promise<PlatformOverviewStats | null> {
  try {
    // Vérifier que l'utilisateur est admin
    await requireAdmin()

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('platform_overview_stats' as any)
      .select('*')
      .maybeSingle()

    if (error) {
      console.error('[ADMIN STATS] Error fetching platform stats:', error)
      return null
    }

    // WORKAROUND: Supabase view typing - approved pattern (see typescript-rules.md)
    return data as any as PlatformOverviewStats
  } catch (error) {
    console.error('[ADMIN STATS] Error:', error)
    throw error
  }
}

/**
 * Récupère l'évolution des inscriptions (90 derniers jours)
 */
export async function getSignupsEvolution(): Promise<SignupEvolutionData[]> {
  try {
    // Vérifier que l'utilisateur est admin
    await requireAdmin()

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('signups_evolution' as any)
      .select('*')
      .order('signup_date', { ascending: true })

    if (error) {
      console.error('[ADMIN STATS] Error fetching signups evolution:', error)
      return []
    }

    return (data || []) as any as SignupEvolutionData[]
  } catch (error) {
    console.error('[ADMIN STATS] Error:', error)
    throw error
  }
}

/**
 * Récupère le top welcomebooks (limité à N)
 */
export async function getTopWelcomebooks(limit: number = 10): Promise<TopWelcomebook[]> {
  try {
    // Vérifier que l'utilisateur est admin
    await requireAdmin()

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('top_welcomebooks' as any)
      .select('*')
      .limit(limit)

    if (error) {
      console.error('[ADMIN STATS] Error fetching top welcomebooks:', error)
      return []
    }

    return (data || []) as any as TopWelcomebook[]
  } catch (error) {
    console.error('[ADMIN STATS] Error:', error)
    throw error
  }
}

/**
 * Récupère les catégories de gestionnaires (répartition par niveau)
 */
export async function getManagerCategories(): Promise<ManagerCategory[]> {
  try {
    // Vérifier que l'utilisateur est admin
    await requireAdmin()

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('manager_categories' as any)
      .select('*')
      .order('total_tips', { ascending: false })

    if (error) {
      console.error('[ADMIN STATS] Error fetching manager categories:', error)
      return []
    }

    return (data || []) as any as ManagerCategory[]
  } catch (error) {
    console.error('[ADMIN STATS] Error:', error)
    throw error
  }
}

/**
 * Récupère la répartition des gestionnaires par catégorie
 */
export async function getCategoryBreakdown(): Promise<Record<string, number>> {
  try {
    const categories = await getManagerCategories()

    const breakdown: Record<string, number> = {
      'Inactif': 0,
      'Débutant': 0,
      'Intermédiaire': 0,
      'Avancé': 0,
      'Expert': 0,
    }

    categories.forEach((manager) => {
      breakdown[manager.category]++
    })

    return breakdown
  } catch (error) {
    console.error('[ADMIN STATS] Error:', error)
    throw error
  }
}
