'use client'

import { useState } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { getSecureSectionPublic } from '@/lib/actions/secure-section'

interface SecureAccessFormProps {
  clientId: string
  onAccessGranted: (data: any) => void
}

export default function SecureAccessForm({
  clientId,
  onAccessGranted,
}: SecureAccessFormProps) {
  const [accessCode, setAccessCode] = useState('')
  const [showCode, setShowCode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await getSecureSectionPublic(clientId, accessCode)

      if (result.success && result.data) {
        onAccessGranted(result.data)
      } else {
        setError(result.message || 'Code d\'accès incorrect')
      }
    } catch (err) {
      setError('Erreur lors de la vérification du code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div>
          <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 mb-2">
            Code d'accès
          </label>
          <div className="relative">
            <input
              id="accessCode"
              type={showCode ? 'text' : 'password'}
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
              placeholder="Entrez votre code d'accès"
              required
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowCode(!showCode)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label={showCode ? 'Masquer le code' : 'Afficher le code'}
            >
              {showCode ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !accessCode}
          className="w-full bg-indigo-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
        >
          {loading ? 'Vérification...' : 'Accéder aux informations'}
        </button>
      </form>

      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Vous avez reçu ce code par email avec votre confirmation de réservation.
          <br />
          En cas de problème, contactez votre hôte.
        </p>
      </div>
    </div>
  )
}
