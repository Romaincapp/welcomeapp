'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { ClientUpdate } from '@/types'
import { revalidatePath } from 'next/cache'

/**
 * Met à jour le background du client
 * @param clientId - ID du client
 * @param backgroundPath - Chemin vers l'image de fond (ex: '/backgrounds/plage.jpg')
 * @returns Success status
 */
export async function updateClientBackground(clientId: string, backgroundPath: string) {
  const supabase = await createServerSupabaseClient()

  try {
    console.log('[UPDATE BACKGROUND] Client:', clientId, 'Background:', backgroundPath)

    // Vérifier que l'utilisateur est authentifié
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Non authentifié')
    }

    // Vérifier que le client appartient à l'utilisateur
    const { data: client } = await (supabase
      .from('clients') as any)
      .select('id, email')
      .eq('id', clientId)
      .single()

    if (!client) {
      throw new Error('Client non trouvé')
    }

    if (client.email !== user.email) {
      throw new Error('Non autorisé')
    }

    // Mettre à jour le background
    const updateData: ClientUpdate = {
      background_image: backgroundPath
    }

    const { error } = await (supabase
      .from('clients') as any)
      .update(updateData)
      .eq('id', clientId)

    if (error) {
      console.error('[UPDATE BACKGROUND] Erreur:', error)
      throw new Error(`Erreur lors de la mise à jour: ${error.message}`)
    }

    // Invalider le cache Next.js pour que les changements soient visibles
    revalidatePath('/dashboard')
    revalidatePath('/onboarding')
    // Note: On ne peut pas revalidate le slug ici car on n'a que le clientId
    // Le refresh sera géré côté client

    console.log('[UPDATE BACKGROUND] Succès ✅')
    return { success: true }
  } catch (error) {
    console.error('[UPDATE BACKGROUND] Erreur catch:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    return { success: false, error: errorMessage }
  }
}

/**
 * Met à jour la couleur du header du client
 * @param clientId - ID du client
 * @param headerColor - Couleur hex (ex: '#6366f1')
 * @returns Success status
 */
export async function updateClientHeaderColor(clientId: string, headerColor: string) {
  const supabase = await createServerSupabaseClient()

  try {
    console.log('[UPDATE HEADER COLOR] Client:', clientId, 'Color:', headerColor)

    // Vérifier que l'utilisateur est authentifié
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Non authentifié')
    }

    // Vérifier que le client appartient à l'utilisateur
    const { data: client } = await (supabase
      .from('clients') as any)
      .select('id, email')
      .eq('id', clientId)
      .single()

    if (!client) {
      throw new Error('Client non trouvé')
    }

    if (client.email !== user.email) {
      throw new Error('Non autorisé')
    }

    // Mettre à jour la couleur du header
    const updateData: ClientUpdate = {
      header_color: headerColor
    }

    const { error } = await (supabase
      .from('clients') as any)
      .update(updateData)
      .eq('id', clientId)

    if (error) {
      console.error('[UPDATE HEADER COLOR] Erreur:', error)
      throw new Error(`Erreur lors de la mise à jour: ${error.message}`)
    }

    // Invalider le cache Next.js pour que les changements soient visibles
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/welcome')
    // Note: On ne peut pas revalidate le slug ici car on n'a que le clientId
    // Le refresh sera géré côté client

    console.log('[UPDATE HEADER COLOR] Succès ✅')
    return { success: true }
  } catch (error) {
    console.error('[UPDATE HEADER COLOR] Erreur catch:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    return { success: false, error: errorMessage }
  }
}

/**
 * Vérifie si un slug est disponible (en excluant le client actuel)
 * @param slug - Slug à vérifier
 * @param currentClientId - ID du client actuel (à exclure de la vérification)
 * @returns { available: boolean, suggestion?: string }
 */
export async function checkSlugAvailability(slug: string, currentClientId: string) {
  const supabase = await createServerSupabaseClient()

  try {
    console.log('[CHECK SLUG AVAILABILITY] Slug:', slug, 'Current Client:', currentClientId)

    // Vérifier si le slug existe (en excluant le client actuel)
    const { data: existingClient, error } = await (supabase
      .from('clients') as any)
      .select('id, slug')
      .eq('slug', slug)
      .neq('id', currentClientId)  // Exclure le client actuel
      .maybeSingle()

    if (error) {
      console.error('[CHECK SLUG AVAILABILITY] Erreur:', error)
      throw new Error(`Erreur lors de la vérification: ${error.message}`)
    }

    const available = !existingClient

    // Si le slug est pris, générer une suggestion
    let suggestion: string | undefined
    if (!available) {
      let counter = 1
      let suggestedSlug = `${slug}-${counter}`

      while (counter < 10) {
        const { data: suggestionData } = await (supabase
          .from('clients') as any)
          .select('id')
          .eq('slug', suggestedSlug)
          .neq('id', currentClientId)
          .maybeSingle()

        if (!suggestionData) {
          suggestion = suggestedSlug
          break
        }

        counter++
        suggestedSlug = `${slug}-${counter}`
      }
    }

    console.log('[CHECK SLUG AVAILABILITY] Résultat - available:', available, 'suggestion:', suggestion)
    return { available, suggestion }
  } catch (error) {
    console.error('[CHECK SLUG AVAILABILITY] Erreur catch:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    throw new Error(errorMessage)
  }
}

/**
 * Met à jour le slug du client
 * @param clientId - ID du client
 * @param newSlug - Nouveau slug
 * @returns Success status
 */
export async function updateClientSlug(clientId: string, newSlug: string) {
  const supabase = await createServerSupabaseClient()

  try {
    console.log('[UPDATE SLUG] Client:', clientId, 'Nouveau slug:', newSlug)

    // Vérifier que l'utilisateur est authentifié
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Non authentifié')
    }

    // Récupérer le client actuel
    const { data: client, error: clientError } = await (supabase
      .from('clients') as any)
      .select('id, email, slug')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      throw new Error('Client non trouvé')
    }

    // Vérifier l'ownership
    if (client.email !== user.email) {
      throw new Error('Non autorisé')
    }

    // Vérifier que le nouveau slug est différent de l'ancien
    if (client.slug === newSlug) {
      return { success: true, message: 'Le slug est identique, aucune modification nécessaire' }
    }

    // Normaliser le slug (même logique que generateSlug)
    const normalizedSlug = newSlug
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '')

    if (!normalizedSlug || normalizedSlug.length < 2) {
      throw new Error('Le slug doit contenir au moins 2 caractères')
    }

    // Vérifier l'unicité du nouveau slug
    const { available } = await checkSlugAvailability(normalizedSlug, clientId)
    if (!available) {
      throw new Error('Ce slug est déjà utilisé par un autre compte')
    }

    // Mettre à jour le slug
    const { error: updateError } = await (supabase
      .from('clients') as any)
      .update({ slug: normalizedSlug })
      .eq('id', clientId)

    if (updateError) {
      console.error('[UPDATE SLUG] Erreur:', updateError)
      throw new Error(`Erreur lors de la mise à jour: ${updateError.message}`)
    }

    // Revalider les caches
    revalidatePath('/dashboard')
    revalidatePath(`/${client.slug}`)  // Ancien slug
    revalidatePath(`/${normalizedSlug}`)  // Nouveau slug

    console.log('[UPDATE SLUG] Succès ✅ - Ancien:', client.slug, '→ Nouveau:', normalizedSlug)
    return { success: true, newSlug: normalizedSlug }
  } catch (error) {
    console.error('[UPDATE SLUG] Erreur catch:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    return { success: false, error: errorMessage }
  }
}

/**
 * Récupère TOUS les welcomebooks de l'utilisateur authentifié
 * Utilisé pour afficher la liste dans le switcher
 * @returns Liste des welcomebooks triés par date de création (plus récent en premier)
 */
export async function getClientsByUserId(): Promise<{
  success: boolean
  data?: any[]
  error?: string
}> {
  const supabase = await createServerSupabaseClient()

  try {
    console.log('[GET CLIENTS BY USER ID] Récupération des welcomebooks...')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) {
      return { success: false, error: 'Non authentifié' }
    }

    // Fetch ALL clients for this email, sorted by newest first
    const { data, error } = await (supabase
      .from('clients') as any)
      .select('*')
      .eq('email', user.email)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[GET CLIENTS BY USER ID] Erreur:', error)
      throw new Error(error.message)
    }

    console.log(`[GET CLIENTS BY USER ID] Succès ✅ - ${data?.length || 0} welcomebook(s) trouvé(s)`)
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('[GET CLIENTS BY USER ID] Erreur catch:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

/**
 * Récupère un welcomebook spécifique par ID avec vérification d'ownership
 * @param clientId - ID du welcomebook
 * @returns Le welcomebook si l'utilisateur en est propriétaire
 */
export async function getClientById(clientId: string): Promise<{
  success: boolean
  data?: any
  error?: string
}> {
  const supabase = await createServerSupabaseClient()

  try {
    console.log('[GET CLIENT BY ID] Client ID:', clientId)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) {
      return { success: false, error: 'Non authentifié' }
    }

    const { data, error } = await (supabase
      .from('clients') as any)
      .select('*')
      .eq('id', clientId)
      .eq('email', user.email) // Ownership check
      .maybeSingle()

    if (error) {
      console.error('[GET CLIENT BY ID] Erreur:', error)
      throw new Error(error.message)
    }

    if (!data) {
      return { success: false, error: 'Welcomebook introuvable ou non autorisé' }
    }

    console.log('[GET CLIENT BY ID] Succès ✅')
    return { success: true, data }
  } catch (error) {
    console.error('[GET CLIENT BY ID] Erreur catch:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

/**
 * Supprime un welcomebook avec vérification d'ownership
 * ATTENTION: Suppression en cascade de toutes les données (tips, media, analytics, etc.)
 * @param clientId - ID du welcomebook à supprimer
 * @returns Résultat avec nombre de welcomebooks restants pour gérer la redirection
 */
export async function deleteClientWelcomebook(clientId: string): Promise<{
  success: boolean
  remainingCount?: number
  error?: string
}> {
  const supabase = await createServerSupabaseClient()

  try {
    console.log('[DELETE WELCOMEBOOK] Suppression demandée pour:', clientId)

    // 1. Vérifier authentification
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) {
      return { success: false, error: 'Non authentifié' }
    }

    // 2. Ownership check strict - vérifier que ce welcomebook appartient bien à l'utilisateur
    const { data: client, error: fetchError } = await (supabase
      .from('clients') as any)
      .select('id, email, slug, welcomebook_name')
      .eq('id', clientId)
      .maybeSingle()

    if (fetchError) {
      console.error('[DELETE WELCOMEBOOK] Erreur fetch client:', fetchError)
      throw new Error(fetchError.message)
    }

    if (!client) {
      return { success: false, error: 'Welcomebook introuvable' }
    }

    if (client.email !== user.email) {
      console.error('[DELETE WELCOMEBOOK] Tentative de suppression non autorisée')
      return { success: false, error: 'Non autorisé - ce welcomebook ne vous appartient pas' }
    }

    // 3. Compter les welcomebooks restants AVANT suppression
    const { data: allClients, error: countError } = await (supabase
      .from('clients') as any)
      .select('id')
      .eq('email', user.email)

    if (countError) {
      console.error('[DELETE WELCOMEBOOK] Erreur comptage:', countError)
      throw new Error(countError.message)
    }

    const totalCount = allClients?.length || 0
    const remainingCount = totalCount - 1

    console.log('[DELETE WELCOMEBOOK] Welcomebooks avant suppression:', totalCount)
    console.log('[DELETE WELCOMEBOOK] Welcomebooks après suppression:', remainingCount)

    // 4. Effectuer la suppression (CASCADE automatique vers toutes les tables liées)
    const { error: deleteError } = await (supabase
      .from('clients') as any)
      .delete()
      .eq('id', clientId)

    if (deleteError) {
      console.error('[DELETE WELCOMEBOOK] Erreur suppression:', deleteError)
      throw new Error(deleteError.message)
    }

    console.log('[DELETE WELCOMEBOOK] Suppression réussie ✅ - Slug:', client.slug)

    // 5. Invalider le cache du dashboard
    revalidatePath('/dashboard')

    return {
      success: true,
      remainingCount
    }
  } catch (error) {
    console.error('[DELETE WELCOMEBOOK] Erreur catch:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}
