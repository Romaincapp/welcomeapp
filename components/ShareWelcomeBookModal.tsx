'use client'

import { useState } from 'react'
import { X, Copy, Download, Mail, Check } from 'lucide-react'
import QRCode from 'react-qr-code'

interface ShareWelcomeBookModalProps {
  isOpen: boolean
  onClose: () => void
  subdomain: string
  clientName: string
}

export default function ShareWelcomeBookModal({
  isOpen,
  onClose,
  subdomain,
  clientName
}: ShareWelcomeBookModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  // Générer l'URL complète
  const welcomebookUrl = `https://welcomeapp.be/${subdomain}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(welcomebookUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erreur lors de la copie:', err)
    }
  }

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code-svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL('image/png')

      const downloadLink = document.createElement('a')
      downloadLink.download = `welcomeapp-${subdomain}-qr.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  const handleShareByEmail = () => {
    const subject = encodeURIComponent(`Découvrez ${clientName}`)
    const body = encodeURIComponent(
      `Bonjour,\n\nDécouvrez mon guide personnalisé :\n${welcomebookUrl}\n\nÀ bientôt !`
    )
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-800">
            Partager votre WelcomeApp
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* QR Code */}
          <div className="flex flex-col items-center bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-xl">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <QRCode
                id="qr-code-svg"
                value={welcomebookUrl}
                size={200}
                level="H"
              />
            </div>
            <p className="mt-4 text-sm text-gray-600 text-center">
              Scannez ce QR code pour accéder au WelcomeApp
            </p>
          </div>

          {/* URL avec copie */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Lien de votre WelcomeApp
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={welcomebookUrl}
                readOnly
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-mono text-sm"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 whitespace-nowrap"
              >
                {copied ? (
                  <>
                    <Check size={18} />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    Copier
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleDownloadQR}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition font-semibold"
            >
              <Download size={18} />
              Télécharger le QR Code
            </button>
            <button
              onClick={handleShareByEmail}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition font-semibold"
            >
              <Mail size={18} />
              Partager par email
            </button>
          </div>

          {/* Info supplémentaires */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              💡 Comment partager avec vos clients ?
            </h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Envoyez le lien par email ou SMS</li>
              <li>• Imprimez le QR code et placez-le dans votre logement</li>
              <li>• Ajoutez le QR code à vos documents de bienvenue</li>
              <li>• Partagez sur vos réseaux sociaux</li>
            </ul>
          </div>

          {/* Note sur les sous-domaines */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">
              🌐 À propos de votre URL
            </h3>
            <p className="text-sm text-gray-700">
              Votre WelcomeApp est accessible via <strong>welcomeapp.be/{subdomain}</strong>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
