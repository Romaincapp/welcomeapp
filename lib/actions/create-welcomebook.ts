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
 * Server Action pour créer un welcomebook
 * IMPORTANT: Cette fonction ne vérifie PLUS l'authentification car elle est appelée
 * immédiatement après auth.signUp(), avant que la session soit synchronisée côté serveur.
 *
 * @param email - Email de l'utilisateur
 * @param propertyName - Nom du logement
 * @param userId - ID de l'utilisateur Auth (passé depuis le client après signUp)
 */
export async function createWelcomebookServerAction(email: string, propertyName: string, userId: string) {
  const supabase = await createServerSupabaseClient()

  try {
    console.log('[CREATE WELCOMEBOOK] Email:', email, 'PropertyName:', propertyName, 'UserId:', userId)

    // Vérifier que propertyName n'est pas vide
    if (!propertyName || propertyName.trim() === '') {
      throw new Error('Le nom du logement est requis')
    }

    // Vérifier que userId est fourni
    if (!userId || userId.trim() === '') {
      throw new Error('userId est requis')
    }

    // Vérifier si un welcomebook existe déjà (double sécurité)
    const { data: existingClient, error: existingError } = await (supabase
      .from('clients') as any)
      .select('id, slug, name')
      .eq('email', email)
      .maybeSingle() // maybeSingle() ne lance pas d'erreur si aucun résultat

    console.log('[CREATE WELCOMEBOOK] Vérification existence - existing:', existingClient, 'error:', existingError)

    if (existingClient) {
      console.log('[CREATE WELCOMEBOOK] Welcomebook existe déjà:', existingClient)
      throw new Error(`Un compte existe déjà avec cet email (${existingClient.slug}). Utilisez le bouton "Supprimer mon compte" dans le dashboard pour repartir de zéro.`)
    }

    // Générer le slug à partir du nom du logement
    const trimmedName = propertyName.trim()
    let slug = trimmedName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '')

    console.log('[CREATE WELCOMEBOOK] Slug généré:', slug)

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
      header_color: '#4F46E5',
      footer_color: '#1E1B4B',
      background_image: '/backgrounds/default-1.jpg', // Image par défaut (à ajouter dans public/backgrounds)
    }

    console.log('[CREATE WELCOMEBOOK] Données à insérer:', insertData)

    const { data, error } = await (supabase
      .from('clients') as any)
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('[CREATE WELCOMEBOOK] Erreur création:', error)
      throw error
    }

    console.log('[CREATE WELCOMEBOOK] Welcomebook créé avec succès:', data)
    return { success: true, data }
  } catch (error: unknown) {
    console.error('Erreur dans createWelcomebookServerAction:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création du welcomebook'
    return { success: false, error: errorMessage }
  }
}
