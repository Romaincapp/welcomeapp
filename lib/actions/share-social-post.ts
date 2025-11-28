'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { OfficialSocialPost, SocialPostShare } from '@/types'

/**
 * Récupère les posts officiels actifs pour les gestionnaires
 */
export async function getActiveOfficialPosts(): Promise<{
  success: boolean
  data?: OfficialSocialPost[]
  error?: string
}> {
  try {
    const supabase = await createServerSupabaseClient()

    // Vérifier authentification
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Non authentifié')
    }

    const { data, error } = await (supabase
      .from('official_social_posts') as any)
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    console.log('[GET ACTIVE OFFICIAL POSTS] Succès ✅', data?.length || 0, 'posts')
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('[GET ACTIVE OFFICIAL POSTS] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

/**
 * Partage un post officiel
 *
 * Workflow:
 * 1. Vérifie que le post existe et est actif
 * 2. Si profil social fourni → crédite immédiatement (status: 'credited')
 * 3. Si pas de profil → enregistre en attente (status: 'pending')
 * 4. Log le partage dans social_post_shares
 *
 * @param postId - ID du post officiel à partager
 * @param socialProfileUrl - URL du profil social de l'utilisateur (requis pour crédits immédiats)
 */
export async function shareSocialPost(postId: string, socialProfileUrl?: string): Promise<{
  success: boolean
  data?: {
    creditsAwarded: number
    newBalance: number
    postUrl: string
    platform: string
    status: 'pending' | 'credited'
  }
  error?: string
}> {
  const supabase = await createServerSupabaseClient()

  try {
    console.log('[SHARE SOCIAL POST] Starting...', { postId, hasProfileUrl: !!socialProfileUrl })

    // Vérifier authentification
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || !user.email) {
      throw new Error('Non authentifié')
    }

    // Récupérer le post officiel
    const { data: post, error: postError } = await (supabase
      .from('official_social_posts') as any)
      .select('*')
      .eq('id', postId)
      .eq('is_active', true)
      .maybeSingle()

    if (postError) throw new Error(postError.message)
    if (!post) throw new Error('Post non trouvé ou inactif')

    const creditsAwarded = post.credits_reward

    // Récupérer le client pour le solde actuel
    const { data: client, error: clientError } = await (supabase
      .from('clients') as any)
      .select('credits_balance, credits_lifetime_earned')
      .eq('email', user.email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (clientError) throw new Error(clientError.message)
    if (!client) throw new Error('Client non trouvé')

    const currentBalance = client.credits_balance || 0
    const currentLifetimeEarned = client.credits_lifetime_earned || 0

    // Déterminer le statut selon si profil fourni ou non
    const isPending = !socialProfileUrl || socialProfileUrl.trim() === ''
    const status = isPending ? 'pending' : 'credited'
    const newBalance = isPending ? currentBalance : currentBalance + creditsAwarded
    const newLifetimeEarned = isPending ? currentLifetimeEarned : currentLifetimeEarned + creditsAwarded

    // Si profil fourni → créditer immédiatement
    if (!isPending) {
      const { error: updateError } = await (supabase
        .from('clients') as any)
        .update({
          credits_balance: newBalance,
          credits_lifetime_earned: newLifetimeEarned,
        })
        .eq('email', user.email)

      if (updateError) throw new Error(updateError.message)
    }

    // Logger le partage dans social_post_shares
    const { data: share, error: shareError } = await (supabase
      .from('social_post_shares') as any)
      .insert({
        user_email: user.email,
        post_id: postId,
        platform: post.platform,
        credits_awarded: creditsAwarded,
        social_profile_url: socialProfileUrl || null,
        status: status,
      })
      .select()
      .single()

    if (shareError) throw new Error(shareError.message)

    // Créer une transaction de crédits seulement si crédité
    if (!isPending) {
      await (supabase
        .from('credit_transactions') as any)
        .insert({
          user_email: user.email,
          amount: creditsAwarded,
          balance_after: newBalance,
          transaction_type: 'earn_social',
          description: `Partage ${post.platform} officiel WelcomeApp`,
          metadata: {
            post_id: postId,
            platform: post.platform,
            post_url: post.post_url,
            share_id: share.id,
          },
        })
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/credits')

    console.log('[SHARE SOCIAL POST] Succès ✅', {
      user: user.email,
      creditsAwarded,
      newBalance,
      platform: post.platform,
      status,
    })

    return {
      success: true,
      data: {
        creditsAwarded,
        newBalance,
        postUrl: post.post_url,
        platform: post.platform,
        status,
      },
    }
  } catch (error) {
    console.error('[SHARE SOCIAL POST] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

/**
 * Récupère l'historique des partages d'un utilisateur
 */
export async function getUserSocialShares(userEmail: string, limit: number = 50): Promise<{
  success: boolean
  data?: SocialPostShare[]
  error?: string
}> {
  try {
    const supabase = await createServerSupabaseClient()

    // Vérifier authentification
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || !user.email) {
      throw new Error('Non authentifié')
    }

    // Ownership check
    if (user.email !== userEmail) {
      throw new Error('Non autorisé')
    }

    const { data, error } = await (supabase
      .from('social_post_shares') as any)
      .select('*')
      .eq('user_email', userEmail)
      .order('shared_at', { ascending: false })
      .limit(limit)

    if (error) throw new Error(error.message)

    console.log('[GET USER SOCIAL SHARES] Succès ✅', data?.length || 0, 'partages')
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('[GET USER SOCIAL SHARES] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

/**
 * Récupère les partages en attente de l'utilisateur (status = 'pending')
 */
export async function getUserPendingShares(): Promise<{
  success: boolean
  data?: Array<SocialPostShare & { post?: OfficialSocialPost }>
  error?: string
}> {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || !user.email) {
      throw new Error('Non authentifié')
    }

    // Récupérer les partages pending avec infos du post
    const { data: shares, error: sharesError } = await (supabase
      .from('social_post_shares') as any)
      .select('*')
      .eq('user_email', user.email)
      .eq('status', 'pending')
      .order('shared_at', { ascending: false })

    if (sharesError) throw new Error(sharesError.message)

    // Enrichir avec les infos des posts
    const enrichedShares = []
    for (const share of shares || []) {
      const { data: post } = await (supabase
        .from('official_social_posts') as any)
        .select('*')
        .eq('id', share.post_id)
        .maybeSingle()

      enrichedShares.push({ ...share, post: post || undefined })
    }

    console.log('[GET USER PENDING SHARES] Succès ✅', enrichedShares.length, 'partages pending')
    return { success: true, data: enrichedShares }
  } catch (error) {
    console.error('[GET USER PENDING SHARES] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

/**
 * Complète un partage en attente en ajoutant le profil social et crédite l'utilisateur
 */
export async function completePendingShare(shareId: string, socialProfileUrl: string): Promise<{
  success: boolean
  data?: {
    creditsAwarded: number
    newBalance: number
  }
  error?: string
}> {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || !user.email) {
      throw new Error('Non authentifié')
    }

    if (!socialProfileUrl || socialProfileUrl.trim() === '') {
      throw new Error('Le lien du profil social est requis')
    }

    // Récupérer le partage pending
    const { data: share, error: shareError } = await (supabase
      .from('social_post_shares') as any)
      .select('*')
      .eq('id', shareId)
      .eq('user_email', user.email)
      .eq('status', 'pending')
      .maybeSingle()

    if (shareError) throw new Error(shareError.message)
    if (!share) throw new Error('Partage non trouvé ou déjà traité')

    // Récupérer le solde actuel
    const { data: client, error: clientError } = await (supabase
      .from('clients') as any)
      .select('credits_balance, credits_lifetime_earned')
      .eq('email', user.email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (clientError) throw new Error(clientError.message)
    if (!client) throw new Error('Client non trouvé')

    const currentBalance = client.credits_balance || 0
    const currentLifetimeEarned = client.credits_lifetime_earned || 0
    const creditsAwarded = share.credits_awarded
    const newBalance = currentBalance + creditsAwarded
    const newLifetimeEarned = currentLifetimeEarned + creditsAwarded

    // Mettre à jour le solde de tous les clients
    const { error: updateBalanceError } = await (supabase
      .from('clients') as any)
      .update({
        credits_balance: newBalance,
        credits_lifetime_earned: newLifetimeEarned,
      })
      .eq('email', user.email)

    if (updateBalanceError) throw new Error(updateBalanceError.message)

    // Mettre à jour le partage
    const { error: updateShareError } = await (supabase
      .from('social_post_shares') as any)
      .update({
        status: 'credited',
        social_profile_url: socialProfileUrl.trim(),
      })
      .eq('id', shareId)

    if (updateShareError) throw new Error(updateShareError.message)

    // Créer la transaction de crédits
    await (supabase
      .from('credit_transactions') as any)
      .insert({
        user_email: user.email,
        amount: creditsAwarded,
        balance_after: newBalance,
        transaction_type: 'earn_social',
        description: `Partage ${share.platform} officiel WelcomeApp (complété)`,
        metadata: {
          post_id: share.post_id,
          platform: share.platform,
          share_id: shareId,
          completed_at: new Date().toISOString(),
        },
      })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/credits')
    revalidatePath('/dashboard/credits/pending')

    console.log('[COMPLETE PENDING SHARE] Succès ✅', {
      user: user.email,
      creditsAwarded,
      newBalance,
    })

    return {
      success: true,
      data: {
        creditsAwarded,
        newBalance,
      },
    }
  } catch (error) {
    console.error('[COMPLETE PENDING SHARE] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

/**
 * Soumet un article de blog pour validation (crédits en attente)
 * L'admin vérifie que l'article est bien publié avec les liens WelcomeApp
 */
export async function submitBlogArticle(articleUrl: string): Promise<{
  success: boolean
  data?: {
    creditsAwarded: number
    status: 'pending'
  }
  error?: string
}> {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || !user.email) {
      throw new Error('Non authentifié')
    }

    if (!articleUrl || articleUrl.trim() === '') {
      throw new Error('L\'URL de l\'article est requise')
    }

    // Vérifier que l'URL est valide
    try {
      new URL(articleUrl)
    } catch {
      throw new Error('L\'URL n\'est pas valide')
    }

    // Vérifier que l'utilisateur n'a pas déjà soumis cet article
    const { data: existing } = await (supabase
      .from('social_post_shares') as any)
      .select('id')
      .eq('user_email', user.email)
      .eq('platform', 'blog')
      .eq('social_profile_url', articleUrl.trim())
      .maybeSingle()

    if (existing) {
      throw new Error('Vous avez déjà soumis cet article')
    }

    const creditsAwarded = 150 // Crédits pour un article de blog (valeur élevée car backlinks SEO + effort rédactionnel)

    // Insérer la soumission (status pending, sera validée par l'admin)
    const { data: share, error: shareError } = await (supabase
      .from('social_post_shares') as any)
      .insert({
        user_email: user.email,
        post_id: null, // Pas de post officiel associé
        platform: 'blog',
        credits_awarded: creditsAwarded,
        social_profile_url: articleUrl.trim(),
        status: 'pending',
      })
      .select()
      .single()

    if (shareError) throw new Error(shareError.message)

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/credits')

    console.log('[SUBMIT BLOG ARTICLE] Succès ✅', {
      user: user.email,
      articleUrl,
      creditsAwarded,
    })

    return {
      success: true,
      data: {
        creditsAwarded,
        status: 'pending',
      },
    }
  } catch (error) {
    console.error('[SUBMIT BLOG ARTICLE] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}
