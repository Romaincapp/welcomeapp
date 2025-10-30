/**
 * Générateur de sons synthétiques (fallback si les MP3 ne sont pas disponibles)
 * Utilise l'API Web Audio pour générer des sons simples
 */

export type SoundType = 'success' | 'badge' | 'delete' | 'flip'

class SyntheticSoundGenerator {
  private audioContext: AudioContext | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }

  /**
   * Joue un son synthétique
   */
  play(type: SoundType) {
    if (!this.audioContext) return

    const ctx = this.audioContext
    const now = ctx.currentTime

    switch (type) {
      case 'success':
        this.playSuccessSound(ctx, now)
        break
      case 'badge':
        this.playBadgeSound(ctx, now)
        break
      case 'delete':
        this.playDeleteSound(ctx, now)
        break
      case 'flip':
        this.playFlipSound(ctx, now)
        break
    }
  }

  /**
   * Son de succès : Ding (440Hz → 880Hz)
   */
  private playSuccessSound(ctx: AudioContext, now: number) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.frequency.setValueAtTime(440, now)
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.1)

    gain.gain.setValueAtTime(0.3, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)

    osc.start(now)
    osc.stop(now + 0.15)
  }

  /**
   * Son de badge : Fanfare (3 notes montantes)
   */
  private playBadgeSound(ctx: AudioContext, now: number) {
    const notes = [523.25, 659.25, 783.99] // C5, E5, G5

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.frequency.setValueAtTime(freq, now + i * 0.1)
      gain.gain.setValueAtTime(0.2, now + i * 0.1)
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.2)

      osc.start(now + i * 0.1)
      osc.stop(now + i * 0.1 + 0.2)
    })
  }

  /**
   * Son de suppression : Poof (bruit blanc descendant)
   */
  private playDeleteSound(ctx: AudioContext, now: number) {
    const bufferSize = ctx.sampleRate * 0.15
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = buffer.getChannelData(0)

    // Générer du bruit blanc
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1
    }

    const noise = ctx.createBufferSource()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    noise.buffer = buffer
    noise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    // Filtre passe-bas descendant (son qui s'éteint)
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(5000, now)
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.15)

    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)

    noise.start(now)
    noise.stop(now + 0.15)
  }

  /**
   * Son de flip : Whoosh rapide
   */
  private playFlipSound(ctx: AudioContext, now: number) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.frequency.setValueAtTime(400, now)
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.1)

    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1)

    osc.start(now)
    osc.stop(now + 0.1)
  }
}

export const syntheticSoundGenerator = new SyntheticSoundGenerator()
