import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import WelcomeBookClient from './WelcomeBookClient'
import { TipWithDetails, ClientWithDetails, Coordinates, OpeningHours, ContactSocial, Client, SecureSectionWithDetails } from '@/types'

export default async function WelcomeBookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()

  // Vérifier si l'utilisateur est connecté
  const { data: { user } } = await supabase.auth.getUser()

  // Récupérer le client
  const { data: clientData, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('slug', slug)
    .single()

  if (clientError || !clientData) {
    notFound()
  }

  const client: Client = clientData as Client

  // Vérifier si l'utilisateur connecté est le propriétaire de ce welcomebook
  const isOwner = !!(user && client.email === user.email)

  // Récupérer les boutons du footer
  const { data: footerButtons } = await supabase
    .from('footer_buttons')
    .select('*')
    .eq('client_id', client.id)
    .order('order')

  // Récupérer les catégories (triées par order)
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('order', { ascending: true })

  // Récupérer les conseils avec leurs médias (triés par order)
  const { data: tips } = await supabase
    .from('tips')
    .select(`
      *,
      category:categories(*),
      media:tip_media(*)
    `)
    .eq('client_id', client.id)
    .order('order', { ascending: true })

  // Parser les données JSON
  const tipsWithDetails: TipWithDetails[] = (tips || []).map((tip: any) => ({
    ...tip,
    media: tip.media || [],
    coordinates_parsed: tip.coordinates ? (tip.coordinates as Coordinates) : undefined,
    opening_hours_parsed: tip.opening_hours ? (tip.opening_hours as OpeningHours) : undefined,
    contact_social_parsed: tip.contact_social ? (tip.contact_social as ContactSocial) : undefined,
  }))

  // Récupérer la section sécurisée (uniquement pour vérifier son existence, pas les détails)
  let secureSection: SecureSectionWithDetails | null = null
  if (isOwner) {
    // Si c'est le propriétaire, on récupère toutes les données (sauf le hash du code)
    const { data: secureSectionData } = await supabase
      .from('secure_sections')
      .select('*')
      .eq('client_id', client.id)
      .single()

    if (secureSectionData) {
      const typedData = secureSectionData as any
      secureSection = {
        id: typedData.id,
        client_id: typedData.client_id,
        access_code_hash: typedData.access_code_hash,
        check_in_time: typedData.check_in_time,
        check_out_time: typedData.check_out_time,
        arrival_instructions: typedData.arrival_instructions,
        property_address: typedData.property_address,
        wifi_ssid: typedData.wifi_ssid,
        wifi_password: typedData.wifi_password,
        parking_info: typedData.parking_info,
        additional_info: typedData.additional_info,
        created_at: typedData.created_at,
        updated_at: typedData.updated_at,
        property_coordinates_parsed: typedData.property_coordinates
          ? (typedData.property_coordinates as Coordinates)
          : undefined,
      } as any
    }
  } else {
    // Pour les visiteurs, on vérifie juste l'existence (sans récupérer les données)
    const { data: exists } = await supabase
      .from('secure_sections')
      .select('id')
      .eq('client_id', client.id)
      .single()

    if (exists) {
      const typedExists = exists as any
      // On crée un objet minimal pour indiquer qu'une section existe
      secureSection = {
        id: typedExists.id,
        client_id: client.id,
        access_code_hash: '',
        check_in_time: null,
        check_out_time: null,
        arrival_instructions: null,
        property_address: null,
        wifi_ssid: null,
        wifi_password: null,
        parking_info: null,
        additional_info: null,
        created_at: null,
        updated_at: null,
      } as any
    }
  }

  const clientWithDetails: ClientWithDetails = {
    ...client,
    footer_buttons: footerButtons || [],
    tips: tipsWithDetails,
    categories: categories || [],
    secure_section: secureSection,
  }

  return <WelcomeBookClient client={clientWithDetails} isOwner={isOwner} />
}
