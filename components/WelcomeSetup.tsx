'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Loader2, Sparkles } from 'lucide-react'
import { createWelcomebookForUser } from '@/lib/create-welcomebook'

interface WelcomeSetupProps {
  user: User
}

export default function WelcomeSetup({ user }: WelcomeSetupProps) {
  const [propertyName, setPropertyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleCreateWelcomebook = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!propertyName.trim()) {
      setError('Veuillez entrer le nom de votre logement')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Créer le welcomebook avec le nom du logement
      await createWelcomebookForUser(user.id, user.email!, propertyName)

      // Rafraîchir la page pour recharger les données
      router.refresh()
    } catch (err: any) {
      console.error('❌ Erreur création welcomebook:', err)
      setError(err.message || 'Erreur lors de la création du welcomebook')
      setLoading(false)
    }
  }

  return (
    <>
      <div className="bg-fixed-mobile bg-gradient-to-br from-indigo-500 to-purple-600 -z-10" />
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
          <div className="text-center mb-6">
            <div className="inline-block p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mb-4">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Créons votre WelcomeApp !
            </h1>
            <p className="text-gray-700">
              Dernière étape : donnez un nom à votre logement
            </p>
          </div>

          <form onSubmit={handleCreateWelcomebook} className="space-y-4">
            <div>
              <label htmlFor="propertyName" className="block text-sm font-medium mb-2 text-gray-900">
                Nom de votre logement
              </label>
              <input
                id="propertyName"
                type="text"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                required
                autoFocus
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-gray-900"
                placeholder="Villa des Lilas"
              />
              <p className="text-xs text-gray-600 mt-1">
                Votre URL sera : <strong className="text-indigo-600">welcomeapp.be/{propertyName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/^-+|-+$/g, '') || 'votre-slug'}</strong>
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !propertyName.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Créer mon WelcomeApp
                </>
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 mb-2">
              Ce qui sera créé :
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Votre espace WelcomeApp personnel</li>
              <li>• Une URL unique : welcomeapp.be/[votre-slug]</li>
              <li>• Un QR code pour vos clients</li>
              <li>• Des couleurs par défaut (modifiables)</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
