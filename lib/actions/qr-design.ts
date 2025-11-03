'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { QRCodeDesignInsert, QRCodeDesignUpdate, QRCodeDesign } from '@/types'
import { revalidatePath } from 'next/cache'

/**
 * Sauvegarde ou met à jour un design de QR code
 * @param clientId - ID du client propriétaire
 * @param designData - Données du design
 * @param designId - ID du design (si mise à jour), undefined si création
 * @returns Success status et ID du design
 */
export async function saveQRCodeDesign(
  clientId: string,
  designData: Omit<QRCodeDesignInsert, 'client_id'>,
  designId?: string
) {
  const supabase = await createServerSupabaseClient()

  try {
    console.log('[SAVE QR DESIGN]', designId ? `Update ${designId}` : 'Create new')

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

    if (designId) {
      // Mise à jour d'un design existant
      // Vérifier que le design appartient au client
      const { data: existingDesign } = await (supabase
        .from('qr_code_designs') as any)
        .select('id, client_id')
        .eq('id', designId)
        .single()

      if (!existingDesign || existingDesign.client_id !== clientId) {
        throw new Error('Design non trouvé ou non autorisé')
      }

      const updateData: QRCodeDesignUpdate = {
        ...designData,
        updated_at: new Date().toISOString(),
      }

      const { error } = await (supabase
        .from('qr_code_designs') as any)
        .update(updateData)
        .eq('id', designId)

      if (error) {
        console.error('[SAVE QR DESIGN] Erreur update:', error)
        throw new Error(`Erreur lors de la mise à jour: ${error.message}`)
      }

      console.log('[SAVE QR DESIGN] Update succès ✅')
      revalidatePath('/dashboard')
      return { success: true, designId }
    } else {
      // Création d'un nouveau design
      const insertData: QRCodeDesignInsert = {
        ...designData,
        client_id: clientId,
      }

      const { data, error } = await (supabase
        .from('qr_code_designs') as any)
        .insert([insertData])
        .select('id')
        .single()

      if (error) {
        console.error('[SAVE QR DESIGN] Erreur insert:', error)
        throw new Error(`Erreur lors de la création: ${error.message}`)
      }

      console.log('[SAVE QR DESIGN] Create succès ✅')
      revalidatePath('/dashboard')
      return { success: true, designId: data.id }
    }
  } catch (error) {
    console.error('[SAVE QR DESIGN] Erreur catch:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    return { success: false, error: errorMessage }
  }
}

/**
 * Récupère tous les designs de QR code d'un client
 * @param clientId - ID du client
 * @returns Liste des designs (brouillons et finalisés)
 */
export async function getQRCodeDesigns(clientId: string) {
  const supabase = await createServerSupabaseClient()

  try {
    console.log('[GET QR DESIGNS] Client:', clientId)

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

    // Récupérer tous les designs du client, triés par date de modification
    const { data: designs, error } = await (supabase
      .from('qr_code_designs') as any)
      .select('*')
      .eq('client_id', clientId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('[GET QR DESIGNS] Erreur:', error)
      throw new Error(`Erreur lors de la récupération: ${error.message}`)
    }

    console.log('[GET QR DESIGNS] Succès, trouvé:', designs?.length || 0)
    return { success: true, designs: designs as QRCodeDesign[] }
  } catch (error) {
    console.error('[GET QR DESIGNS] Erreur catch:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    return { success: false, error: errorMessage, designs: [] }
  }
}

/**
 * Récupère un design de QR code spécifique
 * @param designId - ID du design
 * @param clientId - ID du client (pour vérification ownership)
 * @returns Design trouvé
 */
export async function getQRCodeDesignById(designId: string, clientId: string) {
  const supabase = await createServerSupabaseClient()

  try {
    console.log('[GET QR DESIGN] Design:', designId)

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

    // Récupérer le design
    const { data: design, error } = await (supabase
      .from('qr_code_designs') as any)
      .select('*')
      .eq('id', designId)
      .eq('client_id', clientId)
      .single()

    if (error) {
      console.error('[GET QR DESIGN] Erreur:', error)
      throw new Error(`Erreur lors de la récupération: ${error.message}`)
    }

    if (!design) {
      throw new Error('Design non trouvé')
    }

    console.log('[GET QR DESIGN] Succès ✅')
    return { success: true, design: design as QRCodeDesign }
  } catch (error) {
    console.error('[GET QR DESIGN] Erreur catch:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    return { success: false, error: errorMessage, design: null }
  }
}

/**
 * Supprime un design de QR code
 * @param designId - ID du design à supprimer
 * @param clientId - ID du client (pour vérification ownership)
 * @returns Success status
 */
export async function deleteQRCodeDesign(designId: string, clientId: string) {
  const supabase = await createServerSupabaseClient()

  try {
    console.log('[DELETE QR DESIGN] Design:', designId)

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

    // Vérifier que le design appartient au client
    const { data: existingDesign } = await (supabase
      .from('qr_code_designs') as any)
      .select('id, client_id')
      .eq('id', designId)
      .single()

    if (!existingDesign || existingDesign.client_id !== clientId) {
      throw new Error('Design non trouvé ou non autorisé')
    }

    // Supprimer le design
    const { error } = await (supabase
      .from('qr_code_designs') as any)
      .delete()
      .eq('id', designId)

    if (error) {
      console.error('[DELETE QR DESIGN] Erreur:', error)
      throw new Error(`Erreur lors de la suppression: ${error.message}`)
    }

    console.log('[DELETE QR DESIGN] Succès ✅')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('[DELETE QR DESIGN] Erreur catch:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    return { success: false, error: errorMessage }
  }
}
