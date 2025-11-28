'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { calculatePersonalizationScore, getCreditsForScore } from '@/lib/utils/credit-helpers'
import type { CreditTransaction, CreditRequest, PostTemplate } from '@/types'

/**
 * Interface : Solde de crédits d'un utilisateur
 */
export interface CreditBalance {
  credits_balance: number
  credits_lifetime_earned: number
  account_status: 'active' | 'grace_period' | 'suspended' | 'to_delete'
  suspended_at: string | null
  last_credit_consumption: string
  welcomebook_count: number
  consumption_interval_hours: number
  total_earned: number
  total_spent: number
}

/**
 * Récupère le solde de crédits d'un utilisateur
 */
export async function getCreditBalance(userEmail: string): Promise<{ success: boolean; data?: CreditBalance; error?: string }> {
  const supabase = await createServerSupabaseClient()

  try {
    console.log('[GET CREDIT BALANCE] User:', userEmail)

    // Vérifier authentification
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) {
      throw new Error('Non authentifié')
    }

    // Vérifier ownership
    if (user.email !== userEmail) {
      throw new Error('Non autorisé')
    }

    // Récupérer depuis la vue SQL user_credits_summary
    const { data, error } = await (supabase
      .from('user_credits_summary') as any)
      .select('*')
      .eq('user_email', userEmail)
      .maybeSingle()

    if (error) {
      console.error('[GET CREDIT BALANCE] Erreur:', error)
      throw new Error(`Erreur: ${error.message}`)
    }

    if (!data) {
      // Si aucun résultat, créer un résumé par défaut
      const { data: clients } = await (supabase
        .from('clients') as any)
        .select('credits_balance, credits_lifetime_earned, account_status, suspended_at, last_credit_consumption')
        .eq('email', userEmail)
        .limit(1)
        .maybeSingle()

      if (!clients) {
        throw new Error('Aucun client trouvé')
      }

      const { data: welcomebookCountData } = await (supabase as any).rpc('count_user_welcomebooks', { p_user_email: userEmail })
      const welcomebookCount = welcomebookCountData || 1

      const { data: intervalData } = await (supabase as any).rpc('get_consumption_interval_hours', { p_welcomebook_count: welcomebookCount })
      const consumptionInterval = intervalData || 24

      const defaultBalance: CreditBalance = {
        credits_balance: clients.credits_balance || 150,
        credits_lifetime_earned: clients.credits_lifetime_earned || 150,
        account_status: clients.account_status || 'active',
        suspended_at: clients.suspended_at,
        last_credit_consumption: clients.last_credit_consumption,
        welcomebook_count: welcomebookCount,
        consumption_interval_hours: consumptionInterval,
        total_earned: 150,
        total_spent: 0
      }

      return { success: true, data: defaultBalance }
    }

    console.log('[GET CREDIT BALANCE] Succès ✅')
    return { success: true, data }
  } catch (error) {
    console.error('[GET CREDIT BALANCE] Erreur catch:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
  }
}

/**
 * Récupère l'historique des transactions de crédits
 */
export async function getCreditHistory(
  userEmail: string,
  limit: number = 50
): Promise<{ success: boolean; data?: CreditTransaction[]; error?: string }> {
  const supabase = await createServerSupabaseClient()

  try {
    console.log('[GET CREDIT HISTORY] User:', userEmail, 'Limit:', limit)

    // Vérifier authentification
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) {
      throw new Error('Non authentifié')
    }

    // Vérifier ownership
    if (user.email !== userEmail) {
      throw new Error('Non autorisé')
    }

    const { data, error } = await (supabase
      .from('credit_transactions') as any)
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[GET CREDIT HISTORY] Erreur:', error)
      throw new Error(`Erreur: ${error.message}`)
    }

    console.log('[GET CREDIT HISTORY] Succès ✅', data?.length || 0, 'transactions')
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('[GET CREDIT HISTORY] Erreur catch:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
  }
}

/**
 * Récupère tous les templates de posts disponibles
 */
export async function getPostTemplates(): Promise<{ success: boolean; data?: PostTemplate[]; error?: string }> {
  const supabase = await createServerSupabaseClient()

  try {
    console.log('[GET POST TEMPLATES] Fetching...')

    // Vérifier authentification
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Non authentifié')
    }

    const { data, error } = await (supabase
      .from('post_templates') as any)
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('[GET POST TEMPLATES] Erreur:', error)
      throw new Error(`Erreur: ${error.message}`)
    }

    console.log('[GET POST TEMPLATES] Succès ✅', data?.length || 0, 'templates')
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('[GET POST TEMPLATES] Erreur catch:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
  }
}

/**
 * Soumet une demande de crédits (avec auto-approve si utilisateur de confiance)
 */
export async function submitCreditRequest(data: {
  clientId: string
  platform: string
  postType: string
  templateId: string
  customContent: string
  proofUrl?: string
  proofScreenshotUrl?: string
}): Promise<{ success: boolean; data?: { requestId: string; status: string; creditsAwarded: number }; error?: string }> {
  const supabase = await createServerSupabaseClient()

  try {
    console.log('[SUBMIT CREDIT REQUEST] Client:', data.clientId, 'Platform:', data.platform)

    // Vérifier authentification
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) {
      throw new Error('Non authentifié')
    }

    // Vérifier ownership du client
    const { data: client } = await (supabase
      .from('clients') as any)
      .select('id, email')
      .eq('id', data.clientId)
      .maybeSingle()

    if (!client || client.email !== user.email) {
      throw new Error('Non autorisé')
    }

    // Récupérer le template
    const { data: template } = await (supabase
      .from('post_templates') as any)
      .select('content')
      .eq('id', data.templateId)
      .maybeSingle()

    if (!template) {
      throw new Error('Template non trouvé')
    }

    // Calculer score de personnalisation
    const personalizationScore = calculatePersonalizationScore(template.content, data.customContent)

    // Calculer crédits
    const creditsRequested = getCreditsForScore(data.platform, data.postType, personalizationScore)

    // Vérifier si utilisateur de confiance (auto-approve)
    const { data: trustedUser } = await (supabase
      .from('trusted_users') as any)
      .select('trust_level, approved_requests_count')
      .eq('user_email', user.email)
      .maybeSingle()

    const isAutoApprove = trustedUser && trustedUser.trust_level !== 'standard' && trustedUser.approved_requests_count >= 3

    // Créer la demande
    const { data: request, error: requestError } = await (supabase
      .from('credit_requests') as any)
      .insert({
        user_email: user.email,
        client_id: data.clientId,
        platform: data.platform,
        post_type: data.postType,
        template_id: data.templateId,
        personalization_score: personalizationScore,
        credits_requested: creditsRequested,
        proof_url: data.proofUrl,
        proof_screenshot_url: data.proofScreenshotUrl,
        custom_content: data.customContent,
        status: isAutoApprove ? 'auto_approved' : 'pending'
      })
      .select()
      .single()

    if (requestError) {
      console.error('[SUBMIT CREDIT REQUEST] Erreur création demande:', requestError)
      throw new Error(`Erreur: ${requestError.message}`)
    }

    // Si auto-approve, ajouter les crédits immédiatement
    let creditsAwarded = 0
    if (isAutoApprove) {
      // Récupérer solde actuel
      const { data: clientData } = await (supabase
        .from('clients') as any)
        .select('credits_balance')
        .eq('email', user.email)
        .limit(1)
        .single()

      const currentBalance = clientData?.credits_balance || 0
      const newBalance = currentBalance + creditsRequested

      // Mettre à jour tous les clients de l'utilisateur
      await (supabase
        .from('clients') as any)
        .update({
          credits_balance: newBalance,
          credits_lifetime_earned: (supabase as any).sql`credits_lifetime_earned + ${creditsRequested}`
        })
        .eq('email', user.email)

      // Créer transaction
      await (supabase
        .from('credit_transactions') as any)
        .insert({
          user_email: user.email,
          amount: creditsRequested,
          balance_after: newBalance,
          transaction_type: 'earn_social',
          description: `Partage ${data.platform} (auto-approuvé)`,
          metadata: {
            platform: data.platform,
            post_type: data.postType,
            personalization_score: personalizationScore,
            auto_approved: true
          },
          request_id: request.id
        })

      creditsAwarded = creditsRequested
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/credits')

    console.log('[SUBMIT CREDIT REQUEST] Succès ✅', isAutoApprove ? '(auto-approuvé)' : '(en attente)')
    return {
      success: true,
      data: {
        requestId: request.id,
        status: isAutoApprove ? 'auto_approved' : 'pending',
        creditsAwarded
      }
    }
  } catch (error) {
    console.error('[SUBMIT CREDIT REQUEST] Erreur catch:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
  }
}

/**
 * Récupère les demandes de crédits d'un utilisateur
 */
export async function getUserCreditRequests(
  userEmail: string,
  limit: number = 20
): Promise<{ success: boolean; data?: CreditRequest[]; error?: string }> {
  const supabase = await createServerSupabaseClient()

  try {
    console.log('[GET USER CREDIT REQUESTS] User:', userEmail)

    // Vérifier authentification
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) {
      throw new Error('Non authentifié')
    }

    // Vérifier ownership
    if (user.email !== userEmail) {
      throw new Error('Non autorisé')
    }

    const { data, error } = await (supabase
      .from('credit_requests') as any)
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[GET USER CREDIT REQUESTS] Erreur:', error)
      throw new Error(`Erreur: ${error.message}`)
    }

    console.log('[GET USER CREDIT REQUESTS] Succès ✅', data?.length || 0, 'demandes')
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('[GET USER CREDIT REQUESTS] Erreur catch:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
  }
}
