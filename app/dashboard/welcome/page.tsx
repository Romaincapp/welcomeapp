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
  const { data: clientData, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('email', user.email)
    .maybeSingle()

  console.log('[DASHBOARD WELCOME] clientData:', clientData, 'error:', clientError)

  // Si pas de welcomebook, on reste sur cette page
  // (l'utilisateur peut créer son welcomebook via cette page d'onboarding)
  if (!clientData) {
    console.log('[DASHBOARD WELCOME] Pas de client trouvé - Affichage message création')
    // Afficher un message d'erreur au lieu de boucler
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Erreur</h1>
          <p className="text-gray-700 mb-4">
            Aucun welcomebook trouvé pour {user.email}.
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Veuillez réessayer de créer votre compte ou contactez le support.
          </p>
          <a
            href="/signup"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-block"
          >
            Retour au signup
          </a>
        </div>
      </div>
    )
  }

  const client: Client = clientData as Client

  return <WelcomeOnboarding client={client} user={user} />
}
