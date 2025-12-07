'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { StripePurchase, PurchaseHistoryResponse } from '@/types/stripe'

/**
 * Récupère l'historique des achats d'un utilisateur
 */
export async function getPurchaseHistory(userEmail: string): Promise<PurchaseHistoryResponse> {
  const supabase = await createServerSupabaseClient()

  // Vérifier que l'utilisateur est authentifié et que c'est bien son email
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email !== userEmail) {
    return { success: false, error: 'Non autorisé' }
  }

  const { data, error } = await (supabase.from('stripe_purchases') as unknown as {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        order: (column: string, options: { ascending: boolean }) => Promise<{
          data: StripePurchase[] | null
          error: { message: string } | null
        }>
      }
    }
  })
    .select('*')
    .eq('user_email', userEmail)
    .order('created_at', { ascending: false })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data: data || [] }
}

/**
 * Récupère le nombre de welcomebooks d'un utilisateur
 * Utilisé pour recommander le bon pack Multi
 */
export async function getWelcomebookCount(userEmail: string): Promise<number> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email !== userEmail) {
    return 0
  }

  const { count, error } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('email', userEmail)

  if (error) {
    console.error('[BILLING] Erreur comptage welcomebooks:', error)
    return 0
  }

  return count || 0
}

/**
 * Vérifie si l'utilisateur a déjà acheté (pour afficher badge "Client")
 */
export async function hasUserPurchased(userEmail: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email !== userEmail) {
    return false
  }

  const { count, error } = await (supabase.from('stripe_purchases') as unknown as {
    select: (columns: string, options: { count: string; head: boolean }) => {
      eq: (column: string, value: string) => {
        eq: (column: string, value: string) => Promise<{
          count: number | null
          error: { message: string } | null
        }>
      }
    }
  })
    .select('*', { count: 'exact', head: true })
    .eq('user_email', userEmail)
    .eq('status', 'completed')

  if (error) {
    return false
  }

  return (count || 0) > 0
}
