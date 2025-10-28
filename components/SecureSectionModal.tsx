'use client'

import { useState } from 'react'
import { X, Lock } from 'lucide-react'
import SecureAccessForm from './SecureAccessForm'
import SecureSectionContent from './SecureSectionContent'
import { type Locale } from '@/i18n/request'

interface SecureSectionModalProps {
  isOpen: boolean
  onClose: () => void
  clientId: string
  locale?: Locale
}

export default function SecureSectionModal({ isOpen, onClose, clientId, locale = 'fr' }: SecureSectionModalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [secureData, setSecureData] = useState<any>(null)

  if (!isOpen) return null

  const handleAccessGranted = (data: any) => {
    setIsAuthenticated(true)
    setSecureData(data)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setSecureData(null)
  }

  const handleCloseModal = () => {
    handleLogout()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-xl sm:rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Informations d'Arrivée</h2>
          </div>
          <button
            onClick={handleCloseModal}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {!isAuthenticated ? (
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-indigo-800">
                  <span className="font-semibold">🔒 Section sécurisée</span>
                  <br />
                  Cette section contient des informations sensibles (check-in, WiFi, localisation exacte...).
                  Entrez le code fourni par votre hôte pour y accéder.
                </p>
              </div>
              <SecureAccessForm clientId={clientId} onAccessGranted={handleAccessGranted} />
            </div>
          ) : (
            <SecureSectionContent data={secureData} onLogout={handleLogout} locale={locale} />
          )}
        </div>
      </div>
    </div>
  )
}
