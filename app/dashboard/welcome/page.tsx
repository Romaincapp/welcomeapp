import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import WelcomeOnboarding from '@/components/WelcomeOnboarding'
import { Client } from '@/types'

export default async function WelcomePage() {
  const supabase = await createServerSupabaseClient()

  // Vérifier si l'utilisateur est connecté
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    redirect('/login')
  }

  // Récupérer le welcomebook de l'utilisateur
  const { data: clientData } = await supabase
    .from('clients')
    .select('*')
    .eq('email', user.email)
    .single()

  // Si pas de welcomebook, rediriger vers la page de setup
  if (!clientData) {
    redirect('/dashboard/setup')
  }

  const client: Client = clientData as Client

  return <WelcomeOnboarding client={client} user={user} />
}
