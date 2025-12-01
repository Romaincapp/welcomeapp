import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import QRDesignerClient from './QRDesignerClient'
import type { Client } from '@/types'

export default async function QRDesignerPage() {
  const supabase = await createServerSupabaseClient()

  // Vérifier si l'utilisateur est connecté
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    redirect('/login')
  }

  // Récupérer le welcomebook sélectionné (support multi-welcomebook)
  const cookieStore = await cookies()
  const selectedWelcomebookId = cookieStore.get('selectedWelcomebookId')?.value

  let client: Client | null = null

  if (selectedWelcomebookId) {
    const { data: selectedClient } = await supabase
      .from('clients')
      .select('*')
      .eq('id', selectedWelcomebookId)
      .eq('email', user.email)
      .maybeSingle()

    if (selectedClient) {
      client = selectedClient as Client
    }
  }

  // Si pas de sélection ou welcomebook sélectionné introuvable, prendre le plus récent
  if (!client) {
    const { data: clientsData } = await supabase
      .from('clients')
      .select('*')
      .eq('email', user.email)
      .order('created_at', { ascending: false })
      .limit(1)

    if (clientsData && clientsData.length > 0) {
      client = clientsData[0] as Client
    }
  }

  // Si aucun welcomebook trouvé, rediriger vers onboarding
  if (!client) {
    redirect('/dashboard/welcome')
  }
  const subdomain = client.subdomain || client.slug
  const welcomebookUrl = `https://welcomeapp.be/${subdomain}`

  return <QRDesignerClient client={client} welcomebookUrl={welcomebookUrl} />
}
