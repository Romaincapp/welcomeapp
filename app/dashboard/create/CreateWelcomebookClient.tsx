'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createWelcomebookServerAction, checkSlugExists } from '@/lib/actions/create-welcomebook'
import { getClientsByUserId } from '@/lib/actions/client'
import { copyWelcomebookData } from '@/lib/actions/copy-welcomebook'
import { Check, X, Loader2, ArrowLeft, Copy } from 'lucide-react'
import Link from 'next/link'
import type { Client } from '@/types'

// Fonction utilitaire pour générer un slug depuis un nom
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
}

interface CreateWelcomebookClientProps {
  userEmail: string
  userId: string
}

export default function CreateWelcomebookClient({
  userEmail,
  userId
}: CreateWelcomebookClientProps) {
  const [welcomebookName, setWelcomebookName] = useState('')
  const [propertyName, setPropertyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // États pour validation temps réel du slug
  const [generatedSlug, setGeneratedSlug] = useState('')
  const [slugAvailable, setSlugAvailable] = useState<null | boolean>(null)
  const [slugChecking, setSlugChecking] = useState(false)
  const [slugSuggestion, setSlugSuggestion] = useState<string | null>(null)

  // États pour import de données
  const [existingWelcomebooks, setExistingWelcomebooks] = useState<Client[]>([])
  const [importEnabled, setImportEnabled] = useState(false)
  const [importFromId, setImportFromId] = useState<string>('')
  const [loadingWelcomebooks, setLoadingWelcomebooks] = useState(true)

  // Protection contre double soumission
  const isSubmittingRef = useRef(false)
  const slugTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Charger les welcomebooks existants pour l'import
  useEffect(() => {
    async function fetchWelcomebooks() {
      setLoadingWelcomebooks(true)
      const result = await getClientsByUserId()
      if (result.success && result.data) {
        setExistingWelcomebooks(result.data)
        // Auto-sélectionner le premier si disponible
        if (result.data.length > 0) {
          setImportFromId(result.data[0].id)
        }
      }
      setLoadingWelcomebooks(false)
    }
    fetchWelcomebooks()
  }, [])

  // Générer le slug à chaque changement de propertyName
  useEffect(() => {
    const slug = generateSlug(propertyName)
    setGeneratedSlug(slug)

    // Reset l'état de vérification
    setSlugAvailable(null)
    setSlugSuggestion(null)

    // Vérifier le slug avec debounce (500ms)
    if (slug.length > 0) {
      if (slugTimerRef.current) clearTimeout(slugTimerRef.current)

      setSlugChecking(true)
      slugTimerRef.current = setTimeout(async () => {
        try {
          const result = await checkSlugExists(slug)
          setSlugAvailable(!result.exists)
          setSlugSuggestion(result.suggestion || null)
          setSlugChecking(false)
        } catch (err) {
          console.error('[CREATE] Erreur vérification slug:', err)
          setSlugChecking(false)
        }
      }, 500)
    } else {
      setSlugChecking(false)
    }

    return () => {
      if (slugTimerRef.current) clearTimeout(slugTimerRef.current)
    }
  }, [propertyName])

  // Vérifier si le formulaire est valide
  const isFormValid =
    welcomebookName.trim().length > 0 &&
    propertyName.trim().length > 0 &&
    slugAvailable === true &&
    !slugChecking

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    // Protection contre double soumission
    if (isSubmittingRef.current || loading) {
      console.log('[CREATE] Soumission déjà en cours - bloqué')
      return
    }

    if (!isFormValid) {
      setError('Veuillez corriger les erreurs avant de continuer.')
      return
    }

    // Verrouillage immédiat
    isSubmittingRef.current = true
    setLoading(true)
    setError(null)

    try {
      console.log('[CREATE] Création nouveau welcomebook...')

      // Créer le nouveau welcomebook (pas de auth.signUp, utilisateur déjà authentifié)
      const result = await createWelcomebookServerAction(
        userEmail,
        propertyName,
        userId,
        welcomebookName // Nom d'affichage dans le switcher
      )

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Erreur lors de la création')
      }

      console.log('[CREATE] Welcomebook créé avec succès:', result.data.slug)

      // Si import activé, copier les données du welcomebook source
      if (importEnabled && importFromId) {
        console.log('[CREATE] Importing data from:', importFromId)

        const copyResult = await copyWelcomebookData(importFromId, result.data.id, {
          includeTips: true,
          includeSecureSection: true,
        })

        if (copyResult.success) {
          console.log(`[CREATE] Import réussi - ${copyResult.copiedTips} tips, ${copyResult.copiedCategories} catégories`)
        } else {
          console.error('[CREATE] Erreur import:', copyResult.error)
          // Ne pas bloquer, l'import est optionnel
        }
      }

      // Définir ce nouveau welcomebook comme actif
      document.cookie = `selectedWelcomebookId=${result.data.id}; path=/; max-age=31536000` // 1 year

      // Rediriger vers le dashboard (affichera le nouveau welcomebook)
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      console.error('[CREATE] Erreur:', err)
      setError(err.message || 'Erreur lors de la création')
      isSubmittingRef.current = false
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Back button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft size={20} />
          <span>Retour au dashboard</span>
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-2">Créer un nouveau Welcomebook</h1>
          <p className="text-gray-600 mb-2">
            Compte : <strong>{userEmail}</strong>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Créez un welcomebook supplémentaire pour une autre location ou propriété.
          </p>

          <form onSubmit={handleCreate} className="space-y-6">
            {/* Welcomebook Name (display name in switcher) */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">
                Nom du Welcomebook <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={welcomebookName}
                onChange={(e) => setWelcomebookName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Villa Bord de Mer - Été 2025"
                disabled={loading}
              />
              <p className="text-xs text-gray-600 mt-1">
                Ce nom apparaîtra dans le menu de sélection de vos welcomebooks
              </p>
            </div>

            {/* Property Name (becomes slug) */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">
                Nom du logement (URL publique) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Villa Belle Vue"
                disabled={loading}
              />

              {/* Slug Preview */}
              {generatedSlug && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700 mb-1">
                    URL publique : <span className="font-mono text-indigo-600">welcomeapp.be/{generatedSlug}</span>
                  </p>

                  {/* Slug Validation */}
                  <div className="flex items-center gap-2 mt-2">
                    {slugChecking && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Loader2 size={16} className="animate-spin" />
                        <span className="text-xs">Vérification de disponibilité...</span>
                      </div>
                    )}
                    {!slugChecking && slugAvailable === true && (
                      <div className="flex items-center gap-2 text-green-600">
                        <Check size={16} />
                        <span className="text-xs font-medium">URL disponible ✓</span>
                      </div>
                    )}
                    {!slugChecking && slugAvailable === false && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-red-600">
                          <X size={16} />
                          <span className="text-xs font-medium">URL déjà utilisée</span>
                        </div>
                        {slugSuggestion && (
                          <p className="text-xs text-gray-600">
                            Suggestion : <span className="font-mono text-indigo-600">{slugSuggestion}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Import Data Section */}
            {!loadingWelcomebooks && existingWelcomebooks.length > 0 && (
              <div className="border-t pt-6">
                <div className="flex items-start gap-3 mb-3">
                  <input
                    type="checkbox"
                    id="import-checkbox"
                    checked={importEnabled}
                    onChange={(e) => setImportEnabled(e.target.checked)}
                    disabled={loading}
                    className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="import-checkbox"
                      className="text-sm font-medium text-gray-900 cursor-pointer flex items-center gap-2"
                    >
                      <Copy size={16} className="text-indigo-600" />
                      Importer les données d'un welcomebook existant
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                      Copiez automatiquement tous les conseils, catégories et informations d'un de vos welcomebooks existants
                    </p>
                  </div>
                </div>

                {importEnabled && (
                  <div className="mt-3 pl-7">
                    <label className="block text-sm font-medium mb-2 text-gray-900">
                      Importer depuis :
                    </label>
                    <select
                      value={importFromId}
                      onChange={(e) => setImportFromId(e.target.value)}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      {existingWelcomebooks.map((wb) => (
                        <option key={wb.id} value={wb.id}>
                          {(wb as any).welcomebook_name || wb.name} ({wb.slug})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-2">
                      ⚠️ Note : Les médias ne seront pas copiés physiquement, seules les références seront importées
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Création...</span>
                  </>
                ) : (
                  'Créer le Welcomebook'
                )}
              </button>
            </div>

            {/* Form validation hint */}
            {!isFormValid && !loading && (
              <p className="text-xs text-gray-500 text-center">
                Remplissez tous les champs et assurez-vous que l'URL est disponible
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
