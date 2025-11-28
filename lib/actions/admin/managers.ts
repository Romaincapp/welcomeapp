'use server'

/**
 * Server actions pour la gestion des gestionnaires (admin)
 * Accès restreint aux administrateurs uniquement
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'

// =============================================================================
// TYPES
// =============================================================================

export interface Manager {
  id: string
  email: string
  slug: string
  name: string | null
  created_at: string
  subdomain: string | null
  has_shared: boolean

  // Stats agregées
  total_tips?: number
  total_media?: number
  total_views?: number
  total_clicks?: number
  category?: string
  credits_balance?: number
}

export interface ManagerFilters {
  search?: string // Recherche par email ou slug
  category?: 'all' | 'Inactif' | 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert'
  dateFrom?: string
  dateTo?: string
  sortBy?: 'created_at' | 'total_tips' | 'email'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

// =============================================================================
// SERVER ACTIONS
// =============================================================================

/**
 * Récupère tous les gestionnaires avec filtres et pagination
 */
export async function getAllManagers(filters: ManagerFilters = {}): Promise<Manager[]> {
  try {
    // Vérifier que l'utilisateur est admin
    await requireAdmin()

    const supabase = await createServerSupabaseClient()

    // Récupérer les managers avec leurs stats
    const { data: managers, error } = await supabase
      .from('manager_categories' as any)
      .select('*')

    if (error) {
      console.error('[ADMIN MANAGERS] Error fetching managers:', error)
      return []
    }

    // WORKAROUND: Supabase view typing - approved pattern (see typescript-rules.md)
    let result = (managers || []) as any as Manager[]

    // Appliquer le filtre de recherche (email ou slug)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(
        (m) =>
          m.email.toLowerCase().includes(searchLower) ||
          m.slug.toLowerCase().includes(searchLower)
      )
    }

    // Appliquer le filtre de catégorie
    if (filters.category && filters.category !== 'all') {
      result = result.filter((m) => m.category === filters.category)
    }

    // Appliquer le filtre de date
    if (filters.dateFrom) {
      result = result.filter((m) => new Date(m.created_at) >= new Date(filters.dateFrom!))
    }
    if (filters.dateTo) {
      result = result.filter((m) => new Date(m.created_at) <= new Date(filters.dateTo!))
    }

    // Tri
    const sortBy = filters.sortBy || 'created_at'
    const sortOrder = filters.sortOrder || 'desc'

    result.sort((a, b) => {
      let aValue: string | number = (a as any)[sortBy]
      let bValue: string | number = (b as any)[sortBy]

      // Gérer les valeurs null/undefined
      if (aValue == null) aValue = sortOrder === 'asc' ? Infinity : -Infinity
      if (bValue == null) bValue = sortOrder === 'asc' ? Infinity : -Infinity

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      return sortOrder === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number)
    })

    // Pagination
    const offset = filters.offset || 0
    const limit = filters.limit || 50

    return result.slice(offset, offset + limit)
  } catch (error) {
    console.error('[ADMIN MANAGERS] Error:', error)
    throw error
  }
}

/**
 * Compte le nombre total de gestionnaires (pour pagination)
 */
export async function getManagersCount(filters: ManagerFilters = {}): Promise<number> {
  try {
    await requireAdmin()

    const managers = await getAllManagers({ ...filters, limit: 10000 })
    return managers.length
  } catch (error) {
    console.error('[ADMIN MANAGERS] Error:', error)
    throw error
  }
}

/**
 * Exporte tous les emails des gestionnaires (pour CSV)
 */
export async function exportManagerEmails(): Promise<Array<{ email: string; name: string | null; slug: string; created_at: string; total_tips: number }>> {
  try {
    // Vérifier que l'utilisateur est admin
    await requireAdmin()

    const supabase = await createServerSupabaseClient()

    const { data: managers, error } = await supabase
      .from('manager_categories' as any)
      .select('email, slug, created_at, total_tips')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[ADMIN MANAGERS] Error exporting emails:', error)
      return []
    }

    // Récupérer aussi les noms depuis la table clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('email, name')

    if (clientsError) {
      console.error('[ADMIN MANAGERS] Error fetching client names:', clientsError)
    }

    // Créer un map email -> name
    const nameMap = new Map<string, string | null>()
    clients?.forEach((client: any) => {
      nameMap.set(client.email, client.name)
    })

    // Fusionner les données
    return (managers || []).map((manager: any) => ({
      email: manager.email,
      name: nameMap.get(manager.email) || null,
      slug: manager.slug,
      created_at: manager.created_at,
      total_tips: manager.total_tips || 0
    }))
  } catch (error) {
    console.error('[ADMIN MANAGERS] Error:', error)
    throw error
  }
}

/**
 * Récupère les détails complets d'un gestionnaire par ID
 */
export async function getManagerDetails(clientId: string) {
  try {
    await requireAdmin()

    const supabase = await createServerSupabaseClient()

    // Récupérer le client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .maybeSingle()

    if (clientError || !client) {
      console.error('[ADMIN MANAGERS] Error fetching client:', clientError)
      return null
    }

    // Récupérer tous les tips
    const { data: tips, error: tipsError } = await supabase
      .from('tips')
      .select('*, category:categories(name, icon)')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (tipsError) {
      console.error('[ADMIN MANAGERS] Error fetching tips:', tipsError)
    }

    // Récupérer les analytics
    const { data: analytics, error: analyticsError } = await supabase
      .from('analytics_events')
      .select('event_type')
      .eq('client_id', clientId)

    if (analyticsError) {
      console.error('[ADMIN MANAGERS] Error fetching analytics:', analyticsError)
    }

    // Compter par type d'événement
    const eventCounts = {
      views: analytics?.filter((e: any) => e.event_type === 'view').length || 0,
      clicks: analytics?.filter((e: any) => e.event_type === 'click').length || 0,
      shares: analytics?.filter((e: any) => e.event_type === 'share').length || 0,
      pwa_installs: analytics?.filter((e: any) => e.event_type === 'install_pwa').length || 0,
    }

    return {
      client,
      tips: tips || [],
      analytics: eventCounts,
    }
  } catch (error) {
    console.error('[ADMIN MANAGERS] Error:', error)
    throw error
  }
}
