'use server'

/**
 * Server actions pour la modération (admin)
 * Actions de suppression et gestion des comptes
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { revalidatePath } from 'next/cache'
import { sendAccountDeletedNotification } from '@/lib/actions/email/sendAccountDeletedNotification'

// =============================================================================
// SERVER ACTIONS - MODÉRATION
// =============================================================================

/**
 * Supprime un gestionnaire et toutes ses données (CASCADE)
 * Supprime : client, tips, tip_media, secure_sections, qr_code_designs, analytics_events
 */
export async function deleteManager(clientId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Vérifier que l'utilisateur est admin
    await requireAdmin()

    const supabase = await createServerSupabaseClient()

    // Récupérer le client pour vérifier qu'il existe et collecter les données pour la notification
    const { data: client, error: clientError } = await (supabase
      .from('clients') as any)
      .select('id, email, name, slug, welcomebook_name')
      .eq('id', clientId)
      .maybeSingle()

    if (clientError || !client) {
      return { success: false, error: 'Client introuvable' }
    }

    // Compter le nombre de welcomebooks (devrait toujours être 1, mais pour info)
    const { count: welcomebookCount } = await supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('id', clientId)

    console.log(`[ADMIN MODERATION] Deleting manager ${client.email} (${clientId})`)

    // Supprimer le client (CASCADE va supprimer tips, tip_media, etc.)
    const { error: deleteError } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId)

    if (deleteError) {
      console.error('[ADMIN MODERATION] Error deleting manager:', deleteError)
      return { success: false, error: deleteError.message }
    }

    // Envoyer la notification email à contact@welcomeapp.be
    try {
      await sendAccountDeletedNotification({
        managerName: client.name || client.welcomebook_name || 'Gestionnaire inconnu',
        managerEmail: client.email,
        slug: client.slug,
        welcomebookCount: welcomebookCount || 1,
      })
      console.log(`[ADMIN MODERATION] Notification email sent for ${client.email}`)
    } catch (emailError) {
      // Ne pas bloquer le retour si l'email échoue (suppression déjà effectuée)
      console.error('[ADMIN MODERATION] Failed to send notification email:', emailError)
    }

    // Revalider le cache
    revalidatePath('/admin/managers')
    revalidatePath('/admin')

    console.log(`[ADMIN MODERATION] Manager ${client.email} deleted successfully`)

    return { success: true }
  } catch (error) {
    console.error('[ADMIN MODERATION] Error:', error)
    return { success: false, error: 'Erreur lors de la suppression' }
  }
}

/**
 * Supprime un tip spécifique (modération de contenu)
 */
export async function deleteTip(tipId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Vérifier que l'utilisateur est admin
    await requireAdmin()

    const supabase = await createServerSupabaseClient()

    // Vérifier que le tip existe
    const { data: tip, error: tipError } = await (supabase
      .from('tips') as any)
      .select('id, title_en, client_id')
      .eq('id', tipId)
      .maybeSingle()

    if (tipError || !tip) {
      return { success: false, error: 'Tip introuvable' }
    }

    console.log(`[ADMIN MODERATION] Deleting tip ${tip.title_en} (${tipId})`)

    // Supprimer le tip (CASCADE va supprimer tip_media)
    const { error: deleteError } = await supabase
      .from('tips')
      .delete()
      .eq('id', tipId)

    if (deleteError) {
      console.error('[ADMIN MODERATION] Error deleting tip:', deleteError)
      return { success: false, error: deleteError.message }
    }

    // Revalider le cache
    revalidatePath(`/admin/managers/${tip.client_id}`)
    revalidatePath('/admin/managers')

    console.log(`[ADMIN MODERATION] Tip ${tip.title_en} deleted successfully`)

    return { success: true }
  } catch (error) {
    console.error('[ADMIN MODERATION] Error:', error)
    return { success: false, error: 'Erreur lors de la suppression' }
  }
}

/**
 * Supprime tous les tips d'un gestionnaire (modération de contenu)
 */
export async function deleteAllManagerTips(clientId: string): Promise<{ success: boolean; error?: string; deletedCount?: number }> {
  try {
    // Vérifier que l'utilisateur est admin
    await requireAdmin()

    const supabase = await createServerSupabaseClient()

    // Compter les tips avant suppression
    const { count } = await supabase
      .from('tips')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', clientId)

    console.log(`[ADMIN MODERATION] Deleting ${count || 0} tips for client ${clientId}`)

    // Supprimer tous les tips
    const { error: deleteError } = await supabase
      .from('tips')
      .delete()
      .eq('client_id', clientId)

    if (deleteError) {
      console.error('[ADMIN MODERATION] Error deleting tips:', deleteError)
      return { success: false, error: deleteError.message }
    }

    // Revalider le cache
    revalidatePath(`/admin/managers/${clientId}`)
    revalidatePath('/admin/managers')

    console.log(`[ADMIN MODERATION] ${count || 0} tips deleted successfully`)

    return { success: true, deletedCount: count || 0 }
  } catch (error) {
    console.error('[ADMIN MODERATION] Error:', error)
    return { success: false, error: 'Erreur lors de la suppression' }
  }
}
