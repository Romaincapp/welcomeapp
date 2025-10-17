import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import WelcomeBookClient from './WelcomeBookClient'
import { TipWithDetails, ClientWithDetails, Coordinates, OpeningHours, ContactSocial, Client } from '@/types'

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

  const clientWithDetails: ClientWithDetails = {
    ...client,
    footer_buttons: footerButtons || [],
    tips: tipsWithDetails,
    categories: categories || [],
  }

  return <WelcomeBookClient client={clientWithDetails} isOwner={isOwner} />
}
