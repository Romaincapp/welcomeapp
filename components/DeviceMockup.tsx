'use client'

import { useRef, useState, useCallback } from 'react'

interface DeviceMockupProps {
  url: string
  className?: string
}

export default function DeviceMockup({ url, className = '' }: DeviceMockupProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [showCursor, setShowCursor] = useState(false)

  const dragStart = useRef({ x: 0, y: 0 })
  const lastPos = useRef({ x: 0, y: 0 })
  const totalMovement = useRef(0)

  const DRAG_THRESHOLD = 5 // pixels avant de considérer comme drag

  const handleMouseEnter = () => setShowCursor(true)
  const handleMouseLeave = () => {
    setShowCursor(false)
    setIsDragging(false)
  }

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = overlayRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setCursorPos({ x, y })

    if (isDragging) {
      const deltaX = lastPos.current.x - e.clientX
      const deltaY = lastPos.current.y - e.clientY

      totalMovement.current += Math.abs(deltaX) + Math.abs(deltaY)

      // Envoyer le scroll à l'iframe avec position du curseur
      iframeRef.current?.contentWindow?.postMessage({
        type: 'scroll',
        deltaX,
        deltaY,
        cursorX: x,
        cursorY: y
      }, '*')

      lastPos.current = { x: e.clientX, y: e.clientY }
    }
  }, [isDragging])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY }
    lastPos.current = { x: e.clientX, y: e.clientY }
    totalMovement.current = 0
  }, [])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    const wasDragging = totalMovement.current > DRAG_THRESHOLD
    setIsDragging(false)

    // Si pas de mouvement significatif = clic
    if (!wasDragging) {
      const rect = overlayRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Envoyer le clic à l'iframe
      iframeRef.current?.contentWindow?.postMessage({
        type: 'click',
        x,
        y
      }, '*')
    }
  }, [])

  return (
    <div className={`relative ${className}`}>
      {/* Container principal avec dimensions fixes */}
      <div className="relative mx-auto w-[300px] h-[620px]">

        {/* Cadre extérieur - derrière l'iframe */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 rounded-[2.8rem] shadow-2xl" />
        <div className="absolute inset-[3px] bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 rounded-[2.6rem]" />
        <div className="absolute inset-[5px] bg-black rounded-[2.5rem]" />

        {/* iframe */}
        <iframe
          ref={iframeRef}
          src={url}
          className="absolute inset-[8px] rounded-[2.3rem] border-0 z-10 bg-white pointer-events-none"
          style={{
            width: 'calc(100% - 16px)',
            height: 'calc(100% - 16px)',
          }}
          title="WelcomeApp Demo Preview"
          loading="lazy"
        />

        {/* Overlay interactif avec curseur tactile */}
        <div
          ref={overlayRef}
          className="absolute inset-[8px] rounded-[2.3rem] z-20"
          style={{
            width: 'calc(100% - 16px)',
            height: 'calc(100% - 16px)',
            cursor: 'none',
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          {/* Curseur tactile (cercle) */}
          {showCursor && (
            <div
              className="pointer-events-none absolute transition-transform duration-75"
              style={{
                left: cursorPos.x - 12,
                top: cursorPos.y - 12,
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: isDragging ? 'rgba(99, 102, 241, 0.5)' : 'rgba(99, 102, 241, 0.3)',
                border: '2px solid rgba(99, 102, 241, 0.8)',
                transform: isDragging ? 'scale(0.8)' : 'scale(1)',
              }}
            />
          )}
        </div>

        {/* Side buttons */}
        <div className="absolute -left-[2px] top-28 w-[2px] h-6 bg-gray-600 rounded-l-sm z-30 pointer-events-none" />
        <div className="absolute -left-[2px] top-40 w-[2px] h-10 bg-gray-600 rounded-l-sm z-30 pointer-events-none" />
        <div className="absolute -left-[2px] top-56 w-[2px] h-10 bg-gray-600 rounded-l-sm z-30 pointer-events-none" />
        <div className="absolute -right-[2px] top-36 w-[2px] h-14 bg-gray-600 rounded-r-sm z-30 pointer-events-none" />
      </div>

      {/* Subtle glow effect */}
      <div className="absolute -inset-4 bg-white/5 blur-3xl rounded-full pointer-events-none -z-10" />
    </div>
  )
}
