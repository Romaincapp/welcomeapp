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

    console.log('[UPDATE BACKGROUND] Succès ✅')
    return { success: true }
  } catch (error) {
    console.error('[UPDATE BACKGROUND] Erreur catch:', error)
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
