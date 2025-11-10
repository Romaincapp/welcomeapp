import React from 'react'
import type { PhotoFrameStyle } from '@/types'

interface PhotoFrameProps {
  frameStyle?: PhotoFrameStyle
  children: React.ReactNode
  className?: string
}

/**
 * Cadre photo décoratif autour du QR code
 * Styles adaptés à chaque catégorie de template
 */
export function PhotoFrame({ frameStyle, children, className = '' }: PhotoFrameProps) {
  // Pas de cadre si non spécifié ou type 'none'
  if (!frameStyle || frameStyle.type === 'none') {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={`relative ${className}`}>
      {frameStyle.type === 'simple' && <SimpleFrame {...frameStyle}>{children}</SimpleFrame>}
      {frameStyle.type === 'gradient' && <GradientFrame {...frameStyle}>{children}</GradientFrame>}
      {frameStyle.type === 'decorative' && <DecorativeFrame {...frameStyle}>{children}</DecorativeFrame>}
    </div>
  )
}

/**
 * Cadre simple avec bordure unie (Minimalist)
 */
function SimpleFrame({
  borderWidth,
  borderColor,
  borderRadius,
  shadowColor,
  children,
}: Extract<PhotoFrameStyle, { type: 'simple' }> & { children: React.ReactNode }) {
  return (
    <div
      className="relative p-2"
      style={{
        border: `${borderWidth} solid ${borderColor}`,
        borderRadius,
        boxShadow: shadowColor
          ? `0 4px 12px ${shadowColor}, 0 2px 4px ${shadowColor}`
          : '0 2px 8px rgba(0, 0, 0, 0.06)',
      }}
    >
      {children}
    </div>
  )
}

/**
 * Cadre gradient avec effet glow (Modern)
 */
function GradientFrame({
  gradientColors,
  borderWidth,
  glowColor,
  angle = 135,
  children,
}: Extract<PhotoFrameStyle, { type: 'gradient' }> & { children: React.ReactNode }) {
  const gradientString = `linear-gradient(${angle}deg, ${gradientColors.join(', ')})`

  return (
    <div className="relative p-1" style={{ background: gradientString, borderRadius: '12px' }}>
      {glowColor && (
        <div
          className="absolute inset-0 -z-10 blur-xl"
          style={{
            background: gradientString,
            opacity: 0.4,
          }}
        />
      )}
      <div
        className="relative bg-white"
        style={{
          borderRadius: '10px',
          padding: borderWidth,
        }}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * Cadre décoratif avec coins ornés (Elegant, Festive, Vacation)
 */
function DecorativeFrame({
  cornerSize,
  cornerColor,
  borderColor,
  borderWidth,
  children,
}: Extract<PhotoFrameStyle, { type: 'decorative' }> & { children: React.ReactNode }) {
  return (
    <div
      className="relative p-4"
      style={{
        border: `${borderWidth} solid ${borderColor}`,
        borderRadius: '8px',
      }}
    >
      {/* Coin supérieur gauche */}
      <div className="absolute top-0 left-0 pointer-events-none" style={{ width: cornerSize, height: cornerSize }}>
        <svg viewBox="0 0 100 100" fill={cornerColor} opacity="0.4">
          <path d="M0,0 Q30,0 30,30 L15,30 Q15,15 0,15 Z" />
        </svg>
      </div>

      {/* Coin supérieur droit */}
      <div className="absolute top-0 right-0 pointer-events-none" style={{ width: cornerSize, height: cornerSize }}>
        <svg viewBox="0 0 100 100" fill={cornerColor} opacity="0.4">
          <path d="M100,0 Q70,0 70,30 L85,30 Q85,15 100,15 Z" />
        </svg>
      </div>

      {/* Coin inférieur gauche */}
      <div className="absolute bottom-0 left-0 pointer-events-none" style={{ width: cornerSize, height: cornerSize }}>
        <svg viewBox="0 0 100 100" fill={cornerColor} opacity="0.4">
          <path d="M0,100 Q30,100 30,70 L15,70 Q15,85 0,85 Z" />
        </svg>
      </div>

      {/* Coin inférieur droit */}
      <div className="absolute bottom-0 right-0 pointer-events-none" style={{ width: cornerSize, height: cornerSize }}>
        <svg viewBox="0 0 100 100" fill={cornerColor} opacity="0.4">
          <path d="M100,100 Q70,100 70,70 L85,70 Q85,85 100,85 Z" />
        </svg>
      </div>

      {children}
    </div>
  )
}
