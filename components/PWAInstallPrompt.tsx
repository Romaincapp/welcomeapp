'use client'

import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PWAInstallPromptProps {
  clientName: string
  clientId?: string
  onInstall?: () => void
}

export function PWAInstallPrompt({ clientName, clientId, onInstall }: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà refusé (localStorage)
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      setIsDismissed(true)
      return
    }

    // Vérifier si l'app est déjà installée
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return
    }

    // Écouter l'événement beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      console.log('[PWA] beforeinstallprompt event fired')
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Afficher le prompt après 5 secondes (laisser le temps au visiteur de voir le contenu)
      setTimeout(() => {
        setShowPrompt(true)
      }, 5000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Détecter si l'app a été installée
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed successfully')
      setShowPrompt(false)
      setDeferredPrompt(null)

      // Track installation dans analytics
      if (onInstall) {
        console.log('[PWA] Tracking installation analytics')
        onInstall()
      }
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    console.log('[PWA] User clicked install')
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log('[PWA] User choice:', outcome)

    if (outcome === 'accepted') {
      setShowPrompt(false)
    }

    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    console.log('[PWA] User dismissed prompt')
    setShowPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
    setIsDismissed(true)
  }

  // Ne pas afficher si l'utilisateur a déjà refusé ou si le prompt n'est pas disponible
  if (!showPrompt || isDismissed) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] max-w-md mx-auto animate-slide-up">
      <div className="bg-white shadow-2xl rounded-2xl p-4 border-2 border-indigo-200 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fermer"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
            <Download className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="flex-1 pr-6">
            <h3 className="font-bold text-gray-900 mb-1 text-base">
              Installer {clientName}
            </h3>
            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
              Accédez rapidement à ce guide depuis votre écran d'accueil. Pratique pour votre séjour !
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Download size={16} />
                Installer
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
