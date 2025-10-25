'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, RefreshCw, AlertTriangle } from 'lucide-react'
import { resetWelcomebook, deleteAccount } from '@/lib/actions/reset'

interface DangerZoneProps {
  clientId: string
  clientSlug: string
}

export default function DangerZone({ clientId, clientSlug }: DangerZoneProps) {
  const router = useRouter()
  const [isResetting, setIsResetting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleReset = async () => {
    if (!showResetConfirm) {
      setShowResetConfirm(true)
      return
    }

    setIsResetting(true)
    try {
      await resetWelcomebook(clientId)
      alert('✅ Welcomebook réinitialisé avec succès !')
      router.push(`/${clientSlug}`)
      router.refresh()
    } catch (error) {
      alert(`❌ Erreur : ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    } finally {
      setIsResetting(false)
      setShowResetConfirm(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    setIsDeleting(true)
    try {
      await deleteAccount()
      alert('✅ Compte supprimé avec succès')
      router.push('/')
      router.refresh()
    } catch (error) {
      alert(`❌ Erreur : ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-2 border-red-200">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-6 h-6 text-red-600" />
        <h2 className="text-xl font-bold text-red-600">Zone dangereuse</h2>
      </div>

      <p className="text-gray-600 mb-6 text-sm">
        Actions irréversibles. Ces opérations ne peuvent pas être annulées.
      </p>

      <div className="space-y-4">
        {/* Bouton Réinitialiser le welcomebook */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Réinitialiser le welcomebook</h3>
              <p className="text-sm text-gray-600">
                Supprime tous les conseils, médias, section sécurisée et réinitialise les paramètres par défaut.
              </p>
            </div>
            <button
              onClick={handleReset}
              disabled={isResetting}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                showResetConfirm
                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                  : 'bg-orange-100 hover:bg-orange-200 text-orange-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
              {showResetConfirm ? 'Confirmer la réinitialisation' : 'Réinitialiser'}
            </button>
          </div>
          {showResetConfirm && (
            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800 font-medium">
                ⚠️ Êtes-vous sûr ? Tous vos conseils et paramètres seront supprimés définitivement.
              </p>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="mt-2 text-sm text-orange-600 hover:text-orange-800 underline"
              >
                Annuler
              </button>
            </div>
          )}
        </div>

        {/* Bouton Supprimer le compte */}
        <div className="border border-red-300 rounded-lg p-4 bg-red-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">Supprimer définitivement mon compte</h3>
              <p className="text-sm text-red-700">
                Supprime votre compte, votre welcomebook et toutes les données associées. Cette action est <strong>irréversible</strong>.
              </p>
            </div>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                showDeleteConfirm
                  ? 'bg-red-700 hover:bg-red-800 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Trash2 className="w-4 h-4" />
              {showDeleteConfirm ? 'CONFIRMER LA SUPPRESSION' : 'Supprimer mon compte'}
            </button>
          </div>
          {showDeleteConfirm && (
            <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-sm text-red-900 font-bold mb-2">
                🚨 ATTENTION : Cette action est DÉFINITIVE et IRRÉVERSIBLE
              </p>
              <p className="text-sm text-red-800 mb-3">
                Votre compte, votre welcomebook <strong>"{clientSlug}"</strong> et toutes vos données seront supprimés pour toujours.
              </p>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-sm text-red-700 hover:text-red-900 underline font-medium"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
