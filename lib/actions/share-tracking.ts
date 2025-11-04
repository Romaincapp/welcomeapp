'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Marque qu'un gestionnaire a effectué une action de partage (copie lien ou téléchargement QR code)
 * Cette action est idempotente : elle peut être appelée plusieurs fois sans effet de bord
 * Utilisé pour cocher automatiquement la tâche "Partager" dans la checklist du dashboard
 *
 * @param clientId - ID du client (welcomebook)
 * @returns Success status et message
 */
export async function markAsShared(clientId: string): Promise<{ success: boolean; message: string }> {
  const supabase = await createServerSupabaseClient()

  try {
    console.log('[MARK AS SHARED]', clientId)

    // Vérifier que l'utilisateur est authentifié
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Non authentifié')
    }

    // Vérifier que le client appartient à l'utilisateur
    const { data: client } = await (supabase
      .from('clients') as any)
      .select('id, email, has_shared')
      .eq('id', clientId)
      .maybeSingle()

    if (!client) {
      throw new Error('Client non trouvé')
    }

    if (client.email !== user.email) {
      throw new Error('Non autorisé')
    }

    // Si déjà marqué comme partagé, pas besoin de mettre à jour (idempotence)
    if (client.has_shared) {
      console.log('[MARK AS SHARED] Déjà marqué comme partagé')
      return { success: true, message: 'Déjà marqué comme partagé' }
    }

    // Mettre à jour has_shared à true
    const { error: updateError } = await (supabase
      .from('clients') as any)
      .update({ has_shared: true })
      .eq('id', clientId)

    if (updateError) {
      throw updateError
    }

    console.log('[MARK AS SHARED] Client marqué comme partagé avec succès')

    // Revalider le dashboard pour afficher la checklist mise à jour
    revalidatePath('/dashboard')

    return { success: true, message: 'Marqué comme partagé avec succès' }

  } catch (error: unknown) {
    console.error('[MARK AS SHARED] Erreur:', error)

    if (error instanceof Error) {
      return { success: false, message: error.message }
    }

    return { success: false, message: 'Erreur inconnue lors du marquage du partage' }
  }
}
