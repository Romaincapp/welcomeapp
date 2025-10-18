import { createClient } from '@/lib/supabase/client'

/**
 * Crée automatiquement un welcomebook pour un nouvel utilisateur
 * Appelé après l'inscription
 */
export async function createWelcomebookForUser(userId: string, email: string) {
  const supabase = createClient()

  try {
    // Générer le slug à partir de l'email
    const baseName = email.split('@')[0]
    let slug = baseName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '')

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

    // Créer le welcomebook
    const { data, error } = await (supabase
      .from('clients') as any)
      .insert({
        name: 'Mon WelcomeBook',
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
