'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { ArrowLeft, Volume2, VolumeX, Check } from 'lucide-react'
import Link from 'next/link'
import { getUserSettings, updateUserSettings } from '@/lib/user-settings'
import { soundManager } from '@/lib/sounds'

interface SettingsClientProps {
  user: User
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showSaved, setShowSaved] = useState(false)

  useEffect(() => {
    // Charger les paramètres au montage
    const settings = getUserSettings()
    setSoundEnabled(settings.soundEnabled)
  }, [])

  const handleToggleSound = async () => {
    const newValue = !soundEnabled
    setSoundEnabled(newValue)

    // Sauvegarder dans localStorage
    updateUserSettings({ soundEnabled: newValue })

    // Jouer un son de test si on active
    if (newValue) {
      soundManager.play('success')
    }

    // Afficher confirmation
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Section Sons */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              Sons et Animations
            </h2>

            <div className="space-y-4">
              {/* Toggle Sons */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Effets sonores</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Jouer des sons lors de l'ajout, modification ou suppression de conseils
                  </p>
                </div>
                <button
                  onClick={handleToggleSound}
                  className={`
                    relative inline-flex h-8 w-14 items-center rounded-full transition-colors
                    ${soundEnabled ? 'bg-green-600' : 'bg-gray-300'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-6 w-6 transform rounded-full bg-white transition-transform
                      ${soundEnabled ? 'translate-x-7' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              {/* Info */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-blue-600 mt-0.5">ℹ️</div>
                <div className="flex-1 text-sm text-blue-900">
                  <p className="font-medium mb-1">À propos des sons</p>
                  <ul className="space-y-1 text-blue-800">
                    <li>• Sons de célébration lors de l'ajout de conseils</li>
                    <li>• Effet de flip pour les modifications</li>
                    <li>• Alerte pour les suppressions</li>
                    <li>• Badge unlock lorsque vous débloquez une récompense</li>
                  </ul>
                </div>
              </div>

              {/* Saved confirmation */}
              {showSaved && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 animate-fade-in">
                  <Check size={18} />
                  <span className="text-sm font-medium">Paramètres sauvegardés !</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Future sections placeholder */}
        <div className="mt-6 p-6 bg-white rounded-xl shadow-sm border border-gray-200 border-dashed">
          <p className="text-center text-gray-500 text-sm">
            D'autres paramètres seront bientôt disponibles ici 🚀
          </p>
        </div>
      </div>
    </div>
  )
}
