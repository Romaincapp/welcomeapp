/**
 * Gestion des préférences utilisateur (localStorage)
 * Utilisé pour activer/désactiver les sons et autres options
 */

export type ThemePreference = 'light' | 'dark' | 'system'

export interface UserSettings {
  soundEnabled: boolean
  theme: ThemePreference
}

const SETTINGS_KEY = 'welcomeapp_settings'

const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  theme: 'system'
}

/**
 * Récupère les préférences utilisateur depuis localStorage
 */
export function getUserSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS

  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (!stored) return DEFAULT_SETTINGS

    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
  } catch (error) {
    console.error('[USER SETTINGS] Erreur lors de la lecture:', error)
    return DEFAULT_SETTINGS
  }
}

/**
 * Met à jour les préférences utilisateur
 */
export function updateUserSettings(settings: Partial<UserSettings>): UserSettings {
  const current = getUserSettings()
  const updated = { ...current, ...settings }

  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
    console.log('[USER SETTINGS] Sauvegardé:', updated)
  } catch (error) {
    console.error('[USER SETTINGS] Erreur lors de la sauvegarde:', error)
  }

  return updated
}

/**
 * Réinitialise les préférences aux valeurs par défaut
 */
export function resetUserSettings(): UserSettings {
  try {
    localStorage.removeItem(SETTINGS_KEY)
    console.log('[USER SETTINGS] Réinitialisé')
  } catch (error) {
    console.error('[USER SETTINGS] Erreur lors de la réinitialisation:', error)
  }

  return DEFAULT_SETTINGS
}
