'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createWelcomebookServerAction, checkEmailExists } from '@/lib/actions/create-welcomebook'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function SignUpPage() {
  const [propertyName, setPropertyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Protection ULTRA stricte contre les doubles soumissions avec useRef
  const isSubmittingRef = useRef(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    const timestamp = Date.now()
    console.log(`[SIGNUP ${timestamp}] 🚀 Début handleSignUp`)

    // Protection ULTRA stricte - vérifier le ref en premier
    if (isSubmittingRef.current) {
      console.log(`[SIGNUP ${timestamp}] ❌ BLOQUÉ - Soumission déjà en cours`)
      return
    }

    // Protection contre les états
    if (loading || success) {
      console.log(`[SIGNUP ${timestamp}] ❌ BLOQUÉ - État invalide (loading=${loading}, success=${success})`)
      return
    }

    // Verrouiller IMMÉDIATEMENT avec le ref
    isSubmittingRef.current = true
    console.log(`[SIGNUP ${timestamp}] 🔒 Verrouillage activé`)

    setLoading(true)
    setError(null)

    try {
      // ========================================
      // ÉTAPE 1: Vérifier si l'email existe déjà AVANT auth.signUp()
      // ========================================
      console.log(`[SIGNUP ${timestamp}] 📧 Vérification existence email: ${email}`)
      const emailCheck = await checkEmailExists(email)

      if (emailCheck.exists) {
        console.log(`[SIGNUP ${timestamp}] ❌ Email existe déjà (slug: ${emailCheck.slug})`)
        throw new Error(`Un compte existe déjà avec cet email${emailCheck.slug ? ` (${emailCheck.slug})` : ''}. Utilisez le bouton "Se connecter".`)
      }
      console.log(`[SIGNUP ${timestamp}] ✅ Email disponible`)

      // ========================================
      // ÉTAPE 2: Créer le compte Auth Supabase
      // ========================================
      console.log(`[SIGNUP ${timestamp}] 🔐 Création compte Auth...`)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard/welcome`,
        },
      })

      if (error) {
        console.log(`[SIGNUP ${timestamp}] ❌ Erreur Auth:`, error.message)
        throw error
      }

      if (!data.user) {
        console.log(`[SIGNUP ${timestamp}] ❌ Aucun user retourné par signUp`)
        throw new Error('Erreur lors de la création du compte')
      }

      console.log(`[SIGNUP ${timestamp}] ✅ User Auth créé (id: ${data.user.id})`)

      // ========================================
      // ÉTAPE 3: Attendre que la session soit synchronisée côté serveur
      // IMPORTANT: Sans ce délai, createWelcomebookServerAction peut échouer
      // car la session n'est pas encore disponible côté serveur
      // ========================================
      console.log(`[SIGNUP ${timestamp}] ⏳ Attente synchronisation session (1.5s)...`)
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log(`[SIGNUP ${timestamp}] ✅ Session synchronisée`)

      // ========================================
      // ÉTAPE 4: Créer le welcomebook (Server Action)
      // ========================================
      console.log(`[SIGNUP ${timestamp}] 🏠 Création welcomebook...`)
      console.log(`[SIGNUP ${timestamp}] → Email: ${email}, PropertyName: "${propertyName}", UserId: ${data.user.id}`)

      const result = await createWelcomebookServerAction(email, propertyName, data.user.id)

      console.log(`[SIGNUP ${timestamp}] → Résultat:`, JSON.stringify(result))

      if (!result.success) {
        console.log(`[SIGNUP ${timestamp}] ❌ Erreur creation welcomebook: ${result.error}`)
        throw new Error(result.error || 'Erreur lors de la création du welcomebook')
      }

      console.log(`[SIGNUP ${timestamp}] ✅ Welcomebook créé avec succès!`)

      // ========================================
      // ÉTAPE 5: Succès - Redirection vers onboarding
      // ========================================
      setSuccess(true)
      setTimeout(() => {
        console.log(`[SIGNUP ${timestamp}] 🚀 Redirection vers /dashboard/welcome`)
        router.push('/dashboard/welcome')
      }, 1500)

    } catch (err: any) {
      console.log(`[SIGNUP ${timestamp}] ❌ ERREUR CATCH:`, err.message)
      setError(err.message || 'Erreur lors de la création du compte')
      setLoading(false)
      // Déverrouiller le ref en cas d'erreur pour permettre de réessayer
      isSubmittingRef.current = false
      console.log(`[SIGNUP ${timestamp}] 🔓 Verrouillage désactivé (erreur)`)
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <>
      <div className="bg-fixed-mobile bg-gradient-to-br from-indigo-500 to-purple-600 -z-10" />
      <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Créer un compte gestionnaire</h1>

        {success ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            <p className="font-semibold mb-2">✅ Compte créé avec succès !</p>
            <p className="text-sm">Démarrage de l'onboarding...</p>
          </div>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-4">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Villa des Lilas"
              />
              <p className="text-xs text-gray-600 mt-1">
                Votre URL sera : <strong className="text-indigo-600">welcomeapp.be/{propertyName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/^-+|-+$/g, '') || 'votre-slug'}</strong>
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-900">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="contact@exemple.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-900">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-700 mt-1">Minimum 6 caractères</p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Création du compte...' : 'Créer mon compte'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Vous avez déjà un compte ?{' '}
            <Link href="/login" className="text-indigo-600 hover:underline font-semibold">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
      </div>
    </>
  )
}
