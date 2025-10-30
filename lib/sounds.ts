/**
 * Système de gestion des sons pour les animations
 * Les sons sont désactivables via les paramètres utilisateur
 */

import { getUserSettings } from './user-settings'
import { syntheticSoundGenerator } from './sound-fallback'

export type SoundType = 'success' | 'badge' | 'delete' | 'flip'

class SoundManager {
  private sounds: Map<SoundType, HTMLAudioElement> = new Map()
  private initialized = false
  private useFallback = false

  /**
   * Initialise les sons (appelé une seule fois)
   */
  private async init() {
    if (this.initialized || typeof window === 'undefined') return

    try {
      // Précharger les sons MP3
      const soundFiles: [SoundType, string][] = [
        ['success', '/sounds/success.mp3'],
        ['badge', '/sounds/badge.mp3'],
        ['delete', '/sounds/delete.mp3'],
        ['flip', '/sounds/flip.mp3']
      ]

      // Vérifier si au moins un fichier existe
      const testAudio = new Audio('/sounds/success.mp3')
      testAudio.volume = 0

      await new Promise<void>((resolve, reject) => {
        testAudio.addEventListener('canplaythrough', () => {
          console.log('[SOUNDS] ✅ Fichiers MP3 disponibles')
          this.useFallback = false
          resolve()
        }, { once: true })

        testAudio.addEventListener('error', () => {
          console.log('[SOUNDS] ⚠️ Fichiers MP3 introuvables, utilisation des sons synthétiques')
          this.useFallback = true
          resolve()
        }, { once: true })

        // Timeout de 2s
        setTimeout(() => {
          console.log('[SOUNDS] ⚠️ Timeout, utilisation des sons synthétiques')
          this.useFallback = true
          resolve()
        }, 2000)
      })

      // Si pas de fallback, charger les MP3
      if (!this.useFallback) {
        soundFiles.forEach(([type, path]) => {
          const audio = new Audio(path)
          audio.volume = 0.5
          audio.preload = 'auto'
          this.sounds.set(type, audio)
        })
      }

      this.initialized = true
      console.log('[SOUNDS] ✅ Système de sons initialisé')
    } catch (error) {
      console.error('[SOUNDS] ❌ Erreur lors de l\'initialisation:', error)
      this.useFallback = true
    }
  }

  /**
   * Joue un son selon le type
   */
  async play(type: SoundType) {
    // Vérifier les préférences utilisateur
    const settings = getUserSettings()
    if (!settings.soundEnabled) {
      console.log(`[SOUNDS] 🔇 Son "${type}" désactivé par l'utilisateur`)
      return
    }

    // Initialiser si nécessaire
    if (!this.initialized) {
      await this.init()
    }

    // Utiliser les sons synthétiques si fallback
    if (this.useFallback) {
      console.log(`[SOUNDS] 🎵 Son synthétique "${type}"`)
      syntheticSoundGenerator.play(type)
      return
    }

    // Sinon utiliser les MP3
    const sound = this.sounds.get(type)
    if (!sound) {
      console.warn(`[SOUNDS] ⚠️ Son "${type}" introuvable`)
      return
    }

    try {
      // Réinitialiser le son pour pouvoir le rejouer
      sound.currentTime = 0
      sound.play().catch(err => {
        // Erreur silencieuse (normal si l'utilisateur n'a pas interagi avec la page)
        console.debug(`[SOUNDS] Son "${type}" bloqué par le navigateur:`, err)
      })
    } catch (error) {
      console.error(`[SOUNDS] ❌ Erreur lors de la lecture de "${type}":`, error)
    }
  }

  /**
   * Arrête tous les sons en cours
   */
  stopAll() {
    this.sounds.forEach(sound => {
      sound.pause()
      sound.currentTime = 0
    })
  }
}

// Export singleton
export const soundManager = new SoundManager()
