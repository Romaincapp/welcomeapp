'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * Server Action pour créer un welcomebook
 * Utilise le client serveur pour éviter les problèmes de RLS
 */
export async function createWelcomebookServerAction(email: string, propertyName: string) {
  const supabase = await createServerSupabaseClient()

  try {
    console.log('[CREATE WELCOMEBOOK] Email:', email, 'PropertyName:', propertyName)

    // Vérifier que propertyName n'est pas vide
    if (!propertyName || propertyName.trim() === '') {
      throw new Error('Le nom du logement est requis')
    }

    // Vérifier que l'utilisateur est connecté
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.email !== email) {
      throw new Error('Non autorisé')
    }

    // Vérifier si un welcomebook existe déjà
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return { success: true, message: 'Welcomebook déjà existant' }
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
