'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
import { resetPassword } from '@/lib/actions/password-reset'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Vérifier que l'utilisateur a un token valide (session temporaire créée par Supabase)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setIsValidSession(false)
        setError('Lien invalide ou expiré. Veuillez redemander un lien de réinitialisation.')
      } else {
        setIsValidSession(true)
      }
    }

    checkSession()
  }, [supabase.auth])

  // Calculer la force du mot de passe
  const getPasswordStrength = (password: string): { label: string; color: string; percentage: number } => {
    if (password.length === 0) {
      return { label: '', color: 'bg-gray-300', percentage: 0 }
    }
    if (password.length < 6) {
      return { label: 'Trop court', color: 'bg-red-500', percentage: 25 }
    }
    if (password.length < 8) {
      return { label: 'Faible', color: 'bg-orange-500', percentage: 50 }
    }
    if (password.length < 12) {
      return { label: 'Moyen', color: 'bg-yellow-500', percentage: 75 }
    }
    return { label: 'Fort', color: 'bg-green-500', percentage: 100 }
  }

  const passwordStrength = getPasswordStrength(newPassword)
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validation côté client
      if (newPassword.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères')
        setLoading(false)
        return
      }

      if (newPassword !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas')
        setLoading(false)
        return
      }

      // Appeler la server action
      const result = await resetPassword(newPassword)

      if (!result.success) {
        setError(result.error || 'Une erreur est survenue')
      } else {
        setSuccess(true)
        // Rediriger vers le dashboard après 3 secondes
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      console.error('Erreur reset-password:', err)
    } finally {
      setLoading(false)
    }
  }

  // Loading initial
  if (isValidSession === null) {
    return <LoadingSpinner fullScreen />
  }

  // Lien invalide ou expiré
  if (isValidSession === false) {
    return (
      <>
        <div className="bg-fixed-mobile bg-gradient-to-br from-indigo-500 to-purple-600 -z-10" />
        <div className="min-h-screen flex items-center justify-center p-4 relative">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md force-light-theme">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Lien invalide ou expiré
              </h1>
              <p className="text-gray-600 text-sm">
                Ce lien de réinitialisation n'est plus valide. Les liens expirent après 1 heure pour des raisons de sécurité.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/forgot-password"
                className="block w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition text-center"
              >
                Demander un nouveau lien
              </Link>
              <Link
                href="/login"
                className="block w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition text-center"
              >
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Formulaire de reset
  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <>
      <div className="bg-fixed-mobile bg-gradient-to-br from-indigo-500 to-purple-600 -z-10" />
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md force-light-theme">
          {success ? (
            // Message de succès
            <div className="text-center space-y-6">
              <div className="text-5xl mb-4">✓</div>
              <h1 className="text-2xl font-bold text-gray-800">
                Mot de passe modifié !
              </h1>
              <div className="bg-green-50 text-green-800 p-4 rounded-lg text-sm border border-green-200">
                <p className="mb-2">
                  Votre mot de passe a été modifié avec succès.
                </p>
                <p className="text-xs text-green-700">
                  Un email de confirmation vous a été envoyé.
                </p>
              </div>
              <p className="text-gray-600 text-sm">
                Redirection vers le dashboard dans 3 secondes...
              </p>
              <Link
                href="/dashboard"
                className="inline-block bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Accéder au dashboard
              </Link>
            </div>
          ) : (
            // Formulaire
            <>
              <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
                Nouveau mot de passe
              </h1>
              <p className="text-center text-gray-600 text-sm mb-8">
                Choisissez un mot de passe sécurisé
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nouveau mot de passe */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-900 mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="••••••••"
                    disabled={loading}
                  />

                  {/* Indicateur de force */}
                  {newPassword.length > 0 && (
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">Force du mot de passe :</span>
                        <span className={`text-xs font-semibold ${
                          passwordStrength.label === 'Trop court' ? 'text-red-600' :
                          passwordStrength.label === 'Faible' ? 'text-orange-600' :
                          passwordStrength.label === 'Moyen' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`${passwordStrength.color} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${passwordStrength.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Minimum 6 caractères. Recommandé : 12+ caractères
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirmation mot de passe */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-2">
                    Confirmer le mot de passe
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="••••••••"
                    disabled={loading}
                  />

                  {/* Indicateur de correspondance */}
                  {confirmPassword.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      {passwordsMatch ? (
                        <>
                          <span className="text-green-600 text-sm">✓</span>
                          <span className="text-xs text-green-600 font-medium">Les mots de passe correspondent</span>
                        </>
                      ) : (
                        <>
                          <span className="text-red-600 text-sm">✗</span>
                          <span className="text-xs text-red-600 font-medium">Les mots de passe ne correspondent pas</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !passwordsMatch || newPassword.length < 6}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Modification en cours...' : 'Réinitialiser mon mot de passe'}
                </button>
              </form>

              <p className="mt-6 text-center text-gray-600 text-sm">
                <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                  ← Retour à la connexion
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  )
}
