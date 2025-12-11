/**
 * Server Actions pour la gestion des tips avec support des optimistic updates
 */
'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { TipInsert, TipUpdate, TipWithDetails, Category } from '@/types'

/**
 * Ajoute un nouveau tip
 * @param data - Données du tip à créer
 * @returns Le tip créé avec ses relations (category, media)
 */
export async function addTip(data: TipInsert): Promise<{ tip: TipWithDetails | null; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()

    // Vérifier que l'utilisateur est authentifié
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Non authentifié')
    }

    // Vérifier l'ownership du client
    const { data: client } = await (supabase
      .from('clients') as any)
      .select('email')
      .eq('id', data.client_id)
      .maybeSingle()

    if (!client || client.email !== user.email) {
      throw new Error('Non autorisé')
    }

    // Insérer le tip et récupérer avec relations
    const { data: tip, error } = await (supabase
      .from('tips') as any)
      .insert(data)
      .select(`
        *,
        category:categories(*),
        media:tip_media(*)
      `)
      .single()

    if (error) {
      console.error('[ADD TIP] Erreur DB:', error)
      throw error
    }

    console.log('[ADD TIP] Tip créé avec succès:', tip.id)
    return { tip }
  } catch (error) {
    console.error('[ADD TIP] Erreur:', error)
    return {
      tip: null,
      error: error instanceof Error ? error.message : 'Erreur lors de l\'ajout du conseil',
    }
  }
}

/**
 * Met à jour un tip existant
 * @param id - ID du tip à mettre à jour
 * @param updates - Champs à mettre à jour
 * @returns Le tip mis à jour avec ses relations
 */
export async function updateTip(
  id: string,
  updates: TipUpdate
): Promise<{ tip: TipWithDetails | null; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()

    // Vérifier que l'utilisateur est authentifié
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Non authentifié')
    }

    // Vérifier l'ownership via le tip → client
    const { data: tip } = await (supabase
      .from('tips') as any)
      .select('client_id, clients!inner(email)')
      .eq('id', id)
      .maybeSingle()

    if (!tip || tip.clients.email !== user.email) {
      throw new Error('Non autorisé')
    }

    // Mettre à jour et récupérer avec relations
    const { data: updatedTip, error } = await (supabase
      .from('tips') as any)
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        category:categories(*),
        media:tip_media(*)
      `)
      .single()

    if (error) {
      console.error('[UPDATE TIP] Erreur DB:', error)
      throw error
    }

    console.log('[UPDATE TIP] Tip mis à jour avec succès:', id)
    return { tip: updatedTip }
  } catch (error) {
    console.error('[UPDATE TIP] Erreur:', error)
    return {
      tip: null,
      error: error instanceof Error ? error.message : 'Erreur lors de la modification du conseil',
    }
  }
}

/**
 * Supprime un tip
 * @param id - ID du tip à supprimer
 * @returns L'ID du tip supprimé
 */
export async function deleteTip(id: string): Promise<{ id: string | null; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()

    // Vérifier que l'utilisateur est authentifié
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Non authentifié')
    }

    // Vérifier l'ownership
    const { data: tip } = await (supabase
      .from('tips') as any)
      .select('client_id, clients!inner(email)')
      .eq('id', id)
      .maybeSingle()

    if (!tip || tip.clients.email !== user.email) {
      throw new Error('Non autorisé')
    }

    // Supprimer le tip (les médias seront supprimés via CASCADE)
    const { error } = await (supabase
      .from('tips') as any)
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[DELETE TIP] Erreur DB:', error)
      throw error
    }

    console.log('[DELETE TIP] Tip supprimé avec succès:', id)
    return { id }
  } catch (error) {
    console.error('[DELETE TIP] Erreur:', error)
    return {
      id: null,
      error: error instanceof Error ? error.message : 'Erreur lors de la suppression du conseil',
    }
  }
}

/**
 * Ajoute une nouvelle catégorie
 * @param name - Nom de la catégorie (peut inclure un emoji, ex: "🍴 Restaurants")
 * @param clientId - ID du client propriétaire
 * @returns La catégorie créée
 */
export async function addCategory(
  name: string,
  clientId: string
): Promise<{ category: Category | null; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()

    // Vérifier que l'utilisateur est authentifié
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Non authentifié')
    }

    // Vérifier l'ownership
    const { data: client } = await (supabase
      .from('clients') as any)
      .select('email')
      .eq('id', clientId)
      .maybeSingle()

    if (!client || client.email !== user.email) {
      throw new Error('Non autorisé')
    }

    // Générer le slug
    const slug = name
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Insérer la catégorie
    const { data: category, error } = await (supabase
      .from('categories') as any)
      .insert({
        name: name.trim(),
        slug,
      })
      .select()
      .single()

    if (error) {
      console.error('[ADD CATEGORY] Erreur DB:', error)
      throw error
    }

    console.log('[ADD CATEGORY] Catégorie créée avec succès:', category.id)
    return { category }
  } catch (error) {
    console.error('[ADD CATEGORY] Erreur:', error)
    return {
      category: null,
      error: error instanceof Error ? error.message : 'Erreur lors de l\'ajout de la catégorie',
    }
  }
}

/**
 * Met à jour une catégorie existante
 * @param id - ID de la catégorie
 * @param name - Nouveau nom (peut inclure un emoji, ex: "🍴 Restaurants")
 * @returns La catégorie mise à jour
 */
export async function updateCategory(
  id: string,
  name?: string
): Promise<{ category: Category | null; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()

    // Vérifier que l'utilisateur est authentifié
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Non authentifié')
    }

    // Vérifier l'ownership via les tips de cette catégorie
    const { data: tip } = await (supabase
      .from('tips') as any)
      .select('client_id, clients(email)')
      .eq('category_id', id)
      .limit(1)
      .maybeSingle()

    if (!tip || !tip.clients || tip.clients.email !== user.email) {
      throw new Error('Non autorisé')
    }

    // Préparer les données de mise à jour
    const updates: Record<string, string> = {}
    if (name) {
      updates.name = name.trim()
      updates.slug = name
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    }

    // Mettre à jour la catégorie
    const { data: category, error } = await (supabase
      .from('categories') as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[UPDATE CATEGORY] Erreur DB:', error)
      throw error
    }

    console.log('[UPDATE CATEGORY] Catégorie mise à jour avec succès:', id)
    return { category }
  } catch (error) {
    console.error('[UPDATE CATEGORY] Erreur:', error)
    return {
      category: null,
      error: error instanceof Error ? error.message : 'Erreur lors de la modification de la catégorie',
    }
  }
}

/**
 * Supprime une catégorie
 * @param id - ID de la catégorie à supprimer
 * @returns L'ID de la catégorie supprimée
 */
export async function deleteCategory(id: string): Promise<{ id: string | null; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()

    // Vérifier que l'utilisateur est authentifié
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Non authentifié')
    }

    // Vérifier l'ownership via les tips de cette catégorie
    const { data: tip } = await (supabase
      .from('tips') as any)
      .select('client_id, clients(email)')
      .eq('category_id', id)
      .limit(1)
      .maybeSingle()

    if (!tip || !tip.clients || tip.clients.email !== user.email) {
      throw new Error('Non autorisé')
    }

    // Supprimer la catégorie
    const { error } = await (supabase
      .from('categories') as any)
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[DELETE CATEGORY] Erreur DB:', error)
      throw error
    }

    console.log('[DELETE CATEGORY] Catégorie supprimée avec succès:', id)
    return { id }
  } catch (error) {
    console.error('[DELETE CATEGORY] Erreur:', error)
    return {
      id: null,
      error: error instanceof Error ? error.message : 'Erreur lors de la suppression de la catégorie',
    }
  }
}
