import { createClient } from '@/lib/supabase/client'

/**
 * Crée automatiquement un welcomebook pour un nouvel utilisateur
 * Appelé après l'inscription
 */
export async function createWelcomebookForUser(userId: string, email: string, propertyName?: string) {
  const supabase = createClient()

  try {
    // Générer le slug à partir du nom du logement (ou email si non fourni)
    const baseName = propertyName || email.split('@')[0]
    let slug = baseName
      .toLowerCase()
      .normalize('NFD') // Décomposer les caractères accentués
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9\s-]/g, '') // Supprimer les caractères spéciaux
      .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
      .replace(/^-+|-+$/g, '') // Supprimer les tirets au début/fin

    // Vérifier l'unicité du slug
    let counter = 0
    let uniqueSlug = slug

    while (true) {
      const { data: existing } = await (supabase
        .from('clients') as any)
        .select('id')
        .eq('slug', uniqueSlug)
        .single()

      if (!existing) break

      counter++
      uniqueSlug = `${slug}-${counter}`
    }

    // Créer le welcomebook avec le nom du logement
    const { data, error } = await (supabase
      .from('clients') as any)
      .insert({
        name: propertyName || 'Mon WelcomeBook',
        slug: uniqueSlug,
        email: email,
        header_color: '#4F46E5',
        footer_color: '#1E1B4B',
      })
      .select()
      .single()

    if (error) {
      console.error('Erreur création welcomebook:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Erreur dans createWelcomebookForUser:', error)
    throw error
  }
}
