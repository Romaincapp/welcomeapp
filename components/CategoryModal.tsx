'use client'

import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { addCategory, updateCategory } from '@/lib/actions/tips'
import { Category } from '@/types'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  clientId: string
  category?: Category | null // Si fourni, on est en mode édition
}

export default function CategoryModal({
  isOpen,
  onClose,
  onSuccess,
  clientId,
  category = null,
}: CategoryModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categoryName, setCategoryName] = useState('')

  const isEditMode = !!category

  // Initialiser le nom si on est en mode édition
  useEffect(() => {
    if (category) {
      setCategoryName(category.name)
    } else {
      setCategoryName('')
    }
  }, [category])

  if (!isOpen) return null

  const handleClose = () => {
    if (!loading) {
      setCategoryName('')
      setError(null)
      onClose()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedName = categoryName.trim()
    if (!trimmedName) {
      setError('Le nom de la catégorie est requis')
      return
    }

    setLoading(true)

    try {
      let result

      if (isEditMode && category) {
        // Mode édition
        result = await updateCategory(category.id, trimmedName)
      } else {
        // Mode création
        result = await addCategory(trimmedName, clientId)
      }

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      // Succès
      setCategoryName('')
      setLoading(false)
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Erreur lors de la sauvegarde de la catégorie:', err)
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl force-light-theme">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la catégorie
            </label>
            <input
              id="categoryName"
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 text-gray-900"
              placeholder="Ex: 🍴 Restaurants, 🏨 Hôtels, 🎨 Activités..."
              autoFocus
            />
            <p className="mt-2 text-sm text-gray-500">
              Vous pouvez ajouter un emoji au début pour personnaliser votre catégorie
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !categoryName.trim()}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isEditMode ? 'Modification...' : 'Création...'}
                </>
              ) : (
                <>{isEditMode ? 'Modifier' : 'Créer'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
