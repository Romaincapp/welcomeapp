import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import WelcomeBookClient from './WelcomeBookClient'
import { TipWithDetails, ClientWithDetails, Coordinates, OpeningHours, ContactSocial, Client, Tip, TipMedia, SecureSection, SecureSectionWithDetails } from '@/types'

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
  const tipsWithDetails: TipWithDetails[] = (tips || []).map((tip) => {
    const tipData = tip as unknown as Tip & { media?: unknown[]; category?: unknown }
    return {
      ...tipData,
      media: (tipData.media || []) as TipMedia[],
      coordinates_parsed: tipData.coordinates ? (tipData.coordinates as unknown as Coordinates) : undefined,
      opening_hours_parsed: tipData.opening_hours ? (tipData.opening_hours as unknown as OpeningHours) : undefined,
      contact_social_parsed: tipData.contact_social ? (tipData.contact_social as unknown as ContactSocial) : undefined,
      reviews_parsed: tipData.reviews ? (tipData.reviews as unknown as Array<any>) : undefined,
    } as TipWithDetails
  })

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
      const sectionData = secureSectionData as unknown as SecureSection
      secureSection = {
        ...sectionData,
        property_coordinates_parsed: sectionData.property_coordinates
          ? (sectionData.property_coordinates as unknown as Coordinates)
          : undefined,
      } as SecureSectionWithDetails
    }
  } else {
    // Pour les visiteurs, on vérifie juste l'existence (sans récupérer les données)
    const { data: exists } = await supabase
      .from('secure_sections')
      .select('id')
      .eq('client_id', client.id)
      .single()

    if (exists) {
      const existsData = exists as { id: string }
      // On crée un objet minimal pour indiquer qu'une section existe
      secureSection = {
        id: existsData.id,
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
        created_at: '',
        updated_at: '',
      } as SecureSectionWithDetails
    }
  }

  const clientWithDetails: ClientWithDetails = {
    ...client,
    tips: tipsWithDetails,
    categories: categories || [],
    secure_section: secureSection,
  }

  return <WelcomeBookClient client={clientWithDetails} isOwner={isOwner} />
}
