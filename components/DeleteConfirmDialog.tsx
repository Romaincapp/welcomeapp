'use client'

import { useState } from 'react'
import { X, Trash2, Loader2, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface DeleteConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  tipId: string
  tipTitle: string
}

export default function DeleteConfirmDialog({ isOpen, onClose, onSuccess, tipId, tipTitle }: DeleteConfirmDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  if (!isOpen) return null

  const handleDelete = async () => {
    setError(null)
    setLoading(true)

    try {
      // 1. Récupérer les médias associés pour les supprimer du Storage
      const { data: mediaData } = await supabase
        .from('tip_media')
        .select('url, thumbnail_url')
        .eq('tip_id', tipId)

      // 2. Supprimer les fichiers du Storage (images originales + thumbnails)
      if (mediaData && mediaData.length > 0) {
        const filePaths: string[] = []

        // Ajouter les URLs principales
        mediaData.forEach((m: any) => {
          const mainPath = m.url.split('/storage/v1/object/public/media/')[1]
          if (mainPath) filePaths.push(mainPath)

          // Ajouter les thumbnails si ils existent
          if (m.thumbnail_url) {
            const thumbPath = m.thumbnail_url.split('/storage/v1/object/public/media/')[1]
            if (thumbPath) filePaths.push(thumbPath)
          }
        })

        if (filePaths.length > 0) {
          console.log('[DELETE TIP] Suppression de', filePaths.length, 'fichier(s) du storage')
          await supabase.storage.from('media').remove(filePaths)
        }
      }

      // 3. Supprimer le conseil (les médias seront supprimés en cascade grâce à ON DELETE CASCADE)
      const { error: deleteError } = await supabase
        .from('tips')
        .delete()
        .eq('id', tipId)

      if (deleteError) throw deleteError

      // 4. Succès
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error deleting tip:', err)
      setError(err.message || 'Erreur lors de la suppression du conseil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold">Supprimer le conseil</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-full transition disabled:cursor-not-allowed"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            Êtes-vous sûr de vouloir supprimer ce conseil ?
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-4">
            <p className="font-semibold text-gray-900">{tipTitle}</p>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Cette action est irréversible. Le conseil et toutes ses images seront définitivement supprimés.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition flex items-center gap-2 disabled:bg-red-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="w-5 h-5" />
                Supprimer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
