'use client'

import { useEffect, useState } from 'react'
import Confetti from 'react-confetti'
import { BadgeInfo } from '@/lib/badge-detector'
import { soundManager } from '@/lib/sounds'

interface AnimationOverlayProps {
  show: boolean
  type: 'add' | 'batch'
  onComplete: () => void
  badge?: BadgeInfo | null
  count?: number // Nombre de conseils ajoutés (pour ajout masse)
}

export default function AnimationOverlay({
  show,
  type,
  onComplete,
  badge,
  count = 1
}: AnimationOverlayProps) {
  const [phase, setPhase] = useState<'confetti' | 'xp' | 'badge' | 'complete'>('confetti')
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  // Mettre à jour la taille de la fenêtre pour les confettis
  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  useEffect(() => {
    if (!show) {
      setPhase('confetti')
      return
    }

    console.log('[ANIMATION] 🎬 Démarrage animation', { type, badge, count })

    // Workflow des phases
    if (type === 'add') {
      // Son de succès
      soundManager.play('success')

      // 1. Confetti + Animation "+1"
      setPhase('confetti')

      // 2. Badge après 1.5s (si débloqué)
      if (badge) {
        setTimeout(() => {
          setPhase('badge')
          soundManager.play('badge')
        }, 1500)

        // 3. Terminer après 3.5s total (1.5s + 2s de badge)
        setTimeout(() => {
          setPhase('complete')
          onComplete()
        }, 3500)
      } else {
        // Terminer après 1.5s si pas de badge
        setTimeout(() => {
          setPhase('complete')
          onComplete()
        }, 1500)
      }
    } else if (type === 'batch') {
      // Ajout en masse : confetti plus long
      setPhase('confetti')

      // Son de succès
      soundManager.play('success')

      // Badge après 2s (si débloqué)
      if (badge) {
        setTimeout(() => {
          setPhase('badge')
          soundManager.play('badge')
        }, 2000)

        // Terminer après 4s total
        setTimeout(() => {
          setPhase('complete')
          onComplete()
        }, 4000)
      } else {
        // Terminer après 2s si pas de badge
        setTimeout(() => {
          setPhase('complete')
          onComplete()
        }, 2000)
      }
    }
  }, [show, type, badge, count, onComplete])

  if (!show || phase === 'complete') return null

  return (
    <>
      {/* Confetti */}
      {(phase === 'confetti' || phase === 'xp') && (
        <div className="fixed inset-0 z-[10000] pointer-events-none">
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={type === 'batch' ? 300 : 200}
            gravity={0.15}
          />
        </div>
      )}

      {/* Animation "+X" qui vole vers le haut (comme XP dans un jeu) */}
      {type === 'add' && phase === 'confetti' && (
        <div className="fixed inset-0 z-[10001] pointer-events-none flex items-center justify-center px-4">
          <div className="animate-float-up-xp text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-green-500 drop-shadow-2xl">
            +{count}
          </div>
        </div>
      )}

      {/* Message pour ajout en masse */}
      {type === 'batch' && phase === 'confetti' && (
        <div className="fixed inset-0 z-[10001] pointer-events-none flex items-center justify-center px-4">
          <div className="animate-scale-in-bounce bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl px-6 py-6 sm:px-12 sm:py-8 shadow-2xl border-2 sm:border-4 border-green-500 max-w-sm sm:max-w-md">
            <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-green-600 mb-2">
              +{count} conseils
            </div>
            <div className="text-base sm:text-xl md:text-2xl text-gray-600 font-semibold">
              Ajoutés avec succès ! 🎉
            </div>
          </div>
        </div>
      )}

      {/* Badge débloqué (bloquant 2s) */}
      {phase === 'badge' && badge && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[10002] animate-fade-in px-4">
          <div
            className={`bg-gradient-to-br ${badge.color} rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center animate-scale-in-bounce shadow-2xl max-w-xs sm:max-w-md`}
          >
            <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl mb-4 sm:mb-6 animate-bounce">{badge.icon}</div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 sm:mb-4 drop-shadow-lg">
              Badge débloqué !
            </h2>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white/90">{badge.title}</p>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/75 mt-3 sm:mt-4">{badge.description}</p>
          </div>
        </div>
      )}
    </>
  )
}
