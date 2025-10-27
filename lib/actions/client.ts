'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { ClientUpdate } from '@/types'

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
