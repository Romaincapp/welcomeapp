'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * Réorganise les tips dans une catégorie
 */
export async function reorderTips(categoryId: string, tipIds: string[]) {
  const supabase = await createServerSupabaseClient()

  try {
    // Vérifier que l'utilisateur est authentifié
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Non authentifié')
    }

    // Mettre à jour l'ordre de chaque tip
    const updates = tipIds.map((tipId, index) => ({
      id: tipId,
      order: index,
    }))

    // Exécuter toutes les mises à jour en parallèle
    const promises = updates.map(({ id, order }) =>
      (supabase
        .from('tips') as any)
        .update({ order })
        .eq('id', id)
    )

    const results = await Promise.all(promises)

    // Vérifier s'il y a des erreurs
    const errors = results.filter((result) => result.error)
    if (errors.length > 0) {
      console.error('Erreurs lors de la réorganisation des tips:', errors)
      return { success: false, error: 'Erreur lors de la réorganisation' }
    }

    console.log('[REORDER TIPS] Réorganisation réussie:', categoryId)
    return { success: true }
  } catch (error) {
    console.error('Erreur lors de la réorganisation des tips:', error)
    return { success: false, error: 'Erreur serveur' }
  }
}

/**
 * Réorganise les catégories
 */
export async function reorderCategories(categoryIds: string[]) {
  const supabase = await createServerSupabaseClient()

  try {
    // Vérifier que l'utilisateur est authentifié
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Non authentifié')
    }

    // Mettre à jour l'ordre de chaque catégorie
    const updates = categoryIds.map((categoryId, index) => ({
      id: categoryId,
      order: index,
    }))

    // Exécuter toutes les mises à jour en parallèle
    const promises = updates.map(({ id, order }) =>
      (supabase
        .from('categories') as any)
        .update({ order })
        .eq('id', id)
    )

    const results = await Promise.all(promises)

    // Vérifier s'il y a des erreurs
    const errors = results.filter((result) => result.error)
    if (errors.length > 0) {
      console.error('Erreurs lors de la réorganisation des catégories:', errors)
      return { success: false, error: 'Erreur lors de la réorganisation' }
    }

    console.log('[REORDER CATEGORIES] Réorganisation réussie')
    return { success: true }
  } catch (error) {
    console.error('Erreur lors de la réorganisation des catégories:', error)
    return { success: false, error: 'Erreur serveur' }
  }
}

/**
 * Déplace un tip vers une autre catégorie
 */
export async function moveTipToCategory(tipId: string, newCategoryId: string | null, newOrder: number) {
  const supabase = await createServerSupabaseClient()

  try {
    // Vérifier que l'utilisateur est authentifié
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Non authentifié')
    }

    const { error } = await (supabase
      .from('tips') as any)
      .update({
        category_id: newCategoryId,
        order: newOrder,
      })
      .eq('id', tipId)

    if (error) {
      console.error('Erreur lors du déplacement du tip:', error)
      return { success: false, error: 'Erreur lors du déplacement' }
    }

    console.log('[MOVE TIP] Tip déplacé avec succès:', tipId)
    return { success: true }
  } catch (error) {
    console.error('Erreur lors du déplacement du tip:', error)
    return { success: false, error: 'Erreur serveur' }
  }
}
