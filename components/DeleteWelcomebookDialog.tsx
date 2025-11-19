'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteClientWelcomebook } from '@/lib/actions/client'
import { Trash2, Loader2, AlertTriangle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import type { Client } from '@/types'

interface DeleteWelcomebookDialogProps {
  welcomebook: Client
  isCurrentlyActive: boolean
  onDeleteSuccess?: () => void
}

export default function DeleteWelcomebookDialog({
  welcomebook,
  isCurrentlyActive,
  onDeleteSuccess
}: DeleteWelcomebookDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      console.log('[DELETE DIALOG] Suppression de:', welcomebook.id)

      const result = await deleteClientWelcomebook(welcomebook.id)

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la suppression')
      }

      console.log('[DELETE DIALOG] Suppression réussie ✅')
      console.log('[DELETE DIALOG] Welcomebooks restants:', result.remainingCount)

      // Fermer le dialog
      setIsOpen(false)

      // Si c'était le dernier welcomebook, rediriger vers onboarding
      if (result.remainingCount === 0) {
        console.log('[DELETE DIALOG] Aucun welcomebook restant → redirection vers /dashboard/welcome')
        setTimeout(() => {
          window.location.href = '/dashboard/welcome'
        }, 100)
        return
      }

      // Si c'était le welcomebook actif, effacer le cookie et recharger
      if (isCurrentlyActive) {
        console.log('[DELETE DIALOG] Welcomebook actif supprimé → effacement cookie + reload')
        document.cookie = 'selectedWelcomebookId=; path=/; max-age=0' // Effacer le cookie
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 100)
        return
      }

      // Sinon, juste callback de succès (refresh liste)
      if (onDeleteSuccess) {
        onDeleteSuccess()
      }

      // Forcer un refresh du router
      router.refresh()
    } catch (err: any) {
      console.error('[DELETE DIALOG] Erreur:', err)
      setError(err.message || 'Erreur lors de la suppression')
      setIsDeleting(false)
    }
  }

  const welcomebookName = (welcomebook as any).welcomebook_name || welcomebook.name

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <button
          className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-md transition"
          onClick={(e) => {
            e.stopPropagation() // Empêcher le clic de fermer le dropdown parent
          }}
        >
          <Trash2 size={14} />
          <span>Supprimer</span>
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle size={20} />
            Supprimer définitivement ce welcomebook ?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-semibold text-gray-900">{welcomebookName}</p>
                <p className="text-xs text-gray-600 mt-1">
                  URL : <span className="font-mono">welcomeapp.be/{welcomebook.slug}</span>
                </p>
              </div>

              <div className="space-y-2 text-gray-700">
                <p className="font-semibold text-red-600 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Cette action est irréversible
                </p>

                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Tous les conseils et catégories seront supprimés</li>
                  <li>Tous les médias (photos, vidéos) seront perdus</li>
                  <li>Toutes les statistiques d'analytics seront effacées</li>
                  <li>La section sécurisée sera supprimée</li>
                </ul>

                {isCurrentlyActive && (
                  <p className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-orange-800 text-xs">
                    ⚠️ Ce welcomebook est actuellement actif. Vous serez redirigé vers un autre après suppression.
                  </p>
                )}

                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-700 font-medium text-xs">
                    ⚠️ Attention : Médias partagés
                  </p>
                  <p className="text-red-600 text-xs mt-1">
                    Si d'autres welcomebooks ont été créés par copie depuis celui-ci, leurs médias (photos/vidéos) ne fonctionneront plus car ils pointent vers ce dossier.
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">
                  {error}
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault() // Empêcher la fermeture auto du dialog
              handleDelete()
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Suppression...
              </>
            ) : (
              'Supprimer définitivement'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
