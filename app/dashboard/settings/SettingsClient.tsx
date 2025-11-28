'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { Volume2, VolumeX, Check, Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import { getUserSettings, updateUserSettings, ThemePreference } from '@/lib/user-settings'
import { soundManager } from '@/lib/sounds'

interface SettingsClientProps {
  user: User
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showSaved, setShowSaved] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
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

  const handleThemeChange = (newTheme: ThemePreference) => {
    setTheme(newTheme)
    updateUserSettings({ theme: newTheme })

    // Afficher confirmation
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 2000)
  }

  const themeOptions: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Clair', icon: Sun },
    { value: 'dark', label: 'Sombre', icon: Moon },
    { value: 'system', label: 'Système', icon: Monitor },
  ]

  return (
    <div className="min-h-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Page Header */}
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
        </div>
        {/* Section Sons */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              Sons et Animations
            </h2>

            <div className="space-y-4">
              {/* Toggle Sons */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">Effets sonores</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Jouer des sons lors de l'ajout, modification ou suppression de conseils
                  </p>
                </div>
                <button
                  onClick={handleToggleSound}
                  className={`
                    relative inline-flex h-8 w-14 items-center rounded-full transition-colors
                    ${soundEnabled ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-sm
                      ${soundEnabled ? 'translate-x-7' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              {/* Info */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-blue-600 dark:text-blue-400 mt-0.5">ℹ️</div>
                <div className="flex-1 text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-medium mb-1">À propos des sons</p>
                  <ul className="space-y-1 text-blue-800 dark:text-blue-200">
                    <li>• Sons de célébration lors de l'ajout de conseils</li>
                    <li>• Effet de flip pour les modifications</li>
                    <li>• Alerte pour les suppressions</li>
                    <li>• Badge unlock lorsque vous débloquez une récompense</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Apparence */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              {mounted && theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
              Apparence
            </h2>

            <div className="space-y-4">
              {/* Sélecteur de thème */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Thème du dashboard</h3>
                <div className="flex gap-3">
                  {themeOptions.map((option) => {
                    const Icon = option.icon
                    const isActive = mounted && theme === option.value
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleThemeChange(option.value)}
                        className={`
                          flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all
                          ${isActive
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                          }
                        `}
                      >
                        <Icon size={24} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : ''} />
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Info */}
              <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="text-purple-600 dark:text-purple-400 mt-0.5">🎨</div>
                <div className="flex-1 text-sm text-purple-900 dark:text-purple-100">
                  <p className="font-medium mb-1">À propos du thème</p>
                  <ul className="space-y-1 text-purple-800 dark:text-purple-200">
                    <li>• <strong>Clair</strong> : Interface lumineuse, idéale en journée</li>
                    <li>• <strong>Sombre</strong> : Réduit la fatigue oculaire, parfait le soir</li>
                    <li>• <strong>Système</strong> : S'adapte automatiquement à votre appareil</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Saved confirmation */}
        {showSaved && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200 animate-fade-in">
            <Check size={18} />
            <span className="text-sm font-medium">Paramètres sauvegardés !</span>
          </div>
        )}
      </div>
    </div>
  )
}
