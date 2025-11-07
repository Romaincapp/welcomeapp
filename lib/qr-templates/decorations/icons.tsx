import React from 'react'

/**
 * Bibliothèque d'icônes SVG décoratives pour les templates QR Code
 * Utilisées comme éléments visuels (pastilles) pour embellir les designs
 */

export const DecorationIcons = {
  // VACATION - Beach/Summer
  'palm-tree': (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 85 L50 45 M50 45 Q30 35 20 25 Q25 30 35 35 Q40 38 50 45 M50 45 Q70 35 80 25 Q75 30 65 35 Q60 38 50 45 M50 45 Q45 25 40 15 Q42 22 47 30 Q49 35 50 45 M50 45 Q55 25 60 15 Q58 22 53 30 Q51 35 50 45 M45 85 L55 85 Q55 90 50 95 Q45 90 45 85 Z" />
    </svg>
  ),
  'beach-umbrella': (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 30 Q30 30 20 40 Q25 35 35 32 Q40 30 50 30 M50 30 Q70 30 80 40 Q75 35 65 32 Q60 30 50 30 M50 30 L50 85 M45 85 L55 85 M30 40 Q35 42 42 43 M58 43 Q65 42 70 40 M50 30 L25 45 M50 30 L75 45"
        strokeWidth="2" stroke="currentColor" fill="none"/>
      <ellipse cx="50" cy="32" rx="28" ry="8" opacity="0.3"/>
    </svg>
  ),
  'surfboard': (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="50" rx="12" ry="40" transform="rotate(30 50 50)"/>
      <path d="M35 25 L65 75" stroke="white" strokeWidth="2" opacity="0.5"/>
    </svg>
  ),
  'sun': (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="18"/>
      <g opacity="0.7">
        <line x1="50" y1="10" x2="50" y2="25" strokeWidth="3" stroke="currentColor"/>
        <line x1="50" y1="75" x2="50" y2="90" strokeWidth="3" stroke="currentColor"/>
        <line x1="10" y1="50" x2="25" y2="50" strokeWidth="3" stroke="currentColor"/>
        <line x1="75" y1="50" x2="90" y2="50" strokeWidth="3" stroke="currentColor"/>
        <line x1="20" y1="20" x2="32" y2="32" strokeWidth="3" stroke="currentColor"/>
        <line x1="68" y1="68" x2="80" y2="80" strokeWidth="3" stroke="currentColor"/>
        <line x1="80" y1="20" x2="68" y2="32" strokeWidth="3" stroke="currentColor"/>
        <line x1="32" y1="68" x2="20" y2="80" strokeWidth="3" stroke="currentColor"/>
      </g>
    </svg>
  ),

  // VACATION - Mountains/Nature
  'mountain-peak': (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 80 L35 30 L50 50 L65 20 L90 80 Z"/>
      <path d="M35 30 L45 40 L40 45 Z" fill="white" opacity="0.4"/>
      <path d="M65 20 L72 32 L68 35 Z" fill="white" opacity="0.4"/>
    </svg>
  ),
  'pine-tree': (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 10 L30 35 L35 35 L20 55 L25 55 L15 75 L85 75 L75 55 L80 55 L65 35 L70 35 Z"/>
      <rect x="45" y="75" width="10" height="15" fill="currentColor" opacity="0.7"/>
    </svg>
  ),
  'tent': (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 20 L20 70 L80 70 Z"/>
      <path d="M50 20 L50 70" stroke="white" strokeWidth="2" opacity="0.3"/>
      <path d="M35 50 L65 50" stroke="white" strokeWidth="1.5" opacity="0.2"/>
    </svg>
  ),
  'campfire': (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 30 Q40 40 45 55 Q48 45 50 50 Q52 45 55 55 Q60 40 50 30 Z"/>
      <path d="M30 70 L40 60 L35 60 L42 55" strokeWidth="2" stroke="currentColor" fill="none"/>
      <path d="M70 70 L60 60 L65 60 L58 55" strokeWidth="2" stroke="currentColor" fill="none"/>
      <ellipse cx="50" cy="72" rx="25" ry="4" opacity="0.3"/>
    </svg>
  ),

  // VACATION - City/Urban
  'city-building': (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="40" width="20" height="50"/>
      <rect x="45" y="20" width="20" height="70"/>
      <rect x="70" y="50" width="15" height="40"/>
      <g opacity="0.5" fill="white">
        <rect x="25" y="45" width="4" height="5"/>
        <rect x="32" y="45" width="4" height="5"/>
        <rect x="25" y="55" width="4" height="5"/>
        <rect x="32" y="55" width="4" height="5"/>
        <rect x="50" y="25" width="4" height="5"/>
        <rect x="57" y="25" width="4" height="5"/>
        <rect x="50" y="35" width="4" height="5"/>
        <rect x="57" y="35" width="4" height="5"/>
        <rect x="73" y="55" width="3" height="4"/>
        <rect x="73" y="63" width="3" height="4"/>
      </g>
    </svg>
  ),
  'eiffel-tower': (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 10 L40 45 L45 45 L35 90 L65 90 L55 45 L60 45 Z"/>
      <rect x="38" y="50" width="24" height="2" opacity="0.5"/>
      <rect x="40" y="65" width="20" height="2" opacity="0.5"/>
    </svg>
  ),
  'plane': (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 50 L50 35 L50 25 L55 25 L55 35 L80 45 L80 50 L55 45 L55 60 L62 65 L62 68 L55 66 L50 66 L43 68 L43 65 L50 60 L50 45 L25 55 Z"/>
    </svg>
  ),
  'compass': (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M50 20 L45 45 L50 50 L55 45 Z"/>
      <path d="M50 80 L55 55 L50 50 L45 55 Z" opacity="0.5"/>
      <circle cx="50" cy="50" r="4"/>
      <text x="50" y="18" fontSize="10" textAnchor="middle" fill="currentColor">N</text>
    </svg>
  ),

  // ELEGANT - Decorative
  'flower': (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="8"/>
      <ellipse cx="50" cy="30" rx="10" ry="18" opacity="0.7"/>
      <ellipse cx="70" cy="50" rx="18" ry="10" opacity="0.7"/>
      <ellipse cx="50" cy="70" rx="10" ry="18" opacity="0.7"/>
      <ellipse cx="30" cy="50" rx="18" ry="10" opacity="0.7"/>
      <ellipse cx="35" cy="35" rx="14" ry="14" transform="rotate(45 35 35)" opacity="0.6"/>
      <ellipse cx="65" cy="35" rx="14" ry="14" transform="rotate(-45 65 35)" opacity="0.6"/>
      <ellipse cx="65" cy="65" rx="14" ry="14" transform="rotate(45 65 65)" opacity="0.6"/>
      <ellipse cx="35" cy="65" rx="14" ry="14" transform="rotate(-45 35 65)" opacity="0.6"/>
    </svg>
  ),
  'leaf': (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 80 Q20 30 70 20 Q70 40 50 50 L20 80 Z"/>
      <path d="M25 75 Q35 50 60 30" stroke="currentColor" strokeWidth="1" opacity="0.3" fill="none"/>
    </svg>
  ),
  'butterfly': (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="35" cy="40" rx="18" ry="25" opacity="0.8"/>
      <ellipse cx="65" cy="40" rx="18" ry="25" opacity="0.8"/>
      <ellipse cx="35" cy="65" rx="12" ry="18" opacity="0.7"/>
      <ellipse cx="65" cy="65" rx="12" ry="18" opacity="0.7"/>
      <rect x="48" y="30" width="4" height="50" rx="2"/>
      <circle cx="50" cy="28" r="4"/>
    </svg>
  ),
  'star': (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 10 L60 40 L92 40 L67 60 L77 90 L50 70 L23 90 L33 60 L8 40 L40 40 Z"/>
    </svg>
  ),

  // FESTIVE - Celebrations
  'balloon': (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="40" rx="20" ry="28"/>
      <path d="M50 68 Q45 75 40 90" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M50 68 L50 75" stroke="white" strokeWidth="1" opacity="0.3"/>
    </svg>
  ),
  'confetti': (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="25" width="8" height="3" transform="rotate(20 24 26.5)" opacity="0.8"/>
      <rect x="60" y="15" width="3" height="8" transform="rotate(45 61.5 19)" opacity="0.7"/>
      <circle cx="40" cy="40" r="3" opacity="0.9"/>
      <rect x="70" y="35" width="6" height="3" transform="rotate(-30 73 36.5)" opacity="0.8"/>
      <circle cx="30" cy="60" r="4" opacity="0.7"/>
      <rect x="55" y="55" width="3" height="7" transform="rotate(60 56.5 58.5)" opacity="0.8"/>
      <circle cx="75" cy="65" r="3" opacity="0.9"/>
      <rect x="25" y="80" width="5" height="3" transform="rotate(-15 27.5 81.5)" opacity="0.7"/>
      <circle cx="50" cy="75" r="3" opacity="0.8"/>
      <rect x="65" y="80" width="3" height="6" transform="rotate(30 66.5 83)" opacity="0.8"/>
    </svg>
  ),
  'gift': (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="40" width="40" height="45" rx="2"/>
      <rect x="25" y="35" width="50" height="10" rx="1"/>
      <path d="M50 35 L50 85" stroke="white" strokeWidth="3" opacity="0.3"/>
      <path d="M25 40 L75 40" stroke="white" strokeWidth="2" opacity="0.3"/>
      <path d="M50 35 Q45 25 35 25 Q30 25 30 30 Q30 35 40 35 L50 35" opacity="0.7"/>
      <path d="M50 35 Q55 25 65 25 Q70 25 70 30 Q70 35 60 35 L50 35" opacity="0.7"/>
    </svg>
  ),
  'sparkle': (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 20 L53 45 L50 50 L47 45 Z"/>
      <path d="M50 80 L47 55 L50 50 L53 55 Z"/>
      <path d="M20 50 L45 53 L50 50 L45 47 Z"/>
      <path d="M80 50 L55 47 L50 50 L55 53 Z"/>
      <path d="M30 30 L45 43 L50 45 L48 40 Z"/>
      <path d="M70 70 L55 57 L50 55 L52 60 Z"/>
      <path d="M70 30 L55 43 L50 45 L52 40 Z"/>
      <path d="M30 70 L45 57 L50 55 L48 60 Z"/>
    </svg>
  ),

  // MINIMALIST - Simple shapes
  'circle': (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="35" opacity="0.15"/>
    </svg>
  ),
  'square': (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="20" width="60" height="60" rx="4" opacity="0.15"/>
    </svg>
  ),
  'triangle': (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 20 L80 80 L20 80 Z" opacity="0.15"/>
    </svg>
  ),
  'dots': (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="25" cy="25" r="4" opacity="0.2"/>
      <circle cx="50" cy="25" r="4" opacity="0.2"/>
      <circle cx="75" cy="25" r="4" opacity="0.2"/>
      <circle cx="25" cy="50" r="4" opacity="0.2"/>
      <circle cx="50" cy="50" r="4" opacity="0.2"/>
      <circle cx="75" cy="50" r="4" opacity="0.2"/>
      <circle cx="25" cy="75" r="4" opacity="0.2"/>
      <circle cx="50" cy="75" r="4" opacity="0.2"/>
      <circle cx="75" cy="75" r="4" opacity="0.2"/>
    </svg>
  ),

  // MODERN - Geometric
  'hexagon': (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 15 L80 35 L80 65 L50 85 L20 65 L20 35 Z" opacity="0.2"/>
    </svg>
  ),
  'waves': (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 30 Q25 20 50 30 T100 30" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
      <path d="M0 50 Q25 40 50 50 T100 50" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
      <path d="M0 70 Q25 60 50 70 T100 70" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
    </svg>
  ),
  'grid': (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
      <line x1="33" y1="0" x2="33" y2="100" strokeWidth="1" opacity="0.15"/>
      <line x1="67" y1="0" x2="67" y2="100" strokeWidth="1" opacity="0.15"/>
      <line x1="0" y1="33" x2="100" y2="33" strokeWidth="1" opacity="0.15"/>
      <line x1="0" y1="67" x2="100" y2="67" strokeWidth="1" opacity="0.15"/>
    </svg>
  ),
  'lightning': (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 10 L35 50 L50 50 L40 90 L70 45 L55 45 Z"/>
    </svg>
  ),
}

/**
 * Composant pour afficher un élément décoratif
 */
interface DecorationElementProps {
  decoration: {
    type: 'icon' | 'shape' | 'pattern'
    element: string
    position: { x: string; y: string }
    size: string
    color: string
    opacity: number
  }
}

export function DecorationElement({ decoration }: DecorationElementProps) {
  const IconComponent = DecorationIcons[decoration.element as keyof typeof DecorationIcons]

  if (!IconComponent) {
    console.warn(`Icon "${decoration.element}" not found in DecorationIcons`)
    return null
  }

  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{
        left: decoration.position.x,
        top: decoration.position.y,
        width: decoration.size,
        height: decoration.size,
        color: decoration.color,
        opacity: decoration.opacity,
      }}
      aria-hidden="true"
    >
      {IconComponent}
    </div>
  )
}
