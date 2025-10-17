'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { SecureSectionData } from '@/types'

/**
 * Vérifie si un code d'accès est correct pour une section sécurisée
 */
export async function verifySecureAccess(
  clientId: string,
  accessCode: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const supabase = await createServerSupabaseClient()

    // Récupérer la section sécurisée avec le hash du code
    const { data: secureSection, error } = await supabase
      .from('secure_sections')
      .select('access_code_hash')
      .eq('client_id', clientId)
      .single()

    if (error || !secureSection) {
      return {
        success: false,
        message: 'Aucune section sécurisée trouvée pour ce welcomebook',
      }
    }

    // Vérifier le code avec bcrypt
    const isValid = await bcrypt.compare(accessCode, secureSection.access_code_hash)

    if (!isValid) {
      return {
        success: false,
        message: 'Code d\'accès incorrect',
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error verifying secure access:', error)
    return {
      success: false,
      message: 'Erreur lors de la vérification du code',
    }
  }
}

/**
 * Récupère les données de la section sécurisée (uniquement pour le propriétaire)
 */
export async function getSecureSection(clientId: string) {
  try {
    const supabase = await createServerSupabaseClient()

    // Vérifier que l'utilisateur est authentifié et propriétaire
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Non authentifié')
    }

    // Vérifier que l'utilisateur est le propriétaire du client
    const { data: client } = await supabase
      .from('clients')
      .select('email')
      .eq('id', clientId)
      .single()

    if (!client || client.email !== user.email) {
      throw new Error('Non autorisé')
    }

    // Récupérer la section sécurisée
    const { data, error } = await supabase
      .from('secure_sections')
      .select('*')
      .eq('client_id', clientId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = not found, c'est normal si pas encore créé
      throw error
    }

    return data
  } catch (error) {
    console.error('Error fetching secure section:', error)
    return null
  }
}

/**
 * Récupère les données publiques de la section sécurisée (sans le hash)
 * après vérification du code
 */
export async function getSecureSectionPublic(clientId: string, accessCode: string) {
  try {
    // D'abord vérifier le code
    const verification = await verifySecureAccess(clientId, accessCode)

    if (!verification.success) {
      return { success: false, message: verification.message }
    }

    const supabase = await createServerSupabaseClient()

    // Récupérer les données (sans le hash du code)
    const { data, error } = await supabase
      .from('secure_sections')
      .select(`
        check_in_time,
        check_out_time,
        arrival_instructions,
        property_address,
        property_coordinates,
        wifi_ssid,
        wifi_password,
        parking_info,
        additional_info
      `)
      .eq('client_id', clientId)
      .single()

    if (error) {
      throw error
    }

    // Parser les coordonnées si présentes
    let propertyCoordinatesParsed = null
    if (data.property_coordinates) {
      try {
        propertyCoordinatesParsed =
          typeof data.property_coordinates === 'string'
            ? JSON.parse(data.property_coordinates)
            : data.property_coordinates
      } catch (e) {
        console.error('Error parsing property coordinates:', e)
      }
    }

    return {
      success: true,
      data: {
        ...data,
        property_coordinates_parsed: propertyCoordinatesParsed,
      },
    }
  } catch (error) {
    console.error('Error fetching secure section public:', error)
    return {
      success: false,
      message: 'Erreur lors de la récupération des données',
    }
  }
}

/**
 * Crée ou met à jour une section sécurisée (propriétaire uniquement)
 */
export async function upsertSecureSection(
  clientId: string,
  accessCode: string,
  data: SecureSectionData
): Promise<{ success: boolean; message?: string }> {
  try {
    const supabase = await createServerSupabaseClient()

    // Vérifier que l'utilisateur est authentifié et propriétaire
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'Non authentifié' }
    }

    // Vérifier que l'utilisateur est le propriétaire du client
    const { data: client } = await supabase
      .from('clients')
      .select('email')
      .eq('id', clientId)
      .single()

    if (!client || client.email !== user.email) {
      return { success: false, message: 'Non autorisé' }
    }

    // Vérifier si une section existe déjà
    const { data: existingSection } = await supabase
      .from('secure_sections')
      .select('access_code_hash')
      .eq('client_id', clientId)
      .single()

    // Déterminer le hash du code d'accès
    let accessCodeHash: string
    if (accessCode && accessCode !== 'UNCHANGED') {
      // Nouveau code fourni : on le hash
      accessCodeHash = await bcrypt.hash(accessCode, 10)
    } else if (existingSection) {
      // Pas de nouveau code et section existe : on garde l'ancien hash
      accessCodeHash = existingSection.access_code_hash
    } else {
      // Pas de nouveau code et pas de section existante : erreur
      return { success: false, message: 'Un code d\'accès est requis pour créer une section sécurisée' }
    }

    // Préparer les données pour la DB
    const dbData = {
      client_id: clientId,
      access_code_hash: accessCodeHash,
      check_in_time: data.checkInTime || null,
      check_out_time: data.checkOutTime || null,
      arrival_instructions: data.arrivalInstructions || null,
      property_address: data.propertyAddress || null,
      property_coordinates: data.propertyCoordinates
        ? JSON.stringify(data.propertyCoordinates)
        : null,
      wifi_ssid: data.wifiSsid || null,
      wifi_password: data.wifiPassword || null,
      parking_info: data.parkingInfo || null,
      additional_info: data.additionalInfo || null,
    }

    // Upsert (créer ou mettre à jour)
    const { error } = await supabase
      .from('secure_sections')
      .upsert(dbData, {
        onConflict: 'client_id',
      })

    if (error) {
      throw error
    }

    // Revalider la page du client
    const { data: clientData } = await supabase
      .from('clients')
      .select('slug')
      .eq('id', clientId)
      .single()

    if (clientData?.slug) {
      revalidatePath(`/${clientData.slug}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Error upserting secure section:', error)
    return {
      success: false,
      message: 'Erreur lors de la sauvegarde de la section sécurisée',
    }
  }
}

/**
 * Supprime une section sécurisée (propriétaire uniquement)
 */
export async function deleteSecureSection(
  clientId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const supabase = await createServerSupabaseClient()

    // Vérifier que l'utilisateur est authentifié et propriétaire
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'Non authentifié' }
    }

    // Vérifier que l'utilisateur est le propriétaire du client
    const { data: client } = await supabase
      .from('clients')
      .select('email, slug')
      .eq('id', clientId)
      .single()

    if (!client || client.email !== user.email) {
      return { success: false, message: 'Non autorisé' }
    }

    // Supprimer la section sécurisée
    const { error } = await supabase
      .from('secure_sections')
      .delete()
      .eq('client_id', clientId)

    if (error) {
      throw error
    }

    // Revalider la page du client
    if (client.slug) {
      revalidatePath(`/${client.slug}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting secure section:', error)
    return {
      success: false,
      message: 'Erreur lors de la suppression de la section sécurisée',
    }
  }
}
