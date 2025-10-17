'use client'

import { useState } from 'react'
import { X, Copy, Check, Share2 } from 'lucide-react'
import QRCode from 'react-qr-code'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  welcomebookUrl: string
  clientName: string
}

export default function ShareModal({ isOpen, onClose, welcomebookUrl, clientName }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(welcomebookUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Welcomebook - ${clientName}`,
          text: `Découvrez votre guide de voyage personnalisé`,
          url: welcomebookUrl,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-xl sm:rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Partager le Welcomebook</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* QR Code */}
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-gray-600 text-center">
              Scannez ce QR code pour accéder au welcomebook
            </p>
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md border-2 border-gray-200">
              <QRCode
                value={welcomebookUrl}
                size={180}
                level="H"
                style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center font-medium">
              {clientName}
            </p>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-2 bg-white text-gray-500">ou</span>
            </div>
          </div>

          {/* Link */}
          <div className="space-y-2 sm:space-y-3">
            <p className="text-xs sm:text-sm text-gray-600 font-medium">Lien du welcomebook</p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={welcomebookUrl}
                readOnly
                className="flex-1 px-3 sm:px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleCopyLink}
                className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition whitespace-nowrap ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {copied ? (
                  <>
                    <Check size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span className="text-sm">Copié</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span className="text-sm">Copier</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Native Share Button (Mobile) */}
          {typeof navigator !== 'undefined' && navigator.share && (
            <button
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm sm:text-base"
            >
              <Share2 size={16} className="sm:w-[18px] sm:h-[18px]" />
              Partager via...
            </button>
          )}

          {/* Instructions */}
          <div className="bg-indigo-50 p-3 sm:p-4 rounded-lg">
            <p className="text-xs sm:text-sm text-indigo-800">
              <span className="font-semibold">💡 Astuce :</span> Partagez ce lien ou ce QR code avec vos voyageurs pour qu'ils accèdent facilement à toutes les informations de leur séjour.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
