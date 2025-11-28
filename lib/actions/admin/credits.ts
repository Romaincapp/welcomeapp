'use server'

/**
 * Server actions pour la gestion des crédits (admin)
 * Accès restreint aux administrateurs uniquement
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { revalidatePath } from 'next/cache'

// =============================================================================
// TYPES
// =============================================================================

export interface PendingCreditRequest {
  id: string
  user_email: string
  client_id: string
  platform: string
  post_type: string
  template_id: string
  template_title?: string // Enrichi depuis post_templates
  personalization_score: number
  credits_requested: number
  proof_url?: string
  proof_screenshot_url?: string
  custom_content?: string
  status: string
  created_at: string
  // Infos client enrichies
  client_slug?: string
  client_name?: string
}

export interface UserCreditSummary {
  user_email: string
  credits_balance: number
  credits_lifetime_earned: number
  account_status: string
  suspended_at: string | null
  welcomebook_count: number
  total_requests: number
  approved_requests: number
  pending_requests: number
  rejected_requests: number
}

export interface SocialShareRecord {
  id: string
  user_email: string
  post_id: string
  platform: string
  credits_awarded: number
  social_profile_url: string | null
  shared_at: string
  // Post info enrichi
  post_caption?: string
  post_url?: string
}

export interface SocialSharesStats {
  today: number
  this_week: number
  this_month: number
  total_credits_distributed: number
  new_shares_since_last_visit: number
  pending_count: number // Nombre de partages en attente de validation
}

// =============================================================================
// SERVER ACTIONS - VALIDATION DEMANDES
// =============================================================================

/**
 * Récupère toutes les demandes de crédits en attente
 */
export async function getPendingRequests(limit: number = 50): Promise<{ success: boolean; data?: PendingCreditRequest[]; error?: string }> {
  try {
    await requireAdmin()

    const supabase = await createServerSupabaseClient()

    const { data: requests, error } = await (supabase
      .from('credit_requests') as any)
      .select(`
        *,
        post_templates (
          title
        ),
        clients (
          slug,
          name
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[ADMIN] Error fetching pending requests:', error)
      throw new Error(`Erreur: ${error.message}`)
    }

    // Enrichir les données
    const enrichedRequests: PendingCreditRequest[] = (requests || []).map((req: any) => ({
      id: req.id,
      user_email: req.user_email,
      client_id: req.client_id,
      platform: req.platform,
      post_type: req.post_type,
      template_id: req.template_id,
      template_title: req.post_templates?.title,
      personalization_score: req.personalization_score,
      credits_requested: req.credits_requested,
      proof_url: req.proof_url,
      proof_screenshot_url: req.proof_screenshot_url,
      custom_content: req.custom_content,
      status: req.status,
      created_at: req.created_at,
      client_slug: req.clients?.slug,
      client_name: req.clients?.name
    }))

    return { success: true, data: enrichedRequests }
  } catch (error) {
    console.error('[ADMIN] Error in getPendingRequests:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
  }
}

/**
 * Approuve une demande de crédits et ajoute les crédits à l'utilisateur
 */
export async function approveRequest(
  requestId: string,
  adminEmail: string,
  reviewNote?: string
): Promise<{ success: boolean; creditsAdded?: number; error?: string }> {
  try {
    await requireAdmin()

    const supabase = await createServerSupabaseClient()

    // Récupérer la demande
    const { data: request, error: requestError } = await (supabase
      .from('credit_requests') as any)
      .select('*')
      .eq('id', requestId)
      .maybeSingle()

    if (requestError || !request) {
      throw new Error('Demande non trouvée')
    }

    if (request.status !== 'pending') {
      throw new Error('Cette demande a déjà été traitée')
    }

    // Récupérer le solde actuel de l'utilisateur
    const { data: clientData } = await (supabase
      .from('clients') as any)
      .select('credits_balance')
      .eq('email', request.user_email)
      .limit(1)
      .single()

    const currentBalance = clientData?.credits_balance || 0
    const newBalance = currentBalance + request.credits_requested

    // Mettre à jour tous les clients de l'utilisateur
    await (supabase
      .from('clients') as any)
      .update({
        credits_balance: newBalance,
        credits_lifetime_earned: (supabase as any).sql`credits_lifetime_earned + ${request.credits_requested}`,
        account_status: 'active', // Réactiver si suspendu
        suspended_at: null
      })
      .eq('email', request.user_email)

    // Créer la transaction
    await (supabase
      .from('credit_transactions') as any)
      .insert({
        user_email: request.user_email,
        amount: request.credits_requested,
        balance_after: newBalance,
        transaction_type: 'earn_social',
        description: `Partage ${request.platform} approuvé par admin`,
        metadata: {
          platform: request.platform,
          post_type: request.post_type,
          personalization_score: request.personalization_score,
          proof_url: request.proof_url
        },
        request_id: requestId,
        created_by: adminEmail
      })

    // Marquer la demande comme approuvée
    await (supabase
      .from('credit_requests') as any)
      .update({
        status: 'approved',
        reviewed_by: adminEmail,
        review_note: reviewNote,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', requestId)

    // Mettre à jour le compteur de l'utilisateur de confiance (pour auto-approve futur)
    const { data: trustedUser } = await (supabase
      .from('trusted_users') as any)
      .select('id, approved_requests_count')
      .eq('user_email', request.user_email)
      .maybeSingle()

    if (trustedUser) {
      await (supabase
        .from('trusted_users') as any)
        .update({
          approved_requests_count: trustedUser.approved_requests_count + 1
        })
        .eq('id', trustedUser.id)
    } else {
      // Créer l'entrée si elle n'existe pas
      await (supabase
        .from('trusted_users') as any)
        .insert({
          user_email: request.user_email,
          approved_requests_count: 1,
          trust_level: 'standard'
        })
    }

    revalidatePath('/admin/credits')
    revalidatePath('/dashboard')

    console.log('[ADMIN] Request approved ✅', requestId, '+', request.credits_requested, 'crédits')
    return { success: true, creditsAdded: request.credits_requested }
  } catch (error) {
    console.error('[ADMIN] Error approving request:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
  }
}

/**
 * Rejette une demande de crédits
 */
export async function rejectRequest(
  requestId: string,
  adminEmail: string,
  rejectionReason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()

    const supabase = await createServerSupabaseClient()

    // Vérifier que la demande existe
    const { data: request, error: requestError } = await (supabase
      .from('credit_requests') as any)
      .select('*')
      .eq('id', requestId)
      .maybeSingle()

    if (requestError || !request) {
      throw new Error('Demande non trouvée')
    }

    if (request.status !== 'pending') {
      throw new Error('Cette demande a déjà été traitée')
    }

    // Marquer comme rejetée
    await (supabase
      .from('credit_requests') as any)
      .update({
        status: 'rejected',
        reviewed_by: adminEmail,
        rejection_reason: rejectionReason,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', requestId)

    revalidatePath('/admin/credits')

    console.log('[ADMIN] Request rejected ❌', requestId)
    return { success: true }
  } catch (error) {
    console.error('[ADMIN] Error rejecting request:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
  }
}

// =============================================================================
// SERVER ACTIONS - GESTION MANUELLE CRÉDITS
// =============================================================================

/**
 * Ajoute des crédits manuellement à un utilisateur
 */
export async function addCreditsManually(
  userEmail: string,
  amount: number,
  reason: string,
  adminNote?: string
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  try {
    await requireAdmin()

    const supabase = await createServerSupabaseClient()
    const { data: { user: adminUser } } = await supabase.auth.getUser()

    if (!adminUser || !adminUser.email) {
      throw new Error('Admin non authentifié')
    }

    // Vérifier que l'utilisateur existe
    const { data: clientData } = await (supabase
      .from('clients') as any)
      .select('credits_balance')
      .eq('email', userEmail)
      .limit(1)
      .single()

    if (!clientData) {
      throw new Error('Utilisateur non trouvé')
    }

    const currentBalance = clientData.credits_balance || 0
    const newBalance = currentBalance + amount

    // Mettre à jour tous les clients de l'utilisateur
    await (supabase
      .from('clients') as any)
      .update({
        credits_balance: newBalance,
        credits_lifetime_earned: (supabase as any).sql`credits_lifetime_earned + ${amount}`,
        account_status: 'active', // Réactiver si suspendu
        suspended_at: null
      })
      .eq('email', userEmail)

    // Créer la transaction
    await (supabase
      .from('credit_transactions') as any)
      .insert({
        user_email: userEmail,
        amount: amount,
        balance_after: newBalance,
        transaction_type: 'manual_add',
        description: `Ajout manuel admin: ${reason}`,
        metadata: {
          reason,
          admin_note: adminNote
        },
        created_by: adminUser.email
      })

    revalidatePath('/admin/credits')
    revalidatePath('/dashboard')

    console.log('[ADMIN] Credits added manually ✅', userEmail, '+', amount)
    return { success: true, newBalance }
  } catch (error) {
    console.error('[ADMIN] Error adding credits:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
  }
}

/**
 * Retire des crédits manuellement à un utilisateur
 */
export async function removeCreditsManually(
  userEmail: string,
  amount: number,
  reason: string
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  try {
    await requireAdmin()

    const supabase = await createServerSupabaseClient()
    const { data: { user: adminUser } } = await supabase.auth.getUser()

    if (!adminUser || !adminUser.email) {
      throw new Error('Admin non authentifié')
    }

    // Vérifier que l'utilisateur existe
    const { data: clientData } = await (supabase
      .from('clients') as any)
      .select('credits_balance')
      .eq('email', userEmail)
      .limit(1)
      .single()

    if (!clientData) {
      throw new Error('Utilisateur non trouvé')
    }

    const currentBalance = clientData.credits_balance || 0
    const newBalance = Math.max(0, currentBalance - amount) // Ne pas aller en négatif

    // Mettre à jour tous les clients de l'utilisateur
    await (supabase
      .from('clients') as any)
      .update({
        credits_balance: newBalance
      })
      .eq('email', userEmail)

    // Créer la transaction
    await (supabase
      .from('credit_transactions') as any)
      .insert({
        user_email: userEmail,
        amount: -amount,
        balance_after: newBalance,
        transaction_type: 'manual_remove',
        description: `Retrait manuel admin: ${reason}`,
        metadata: {
          reason
        },
        created_by: adminUser.email
      })

    revalidatePath('/admin/credits')
    revalidatePath('/dashboard')

    console.log('[ADMIN] Credits removed manually ✅', userEmail, '-', amount)
    return { success: true, newBalance }
  } catch (error) {
    console.error('[ADMIN] Error removing credits:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
  }
}

// =============================================================================
// SERVER ACTIONS - GESTION UTILISATEURS DE CONFIANCE
// =============================================================================

/**
 * Change le niveau de confiance d'un utilisateur
 */
export async function setTrustLevel(
  userEmail: string,
  trustLevel: 'standard' | 'trusted' | 'vip',
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()

    const supabase = await createServerSupabaseClient()

    // Vérifier si l'utilisateur existe dans trusted_users
    const { data: existingUser } = await (supabase
      .from('trusted_users') as any)
      .select('id')
      .eq('user_email', userEmail)
      .maybeSingle()

    if (existingUser) {
      // Mettre à jour
      await (supabase
        .from('trusted_users') as any)
        .update({
          trust_level: trustLevel,
          notes: notes
        })
        .eq('user_email', userEmail)
    } else {
      // Créer
      await (supabase
        .from('trusted_users') as any)
        .insert({
          user_email: userEmail,
          trust_level: trustLevel,
          notes: notes,
          approved_requests_count: 0
        })
    }

    revalidatePath('/admin/credits')

    console.log('[ADMIN] Trust level updated ✅', userEmail, '→', trustLevel)
    return { success: true }
  } catch (error) {
    console.error('[ADMIN] Error setting trust level:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
  }
}

// =============================================================================
// SERVER ACTIONS - STATISTIQUES
// =============================================================================

/**
 * Récupère le résumé des crédits de tous les utilisateurs
 */
export async function getAllUsersCreditsSummary(): Promise<{ success: boolean; data?: UserCreditSummary[]; error?: string }> {
  try {
    await requireAdmin()

    const supabase = await createServerSupabaseClient()

    // Récupérer les données de la vue user_credits_summary
    const { data: summaries, error: summariesError } = await (supabase
      .from('user_credits_summary') as any)
      .select('*')

    if (summariesError) {
      throw new Error(`Erreur: ${summariesError.message}`)
    }

    // Enrichir avec le nombre de demandes par utilisateur
    const enrichedSummaries: UserCreditSummary[] = await Promise.all(
      (summaries || []).map(async (summary: any) => {
        const { data: requests } = await (supabase
          .from('credit_requests') as any)
          .select('status')
          .eq('user_email', summary.user_email)

        const totalRequests = requests?.length || 0
        const approvedRequests = requests?.filter((r: any) => r.status === 'approved' || r.status === 'auto_approved').length || 0
        const pendingRequests = requests?.filter((r: any) => r.status === 'pending').length || 0
        const rejectedRequests = requests?.filter((r: any) => r.status === 'rejected').length || 0

        return {
          user_email: summary.user_email,
          credits_balance: summary.credits_balance,
          credits_lifetime_earned: summary.credits_lifetime_earned,
          account_status: summary.account_status,
          suspended_at: summary.suspended_at,
          welcomebook_count: summary.welcomebook_count,
          total_requests: totalRequests,
          approved_requests: approvedRequests,
          pending_requests: pendingRequests,
          rejected_requests: rejectedRequests
        }
      })
    )

    return { success: true, data: enrichedSummaries }
  } catch (error) {
    console.error('[ADMIN] Error getting users credits summary:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
  }
}

// =============================================================================
// SERVER ACTIONS - PARTAGES SOCIAUX (TRUST-BASED)
// =============================================================================

/**
 * Récupère les partages sociaux récents pour modération admin
 */
export async function getRecentSocialShares(limit: number = 50): Promise<{
  success: boolean
  data?: SocialShareRecord[]
  error?: string
}> {
  try {
    await requireAdmin()

    const supabase = await createServerSupabaseClient()

    const { data: shares, error } = await (supabase
      .from('social_post_shares') as any)
      .select(`
        id,
        user_email,
        post_id,
        platform,
        credits_awarded,
        social_profile_url,
        shared_at,
        official_social_posts (
          caption,
          post_url
        )
      `)
      .order('shared_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[ADMIN] Error fetching social shares:', error)
      throw new Error(`Erreur: ${error.message}`)
    }

    const enrichedShares: SocialShareRecord[] = (shares || []).map((share: any) => ({
      id: share.id,
      user_email: share.user_email,
      post_id: share.post_id,
      platform: share.platform,
      credits_awarded: share.credits_awarded,
      social_profile_url: share.social_profile_url,
      shared_at: share.shared_at,
      post_caption: share.official_social_posts?.caption,
      post_url: share.official_social_posts?.post_url,
    }))

    console.log('[ADMIN] Social shares fetched ✅', enrichedShares.length)
    return { success: true, data: enrichedShares }
  } catch (error) {
    console.error('[ADMIN] Error in getRecentSocialShares:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
  }
}

/**
 * Récupère les stats des partages sociaux pour le dashboard admin
 */
export async function getSocialSharesStats(lastVisitTimestamp?: string): Promise<{
  success: boolean
  data?: SocialSharesStats
  error?: string
}> {
  try {
    await requireAdmin()

    const supabase = await createServerSupabaseClient()

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Partages aujourd'hui
    const { count: todayCount } = await (supabase
      .from('social_post_shares') as any)
      .select('*', { count: 'exact', head: true })
      .gte('shared_at', todayStart)

    // Partages cette semaine
    const { count: weekCount } = await (supabase
      .from('social_post_shares') as any)
      .select('*', { count: 'exact', head: true })
      .gte('shared_at', weekStart)

    // Partages ce mois
    const { count: monthCount } = await (supabase
      .from('social_post_shares') as any)
      .select('*', { count: 'exact', head: true })
      .gte('shared_at', monthStart)

    // Partages en attente de validation (status = 'pending')
    const { count: pendingCount } = await (supabase
      .from('social_post_shares') as any)
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Total crédits distribués via partages
    const { data: creditsData } = await (supabase
      .from('social_post_shares') as any)
      .select('credits_awarded')

    const totalCreditsDistributed = (creditsData || []).reduce(
      (sum: number, share: any) => sum + (share.credits_awarded || 0),
      0
    )

    // Nouveaux partages depuis dernière visite admin
    let newSharesSinceLastVisit = 0
    if (lastVisitTimestamp) {
      const { count: newCount } = await (supabase
        .from('social_post_shares') as any)
        .select('*', { count: 'exact', head: true })
        .gte('shared_at', lastVisitTimestamp)

      newSharesSinceLastVisit = newCount || 0
    }

    return {
      success: true,
      data: {
        today: todayCount || 0,
        this_week: weekCount || 0,
        this_month: monthCount || 0,
        total_credits_distributed: totalCreditsDistributed,
        new_shares_since_last_visit: newSharesSinceLastVisit,
        pending_count: pendingCount || 0,
      },
    }
  } catch (error) {
    console.error('[ADMIN] Error getting social shares stats:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
  }
}

/**
 * Retire les crédits d'un partage (en cas d'abus)
 * Crée une transaction négative et marque le partage comme révoqué
 */
export async function revokeShareCredits(
  shareId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()

    const supabase = await createServerSupabaseClient()
    const { data: { user: adminUser } } = await supabase.auth.getUser()

    if (!adminUser || !adminUser.email) {
      throw new Error('Admin non authentifié')
    }

    // Récupérer le partage
    const { data: share, error: shareError } = await (supabase
      .from('social_post_shares') as any)
      .select('*')
      .eq('id', shareId)
      .maybeSingle()

    if (shareError || !share) {
      throw new Error('Partage non trouvé')
    }

    // Récupérer le solde actuel de l'utilisateur
    const { data: clientData } = await (supabase
      .from('clients') as any)
      .select('credits_balance')
      .eq('email', share.user_email)
      .limit(1)
      .single()

    if (!clientData) {
      throw new Error('Utilisateur non trouvé')
    }

    const currentBalance = clientData.credits_balance || 0
    const newBalance = Math.max(0, currentBalance - share.credits_awarded)

    // Retirer les crédits
    await (supabase
      .from('clients') as any)
      .update({
        credits_balance: newBalance,
      })
      .eq('email', share.user_email)

    // Créer une transaction négative
    await (supabase
      .from('credit_transactions') as any)
      .insert({
        user_email: share.user_email,
        amount: -share.credits_awarded,
        balance_after: newBalance,
        transaction_type: 'revoke_social',
        description: `Révocation partage ${share.platform}: ${reason}`,
        metadata: {
          share_id: shareId,
          platform: share.platform,
          post_id: share.post_id,
          reason,
        },
        created_by: adminUser.email,
      })

    // Supprimer le partage (ou marquer comme révoqué si on veut garder l'historique)
    await (supabase
      .from('social_post_shares') as any)
      .delete()
      .eq('id', shareId)

    revalidatePath('/admin/credits')
    revalidatePath('/dashboard')

    console.log('[ADMIN] Share credits revoked ✅', shareId, '-', share.credits_awarded)
    return { success: true }
  } catch (error) {
    console.error('[ADMIN] Error revoking share credits:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
  }
}
