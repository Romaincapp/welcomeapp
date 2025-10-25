'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Supprime tous les fichiers du storage pour un client donné
 */
async function deleteClientStorageFiles(supabase: any, clientId: string, slug: string) {
  try {
    console.log(`[STORAGE] Liste des fichiers pour le slug: ${slug}`)
    // Liste tous les fichiers dans le dossier du client
    const { data: files, error: listError } = await supabase
      .storage
      .from('media')
      .list(slug, {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' }
      })

    if (listError) {
      console.error('[STORAGE] Erreur lors de la liste des fichiers:', listError)
      throw new Error(`Impossible de lister les fichiers: ${listError.message}`)
    }

    console.log(`[STORAGE] ${files?.length || 0} fichier(s) trouvé(s)`)

    if (files && files.length > 0) {
      // Supprimer tous les fichiers
      const filePaths = files.map((file: any) => `${slug}/${file.name}`)
      console.log('[STORAGE] Suppression de:', filePaths)

      const { error: deleteError } = await supabase
        .storage
        .from('media')
        .remove(filePaths)

      if (deleteError) {
        console.error('[STORAGE] Erreur lors de la suppression des fichiers:', deleteError)
        throw new Error(`Impossible de supprimer les fichiers: ${deleteError.message}`)
      }

      console.log('[STORAGE] Tous les fichiers ont été supprimés avec succès')
    }
  } catch (error) {
    console.error('[STORAGE] Erreur lors du nettoyage du storage:', error)
    throw error
  }
}

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
    .select('email, slug')
    .eq('id', clientId)
    .single()

  if (!client || client.email !== user.email) {
    throw new Error('Non autorisé')
  }

  // Supprimer tous les fichiers du storage
  await deleteClientStorageFiles(supabase, clientId, client.slug)

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
  try {
    console.log('[DELETE] Début de la suppression du compte')
    const supabase = await createServerSupabaseClient()

    // Vérifier que l'utilisateur est authentifié
    console.log('[DELETE] Vérification de l\'authentification...')
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error('[DELETE] Erreur getUser:', userError)
      throw new Error(`Erreur d'authentification: ${userError.message}`)
    }
    if (!user) {
      console.error('[DELETE] Utilisateur non authentifié')
      throw new Error('Non authentifié')
    }
    console.log('[DELETE] Utilisateur authentifié:', user.id, user.email)

    // Récupérer le client associé à cet email
    console.log('[DELETE] Récupération du client pour l\'email:', user.email)
    const { data: client, error: clientError } = await (supabase
      .from('clients') as any)
      .select('id, slug')
      .eq('email', user.email)
      .single()

    if (clientError) {
      console.error('[DELETE] Erreur lors de la récupération du client:', clientError)
      // Si pas de client, ce n'est pas bloquant - on continue pour supprimer l'auth
    }

    if (client) {
      console.log('[DELETE] Client trouvé:', client.id, client.slug)

      // 1. SUPPRIMER TOUS LES FICHIERS DU STORAGE
      console.log('[DELETE] Suppression des fichiers du storage...')
      try {
        await deleteClientStorageFiles(supabase, client.id, client.slug)
        console.log('[DELETE] Fichiers du storage supprimés avec succès')
      } catch (storageError) {
        console.error('[DELETE] Erreur lors de la suppression du storage:', storageError)
        // On continue même si le storage échoue
      }

      // 2. Supprimer le client (tout sera supprimé en cascade grâce aux ON DELETE CASCADE)
      console.log('[DELETE] Suppression du client de la base de données...')
      const { error: deleteError } = await (supabase
        .from('clients') as any)
        .delete()
        .eq('id', client.id)

      if (deleteError) {
        console.error('[DELETE] Erreur lors de la suppression du client:', deleteError)
        throw new Error(`Erreur lors de la suppression du welcomebook: ${deleteError.message}`)
      }
      console.log('[DELETE] Client supprimé avec succès')
    } else {
      console.log('[DELETE] Aucun client trouvé pour cet utilisateur')
    }

    // 3. Déconnexion (on ne peut pas supprimer l'utilisateur Auth sans service role key)
    console.log('[DELETE] Déconnexion de l\'utilisateur...')
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) {
      console.error('[DELETE] Erreur lors de la déconnexion:', signOutError)
    }

    console.log('[DELETE] Suppression terminée avec succès')
    return { success: true }
  } catch (error) {
    console.error('[DELETE] Erreur globale:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Erreur inconnue lors de la suppression du compte')
  }
}
