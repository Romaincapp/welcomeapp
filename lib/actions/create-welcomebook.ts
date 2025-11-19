'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * Vérifie si un email existe déjà (dans clients OU dans auth.users)
 * À appeler AVANT auth.signUp() pour donner un feedback immédiat
 */
export async function checkEmailExists(email: string): Promise<{ exists: boolean; inClients: boolean; inAuth: boolean; slug?: string }> {
  const supabase = await createServerSupabaseClient()

  try {
    // Vérifier dans la table clients
    console.log('[CHECK EMAIL] Vérification pour email:', email)

    const { data: clientData, error: checkError } = await (supabase
      .from('clients') as any)
      .select('slug')
      .eq('email', email)
      .maybeSingle()

    console.log('[CHECK EMAIL] Résultat - data:', clientData, 'error:', checkError)

    // Si erreur de requête, on doit la propager (ne pas supposer que l'email est disponible)
    if (checkError) {
      console.error('[CHECK EMAIL] Erreur lors de la vérification:', checkError)
      throw new Error(`Erreur lors de la vérification de l'email: ${checkError.message}`)
    }

    const inClients = !!clientData
    const slug = clientData?.slug

    console.log('[CHECK EMAIL] Résultat final - exists:', inClients, 'slug:', slug)

    return {
      exists: inClients,
      inClients,
      inAuth: false, // On ne peut pas vérifier sans service_role
      slug
    }
  } catch (error) {
    console.error('[CHECK EMAIL] Erreur catch:', error)
    // Re-throw l'erreur au lieu de retourner exists: false
    throw error
  }
}

/**
 * Vérifie si un slug existe déjà dans la table clients
 * À appeler en temps réel pendant que l'utilisateur tape le nom du logement
 */
export async function checkSlugExists(slug: string): Promise<{ exists: boolean; suggestion?: string }> {
  const supabase = await createServerSupabaseClient()

  try {
    console.log('[CHECK SLUG] Vérification pour slug:', slug)

    const { data: clientData, error: checkError } = await (supabase
      .from('clients') as any)
      .select('slug')
      .eq('slug', slug)
      .maybeSingle()

    console.log('[CHECK SLUG] Résultat - data:', clientData, 'error:', checkError)

    if (checkError) {
      console.error('[CHECK SLUG] Erreur lors de la vérification:', checkError)
      throw new Error(`Erreur lors de la vérification du slug: ${checkError.message}`)
    }

    const exists = !!clientData

    // Si le slug existe, proposer une alternative
    let suggestion: string | undefined
    if (exists) {
      // Générer une suggestion avec un numéro
      let counter = 1
      let suggestedSlug = `${slug}-${counter}`

      while (counter < 10) { // Limiter à 10 tentatives
        const { data: suggestionData } = await (supabase
          .from('clients') as any)
          .select('slug')
          .eq('slug', suggestedSlug)
          .maybeSingle()

        if (!suggestionData) {
          suggestion = suggestedSlug
          break
        }

        counter++
        suggestedSlug = `${slug}-${counter}`
      }
    }

    console.log('[CHECK SLUG] Résultat final - exists:', exists, 'suggestion:', suggestion)

    return { exists, suggestion }
  } catch (error) {
    console.error('[CHECK SLUG] Erreur catch:', error)
    throw error
  }
}

/**
 * Server Action pour créer un welcomebook
 * IMPORTANT: Cette fonction ne vérifie PLUS l'authentification car elle est appelée
 * immédiatement après auth.signUp(), avant que la session soit synchronisée côté serveur.
 *
 * @param email - Email de l'utilisateur
 * @param propertyName - Nom du logement
 * @param userId - ID de l'utilisateur Auth (passé depuis le client après signUp)
 * @param welcomebookName - Nom d'affichage optionnel pour le switcher (par défaut: propertyName)
 */
export async function createWelcomebookServerAction(email: string, propertyName: string, userId: string, welcomebookName?: string) {
  const supabase = await createServerSupabaseClient()

  try {
    console.log('[CREATE WELCOMEBOOK] Création pour:', email)

    // Vérifier que propertyName n'est pas vide
    if (!propertyName || propertyName.trim() === '') {
      throw new Error('Le nom du logement est requis')
    }

    // Vérifier que userId est fourni
    if (!userId || userId.trim() === '') {
      throw new Error('userId est requis')
    }

    // NOTE: Pas de vérification d'existence ici car déjà faite dans checkEmailExists()
    // avant auth.signUp(). Les deux fonctions n'ont pas le même contexte auth (RLS),
    // donc la double vérification peut donner des résultats contradictoires.
    // On fait confiance à la vérification initiale.

    // Générer le slug à partir du nom du logement
    const trimmedName = propertyName.trim()

    let slug = trimmedName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Vérifier l'unicité du slug
    let counter = 0
    let uniqueSlug = slug

    while (true) {
      const { data: slugExists } = await supabase
        .from('clients')
        .select('id')
        .eq('slug', uniqueSlug)
        .single()

      if (!slugExists) break

      counter++
      uniqueSlug = `${slug}-${counter}`
    }

    // Créer le welcomebook avec un background par défaut
    const insertData = {
      name: trimmedName,
      slug: uniqueSlug,
      email: email,
      user_id: userId, // IMPORTANT: Nécessaire pour la RLS policy "user_id = auth.uid()"
      welcomebook_name: welcomebookName || trimmedName, // Nom d'affichage (par défaut: propertyName)
      header_color: '#4F46E5',
      footer_color: '#1E1B4B',
      background_image: '/backgrounds/default-1.jpg',
    }

    const { data, error } = await (supabase
      .from('clients') as any)
      .insert(insertData)
      .select()
      .single()

    if (error) {
      // GESTION DU DOUBLE APPEL (React Strict Mode en dev)
      // Si l'erreur est "duplicate key email", c'est que le client vient d'être créé
      // par le 1er appel. On récupère le client par user_id (garantit le bon client).
      if (error.code === '23505' && error.message.includes('clients_email_unique')) {
        const { data: justCreatedClient, error: fetchError } = await (supabase
          .from('clients') as any)
          .select('*')
          .eq('user_id', userId)
          .single()

        if (fetchError || !justCreatedClient) {
          return { success: true, message: 'Client déjà créé (double appel)' }
        }

        return { success: true, data: justCreatedClient }
      }

      throw new Error(`Erreur Supabase: ${error.message || JSON.stringify(error)}`)
    }

    console.log('[CREATE WELCOMEBOOK] Welcomebook créé:', data.slug)
    return { success: true, data }
  } catch (error: unknown) {
    console.error('[CREATE WELCOMEBOOK] Erreur:', error instanceof Error ? error.message : error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création du welcomebook'
    return { success: false, error: errorMessage }
  }
}
