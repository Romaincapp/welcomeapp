'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Check, Loader2, AlertCircle } from 'lucide-react'
import { checkSlugAvailability, updateClientSlug } from '@/lib/actions/client'
import { useRouter } from 'next/navigation'

interface EditSlugModalProps {
  isOpen: boolean
  onClose: () => void
  currentSlug: string
  clientId: string
  clientName: string
}

export default function EditSlugModal({
  isOpen,
  onClose,
  currentSlug,
  clientId,
  clientName
}: EditSlugModalProps) {
  const [newSlug, setNewSlug] = useState(currentSlug)
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Normaliser le slug (même logique que generateSlug)
  const normalizeSlug = (slug: string): string => {
    return slug
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  // Vérifier la disponibilité du slug avec debounce
  useEffect(() => {
    const normalizedSlug = normalizeSlug(newSlug)

    // Reset les états
    setIsAvailable(null)
    setSuggestion(null)
    setError(null)

    // Si le slug est identique à l'actuel, pas besoin de vérifier
    if (normalizedSlug === currentSlug) {
      setIsAvailable(true)
      return
    }

    // Si le slug est vide ou trop court, invalide
    if (!normalizedSlug || normalizedSlug.length < 2) {
      setIsAvailable(false)
      setError('Le slug doit contenir au moins 2 caractères')
      return
    }

    // Vérifier avec debounce (500ms)
    if (timerRef.current) clearTimeout(timerRef.current)

    setIsChecking(true)
    timerRef.current = setTimeout(async () => {
      try {
        const result = await checkSlugAvailability(normalizedSlug, clientId)
        setIsAvailable(result.available)
        setSuggestion(result.suggestion || null)
        setIsChecking(false)
      } catch (err) {
        console.error('Erreur vérification slug:', err)
        setIsAvailable(false)
        setError('Erreur lors de la vérification')
        setIsChecking(false)
      }
    }, 500)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [newSlug, currentSlug, clientId])

  const handleSave = async () => {
    const normalizedSlug = normalizeSlug(newSlug)

    // Vérifications finales
    if (!normalizedSlug || normalizedSlug.length < 2) {
      setError('Le slug doit contenir au moins 2 caractères')
      return
    }

    if (isAvailable === false) {
      setError('Ce slug n\'est pas disponible')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const result = await updateClientSlug(clientId, normalizedSlug)

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la mise à jour')
      }

      // Succès !
      setSuccess(true)

      // Attendre 1.5s pour afficher le message de succès, puis fermer et rediriger
      setTimeout(() => {
        onClose()
        // Rediriger vers le dashboard pour forcer le refresh avec le nouveau slug
        router.push('/dashboard')
        router.refresh()
      }, 1500)
    } catch (err: any) {
      console.error('Erreur sauvegarde slug:', err)
      setError(err.message || 'Erreur lors de la mise à jour')
      setIsSaving(false)
    }
  }

  const handleUseSuggestion = () => {
    if (suggestion) {
      setNewSlug(suggestion)
    }
  }

  if (!isOpen) return null

  const normalizedSlug = normalizeSlug(newSlug)
  const isModified = normalizedSlug !== currentSlug
  const canSave = isModified && isAvailable === true && !isSaving && !success

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Modifier l'URL</h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Attention</p>
                <p>
                  Modifier votre URL changera le lien d'accès à votre WelcomeApp. Pensez à
                  mettre à jour vos QR codes et liens partagés.
                </p>
              </div>
            </div>
          </div>

          {/* Nom du WelcomeApp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du WelcomeApp
            </label>
            <p className="text-gray-900 font-semibold">{clientName}</p>
          </div>

          {/* URL actuelle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL actuelle
            </label>
            <div className="bg-gray-100 rounded-lg px-4 py-3 font-mono text-gray-900">
              welcomeapp.be/<span className="font-bold">{currentSlug}</span>
            </div>
          </div>

          {/* Nouvelle URL */}
          <div>
            <label htmlFor="newSlug" className="block text-sm font-medium text-gray-700 mb-2">
              Nouvelle URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <span className="text-gray-500 font-mono text-sm">welcomeapp.be/</span>
              </div>
              <input
                id="newSlug"
                type="text"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                disabled={isSaving || success}
                className={`w-full pl-[160px] pr-12 py-3 border rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed ${
                  isAvailable === false && isModified
                    ? 'border-red-500'
                    : isAvailable === true && isModified
                    ? 'border-green-500'
                    : 'border-gray-300'
                }`}
                placeholder="mon-welcomeapp"
              />
              {/* Indicateur de statut */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {isChecking && <Loader2 className="text-gray-400 animate-spin" size={20} />}
                {!isChecking && isAvailable === true && isModified && (
                  <Check className="text-green-600" size={20} />
                )}
                {!isChecking && isAvailable === false && isModified && (
                  <X className="text-red-600" size={20} />
                )}
              </div>
            </div>

            {/* Feedback */}
            <div className="mt-2 text-sm">
              {normalizedSlug !== newSlug && (
                <p className="text-gray-600">
                  Slug normalisé : <span className="font-mono font-semibold">{normalizedSlug}</span>
                </p>
              )}
              {isModified && isChecking && (
                <p className="text-gray-600">Vérification de la disponibilité...</p>
              )}
              {isModified && !isChecking && isAvailable === true && (
                <p className="text-green-600 font-semibold">✓ Ce slug est disponible</p>
              )}
              {isModified && !isChecking && isAvailable === false && (
                <p className="text-red-600 font-semibold">✗ Ce slug est déjà utilisé</p>
              )}
              {!isModified && (
                <p className="text-gray-600">C'est déjà votre slug actuel</p>
              )}
            </div>

            {/* Suggestion */}
            {suggestion && isAvailable === false && (
              <button
                onClick={handleUseSuggestion}
                className="mt-2 text-sm text-indigo-600 hover:underline font-semibold"
              >
                Essayer : {suggestion}
              </button>
            )}
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Succès */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm">
              <p className="font-semibold">✓ Slug mis à jour avec succès !</p>
              <p className="mt-1">Redirection en cours...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isSaving || success}
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving && <Loader2 className="animate-spin" size={18} />}
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}
