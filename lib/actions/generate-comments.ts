'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Récupère tous les tips d'un client qui ont des reviews mais pas de commentaire
 */
export async function getTipsNeedingComments(clientId: string) {
  const supabase = await createServerSupabaseClient()

  try {
    const { data: tips, error } = await (supabase
      .from('tips') as any)
      .select('id, title, reviews, rating, user_ratings_total')
      .eq('client_id', clientId)
      .is('comment', null)
      .not('reviews', 'is', null)

    if (error) {
      console.error('[GET TIPS NEEDING COMMENTS] Erreur Supabase:', error)
      return { success: false, error: error.message, tips: [] }
    }

    // Filtrer pour ne garder que les tips avec des reviews non vides
    const validTips = tips?.filter((tip: any) =>
      tip.reviews &&
      Array.isArray(tip.reviews) &&
      tip.reviews.length > 0
    ) || []

    console.log(`[GET TIPS NEEDING COMMENTS] ${validTips.length} tips trouvés pour le client ${clientId}`)

    return { success: true, tips: validTips }
  } catch (error) {
    console.error('[GET TIPS NEEDING COMMENTS] Erreur:', error)
    return { success: false, error: 'Erreur serveur', tips: [] }
  }
}

/**
 * Génère des commentaires IA pour un tip spécifique
 */
export async function generateCommentForTip(tipId: string) {
  const supabase = await createServerSupabaseClient()

  try {
    // Récupérer le tip complet avec ses reviews
    const { data: tip, error: fetchError } = await (supabase
      .from('tips') as any)
      .select('id, title, reviews, rating, user_ratings_total, client_id')
      .eq('id', tipId)
      .single()

    if (fetchError || !tip) {
      console.error('[GENERATE COMMENT] Erreur récupération tip:', fetchError)
      return { success: false, error: 'Tip introuvable' }
    }

    if (!tip.reviews || !Array.isArray(tip.reviews) || tip.reviews.length === 0) {
      return { success: false, error: 'Pas de reviews disponibles' }
    }

    console.log(`[GENERATE COMMENT] Génération pour "${tip.title}"...`)

    // Appeler l'API de génération
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/generate-comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reviews: tip.reviews,
        placeName: tip.title,
        rating: tip.rating,
        userRatingsTotal: tip.user_ratings_total,
      }),
    })

    if (!response.ok) {
      console.error('[GENERATE COMMENT] Erreur API:', response.status)
      return { success: false, error: 'Erreur génération IA' }
    }

    const { comment } = await response.json()

    if (!comment) {
      return { success: false, error: 'Aucun commentaire généré' }
    }

    // Mettre à jour le tip avec le commentaire généré
    const { error: updateError } = await (supabase
      .from('tips') as any)
      .update({ comment })
      .eq('id', tipId)

    if (updateError) {
      console.error('[GENERATE COMMENT] Erreur mise à jour:', updateError)
      return { success: false, error: 'Erreur mise à jour DB' }
    }

    console.log(`[GENERATE COMMENT] ✅ Commentaire généré pour "${tip.title}":`, comment.substring(0, 50) + '...')

    return { success: true, comment }
  } catch (error) {
    console.error('[GENERATE COMMENT] Erreur:', error)
    return { success: false, error: 'Erreur serveur' }
  }
}

/**
 * Génère des commentaires IA pour tous les tips d'un client qui en ont besoin
 * OPTIMISÉ : Génération par batch de 5 tips au lieu de 1 par 1
 * SÉCURISÉ : Rate limiting (cooldown 5 min + quota 100/jour)
 */
export async function generateCommentsForClient(clientId: string) {
  const supabase = await createServerSupabaseClient()

  try {
    console.log(`[GENERATE COMMENTS BULK] 📦 Début pour client ${clientId}`)

    // 🛡️ ÉTAPE 1 : Vérifier le cooldown (5 minutes minimum entre générations)
    const { checkGenerationCooldown } = await import('./rate-limit')
    const cooldown = await checkGenerationCooldown(clientId)

    if (!cooldown.canGenerate) {
      const minutes = Math.ceil(cooldown.secondsRemaining / 60)
      console.warn(`[GENERATE COMMENTS BULK] ⏸️ Cooldown actif: ${cooldown.secondsRemaining}s restants`)
      return {
        success: false,
        error: `Veuillez patienter ${minutes} minute${minutes > 1 ? 's' : ''} avant de relancer la génération`,
        cooldownSeconds: cooldown.secondsRemaining,
        generated: 0,
        failed: 0,
      }
    }

    // 🛡️ ÉTAPE 2 : Vérifier le quota quotidien (max 100 générations/jour)
    const { checkDailyQuota } = await import('./rate-limit')
    const quota = await checkDailyQuota(clientId)

    if (!quota.canGenerate) {
      console.warn(`[GENERATE COMMENTS BULK] 🚫 Quota quotidien atteint: ${quota.usedCount}/${quota.maxCount}`)
      return {
        success: false,
        error: `Quota quotidien atteint (${quota.usedCount}/${quota.maxCount} générations). Réessayez demain.`,
        generated: 0,
        failed: 0,
      }
    }

    console.log(`[GENERATE COMMENTS BULK] ✅ Rate limit OK - Quota: ${quota.usedCount}/${quota.maxCount}`)

    // Récupérer les tips qui ont besoin de commentaires
    const { success, tips, error } = await getTipsNeedingComments(clientId)

    if (!success || !tips) {
      return { success: false, error: error || 'Erreur récupération tips', generated: 0, failed: 0 }
    }

    if (tips.length === 0) {
      return { success: true, generated: 0, failed: 0, message: 'Aucun tip à traiter' }
    }

    console.log(`[GENERATE COMMENTS BULK] 🎯 ${tips.length} tips à traiter`)

    // 🚀 OPTIMISATION : Grouper par batch de 5 tips
    const BATCH_SIZE = 5
    const batches: any[][] = []

    for (let i = 0; i < tips.length; i += BATCH_SIZE) {
      batches.push(tips.slice(i, i + BATCH_SIZE))
    }

    console.log(`[GENERATE COMMENTS BULK] 📊 ${batches.length} batch(s) de ${BATCH_SIZE} tips (au lieu de ${tips.length} requêtes)`)

    let generated = 0
    let failed = 0
    const results = []

    // Traiter chaque batch
    for (const [batchIndex, batch] of batches.entries()) {
      console.log(`[GENERATE COMMENTS BULK] 🔄 Batch ${batchIndex + 1}/${batches.length} - ${batch.length} tips`)

      try {
        // Appel à l'API batch
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/generate-comments-batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tips: batch }),
        })

        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`)
        }

        const { comments } = await response.json()

        // Mettre à jour les tips avec les commentaires générés
        for (const { tipId, comment } of comments) {
          if (comment) {
            const { error: updateError } = await (supabase
              .from('tips') as any)
              .update({ comment })
              .eq('id', tipId)

            if (updateError) {
              console.error(`[GENERATE COMMENTS BULK] ❌ Erreur update tip ${tipId}:`, updateError)
              failed++
              results.push({ tipId, success: false, error: updateError.message })
            } else {
              generated++
              const tip = batch.find(t => t.id === tipId)
              results.push({ tipId, title: tip?.title || 'Unknown', success: true })
              console.log(`[GENERATE COMMENTS BULK] ✅ "${tip?.title}" - Commentaire sauvegardé`)
            }
          } else {
            failed++
            const tip = batch.find(t => t.id === tipId)
            results.push({ tipId, title: tip?.title || 'Unknown', success: false, error: 'Aucun commentaire généré' })
          }
        }

        // Petit délai entre chaque batch (éviter rate limiting)
        if (batchIndex < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      } catch (error: any) {
        console.error(`[GENERATE COMMENTS BULK] ❌ Erreur batch ${batchIndex + 1}:`, error)
        // Marquer tous les tips du batch comme échoués
        for (const tip of batch) {
          failed++
          results.push({ tipId: tip.id, title: tip.title, success: false, error: error.message })
        }
      }
    }

    console.log(`[GENERATE COMMENTS BULK] 🎉 Terminé - ${generated} réussis, ${failed} échoués`)
    console.log(`[GENERATE COMMENTS BULK] 💡 ${batches.length} requêtes API au lieu de ${tips.length} (${Math.round((1 - batches.length / tips.length) * 100)}% de réduction)`)

    // 🛡️ ÉTAPE 3 : Enregistrer la génération dans les logs (anti-spam tracking)
    const { logGeneration } = await import('./rate-limit')
    await logGeneration(clientId, tips.length, 'batch', generated, failed)

    // Revalider la page du welcomebook pour afficher les nouveaux commentaires
    revalidatePath('/[slug]', 'page')

    return { success: true, generated, failed, results }
  } catch (error) {
    console.error('[GENERATE COMMENTS BULK] 💥 Erreur:', error)
    return { success: false, error: 'Erreur serveur', generated: 0, failed: 0 }
  }
}
