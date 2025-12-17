'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { type Locale } from '@/i18n/request'
import { useClientTranslation } from '@/hooks/useClientTranslation'

interface WelcomeMessageModalProps {
  message: string
  clientName: string
  clientSlug: string
  locale: Locale
  photoUrl?: string | null
}

export default function WelcomeMessageModal({ message, clientName, clientSlug, locale, photoUrl }: WelcomeMessageModalProps) {
  const { translated: translatedMessage } = useClientTranslation(message, 'fr', locale)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const hasSeenKey = `welcome_seen_${clientSlug}`
    const hasSeen = localStorage.getItem(hasSeenKey)

    if (!hasSeen && message) {
      setIsOpen(true)
    }
  }, [clientSlug, message])

  const handleClose = () => {
    localStorage.setItem(`welcome_seen_${clientSlug}`, 'true')
    setIsOpen(false)
  }

  if (!isOpen || !message) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="relative flex-shrink-0">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 shadow-lg transition"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
          <div className="pt-8 px-8 pb-4 text-center">
            {photoUrl ? (
              <div className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden shadow-lg">
                <img
                  src={photoUrl}
                  alt={clientName}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-4xl">👋</span>
              </div>
            )}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {clientName} vous souhaite la bienvenue
            </h2>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-8">
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
            {translatedMessage}
          </p>
        </div>
        <div className="flex-shrink-0 p-8 pt-4 text-center">
          <button
            onClick={handleClose}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transition"
          >
            C'est parti !
          </button>
        </div>
      </div>
    </div>
  )
}
