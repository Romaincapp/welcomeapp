'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
import { requestPasswordReset, checkPasswordResetCooldown } from '@/lib/actions/password-reset'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const router = useRouter()

  // Formater le temps restant en minutes/secondes
  const formatCooldown = (seconds: number): string => {
    if (seconds >= 3600) {
      const hours = Math.ceil(seconds / 3600)
      return `${hours} heure${hours > 1 ? 's' : ''}`
    }
    const minutes = Math.ceil(seconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // 1. Vérifier le rate limit avant d'envoyer
      const cooldownStatus = await checkPasswordResetCooldown(email)

      if (!cooldownStatus.canReset) {
        setCooldownSeconds(cooldownStatus.secondsRemaining)
        setError(`Trop de tentatives. Veuillez réessayer dans ${formatCooldown(cooldownStatus.secondsRemaining)}.`)
        setLoading(false)
        return
      }

      // 2. Demander le reset
      const result = await requestPasswordReset(email)

      if (!result.success) {
        setError(result.error || 'Une erreur est survenue')
        if (result.secondsRemaining) {
          setCooldownSeconds(result.secondsRemaining)
        }
      } else {
        setSuccess(true)
        // Réinitialiser le formulaire
        setEmail('')
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      console.error('Erreur forgot-password:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <>
      <div className="bg-fixed-mobile bg-gradient-to-br from-indigo-500 to-purple-600 -z-10" />
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md force-light-theme">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
            Mot de passe oublié ?
          </h1>
          <p className="text-center text-gray-600 text-sm mb-8">
            Saisissez votre email pour recevoir un lien de réinitialisation
          </p>

          {success ? (
            // Message de succès
            <div className="space-y-6">
              <div className="bg-green-50 text-green-800 p-4 rounded-lg text-sm border border-green-200">
                <p className="font-semibold mb-2">✓ Email envoyé !</p>
                <p>
                  Si un compte existe avec cet email, vous recevrez un lien de réinitialisation dans quelques instants.
                </p>
                <p className="mt-2 text-xs text-green-700">
                  Pensez à vérifier vos spams si vous ne recevez rien.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => router.push('/login')}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  Retour à la connexion
                </button>

                <button
                  onClick={() => {
                    setSuccess(false)
                    setEmail('')
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
                >
                  Renvoyer un email
                </button>
              </div>
            </div>
          ) : (
            // Formulaire
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                  Adresse email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="votre@email.com"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                  {error}
                  {cooldownSeconds > 0 && (
                    <p className="mt-2 text-xs">
                      Rate limiting : protection contre les abus. Vous pourrez réessayer dans {formatCooldown(cooldownSeconds)}.
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-6 space-y-3">
              <p className="text-center text-gray-600 text-sm">
                <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                  ← Retour à la connexion
                </Link>
              </p>
              <p className="text-center text-gray-600 text-sm">
                Pas encore de compte ?{' '}
                <Link href="/signup" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                  Créer un compte
                </Link>
              </p>
            </div>
          )}

          {/* Info rate limiting */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Protection anti-abus : Maximum 4 tentatives par heure
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
