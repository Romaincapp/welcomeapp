'use client'

import { useState, useEffect } from 'react'
import { Bomb, Undo } from 'lucide-react'
import { soundManager } from '@/lib/sounds'

interface DeleteToastProps {
  show: boolean
  tipTitle: string
  countdown: number // Nombre de secondes avant suppression
  onUndo: () => void
  onComplete: () => void
}

export default function DeleteToast({
  show,
  tipTitle,
  countdown: initialCountdown,
  onUndo,
  onComplete
}: DeleteToastProps) {
  const [count, setCount] = useState(initialCountdown)

  useEffect(() => {
    if (!show) {
      setCount(initialCountdown)
      return
    }

    console.log('[DELETE TOAST] ⏱️ Décompte démarré:', initialCountdown)

    // Son de suppression au début
    soundManager.play('delete')

    // Décompte
    const timer = setInterval(() => {
      setCount(prev => {
        const newCount = prev - 1

        // Si décompte terminé
        if (newCount <= 0) {
          clearInterval(timer)
          console.log('[DELETE TOAST] 💥 BOOM ! Suppression...')
          setTimeout(() => {
            onComplete()
          }, 100)
          return 0
        }

        return newCount
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [show, initialCountdown, onComplete])

  if (!show) return null

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] animate-slide-up">
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-red-400 flex items-center gap-4 min-w-[350px] max-w-md">
        {/* Icône bombe qui pulse */}
        <div className={`${count <= 1 ? 'animate-bounce' : 'animate-pulse'}`}>
          <Bomb className="w-8 h-8" />
        </div>

        {/* Contenu */}
        <div className="flex-1">
          <p className="font-bold text-lg truncate">{tipTitle}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="text-sm font-semibold">
              Suppression dans
            </div>
            <div
              className={`
                w-10 h-10 rounded-full border-4 border-white
                flex items-center justify-center font-black text-xl
                ${count <= 1 ? 'bg-yellow-400 text-red-900 animate-pulse' : 'bg-red-900'}
              `}
            >
              {count}
            </div>
            <div className="text-sm font-semibold">s...</div>
          </div>
        </div>

        {/* Bouton Annuler */}
        <button
          onClick={() => {
            console.log('[DELETE TOAST] ↩️ Annulation de la suppression')
            onUndo()
          }}
          className="px-5 py-3 bg-white text-red-600 rounded-xl font-bold hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg"
        >
          <Undo className="w-5 h-5" />
          Annuler
        </button>
      </div>
    </div>
  )
}
