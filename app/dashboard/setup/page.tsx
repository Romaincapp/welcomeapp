'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Sparkles } from 'lucide-react'

export default function SetupWelcomebookPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleCreateWelcomebook = async () => {
    console.log('🚀 Début de la création du welcomebook')
    setLoading(true)
    setError(null)

    try {
      // Récupérer l'utilisateur actuel
      console.log('📝 Récupération de l\'utilisateur...')
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Vous devez être connecté')
      }

      console.log('✅ Utilisateur récupéré:', user.email)

      // Appeler l'API pour créer le welcomebook (avec service_role)
      console.log('🌐 Appel API create-welcomebook...')
      const response = await fetch('/api/create-welcomebook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
        }),
      })

      console.log('📡 Réponse API reçue:', response.status)
      const result = await response.json()
      console.log('📦 Données reçues:', result)

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la création')
      }

      // Rediriger vers le dashboard
      console.log('🔄 Redirection vers le dashboard...')
      router.push('/dashboard')
      router.refresh()

    } catch (err: any) {
      console.error('❌ Erreur complète:', err)
      setError(err.message || 'Erreur lors de la création du welcomebook')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-block p-4 bg-indigo-100 rounded-full mb-4">
            <Sparkles className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Créons votre WelcomeBook !
          </h1>
          <p className="text-gray-600">
            Cliquez sur le bouton ci-dessous pour initialiser votre espace personnel
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleCreateWelcomebook}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Création en cours...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Créer mon WelcomeBook
            </>
          )}
        </button>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Ce qui sera créé :</strong>
          </p>
          <ul className="text-sm text-blue-700 mt-2 space-y-1">
            <li>• Votre espace WelcomeBook personnel</li>
            <li>• Une URL unique pour partager</li>
            <li>• Un QR code pour vos clients</li>
            <li>• Des couleurs par défaut (modifiables)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
