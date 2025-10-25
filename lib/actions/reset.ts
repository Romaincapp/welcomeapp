'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Supprime tous les conseils (tips) et leurs médias d'un client
 */
export async function resetWelcomebook(clientId: string) {
  const supabase = await createServerSupabaseClient()

  // Vérifier que l'utilisateur est authentifié et propriétaire
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Non authentifié')
  }

  // Vérifier que le client appartient à l'utilisateur
  const { data: client } = await (supabase
    .from('clients') as any)
    .select('email')
    .eq('id', clientId)
    .single()

  if (!client || client.email !== user.email) {
    throw new Error('Non autorisé')
  }

  // Supprimer tous les tips (les médias seront supprimés en cascade)
  const { error: tipsError } = await (supabase
    .from('tips') as any)
    .delete()
    .eq('client_id', clientId)

  if (tipsError) {
    throw new Error('Erreur lors de la suppression des conseils')
  }

  // Supprimer la section sécurisée si elle existe
  await (supabase
    .from('secure_sections') as any)
    .delete()
    .eq('client_id', clientId)

  // Réinitialiser l'image de fond et les couleurs aux valeurs par défaut
  const { error: clientError } = await (supabase
    .from('clients') as any)
    .update({
      background_image: null,
      header_color: '#4F46E5',
      footer_color: '#1E1B4B',
      header_subtitle: 'Bienvenue dans votre guide personnalisé',
      ad_iframe_url: null,
    })
    .eq('id', clientId)

  if (clientError) {
    throw new Error('Erreur lors de la réinitialisation du client')
  }

  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Supprime complètement le compte utilisateur et son welcomebook
 */
export async function deleteAccount() {
  const supabase = await createServerSupabaseClient()

  // Vérifier que l'utilisateur est authentifié
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Non authentifié')
  }

  // Récupérer le client associé à cet email
  const { data: client } = await (supabase
    .from('clients') as any)
    .select('id, slug')
    .eq('email', user.email)
    .single()

  if (client) {
    // Supprimer le client (tout sera supprimé en cascade grâce aux ON DELETE CASCADE)
    const { error: deleteError } = await (supabase
      .from('clients') as any)
      .delete()
      .eq('id', client.id)

    if (deleteError) {
      throw new Error('Erreur lors de la suppression du welcomebook')
    }
  }

  // Supprimer le compte utilisateur Supabase Auth
  const { error: authError } = await supabase.auth.admin.deleteUser(user.id)

  if (authError) {
    // Si l'erreur est liée aux permissions admin, on se déconnecte simplement
    // L'utilisateur devra contacter un admin pour supprimer son compte Auth
    await supabase.auth.signOut()
    throw new Error('Compte partiellement supprimé. Contactez le support pour finaliser.')
  }

  // Déconnexion
  await supabase.auth.signOut()

  return { success: true }
}
