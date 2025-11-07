import { QRTemplate } from '@/types'

/**
 * Templates modern - Design contemporain et audacieux
 */

export const techGradientTemplate: QRTemplate = {
  id: 'modern-tech-gradient',
  name: 'Tech Gradient',
  category: 'modern',
  config: {
    background: {
      type: 'gradient',
      colors: ['#1e1b4b', '#312e81', '#4c1d95'],
      pattern: 'none',
    },
    typography: {
      titleFont: '"Orbitron", sans-serif',
      titleSize: '2.8rem',
      titleColor: '#ffffff',
      bodyFont: '"Inter", sans-serif',
      bodySize: '1.1rem',
      bodyColor: '#e0e7ff',
    },
    qrStyle: {
      position: 'center',
      size: 'large',
      defaultColor: '#8b5cf6',
      frameStyle: 'rounded',
    },
    decorations: [
      {
        type: 'icon',
        element: 'hexagon',
        position: { x: '8%', y: '10%' },
        size: '100px',
        color: '#a78bfa',
        opacity: 0.15,
      },
      {
        type: 'icon',
        element: 'hexagon',
        position: { x: '80%', y: '78%' },
        size: '120px',
        color: '#c4b5fd',
        opacity: 0.12,
      },
      {
        type: 'icon',
        element: 'lightning',
        position: { x: '85%', y: '12%' },
        size: '65px',
        color: '#fbbf24',
        opacity: 0.25,
      },
      {
        type: 'icon',
        element: 'grid',
        position: { x: '0%', y: '0%' },
        size: '100%',
        color: '#818cf8',
        opacity: 0.08,
      },
    ],
    layout: {
      orientation: 'portrait',
      contentAlignment: 'center',
      spacing: '2rem',
    },
  },
}

export const boldGeometricTemplate: QRTemplate = {
  id: 'modern-bold-geometric',
  name: 'Bold Geometric',
  category: 'modern',
  config: {
    background: {
      type: 'gradient',
      colors: ['#fed7aa', '#fbbf24', '#f59e0b'],
      pattern: 'none',
    },
    typography: {
      titleFont: '"Space Grotesk", sans-serif',
      titleSize: '3rem',
      titleColor: '#1e293b',
      bodyFont: '"Inter", sans-serif',
      bodySize: '1.2rem',
      bodyColor: '#334155',
    },
    qrStyle: {
      position: 'center',
      size: 'large',
      defaultColor: '#0f172a',
      frameStyle: 'square',
    },
    decorations: [
      {
        type: 'icon',
        element: 'square',
        position: { x: '5%', y: '8%' },
        size: '90px',
        color: '#ea580c',
        opacity: 0.2,
      },
      {
        type: 'icon',
        element: 'triangle',
        position: { x: '78%', y: '10%' },
        size: '100px',
        color: '#dc2626',
        opacity: 0.18,
      },
      {
        type: 'icon',
        element: 'circle',
        position: { x: '10%', y: '75%' },
        size: '110px',
        color: '#f59e0b',
        opacity: 0.25,
      },
      {
        type: 'icon',
        element: 'hexagon',
        position: { x: '80%', y: '80%' },
        size: '85px',
        color: '#d97706',
        opacity: 0.22,
      },
    ],
    layout: {
      orientation: 'portrait',
      contentAlignment: 'center',
      spacing: '2.5rem',
    },
  },
}

export const neonPopTemplate: QRTemplate = {
  id: 'modern-neon-pop',
  name: 'Neon Pop',
  category: 'modern',
  config: {
    background: {
      type: 'solid',
      colors: ['#0f172a'],
      pattern: 'none',
    },
    typography: {
      titleFont: '"Rubik", sans-serif',
      titleSize: '3.2rem',
      titleColor: '#06b6d4',
      bodyFont: '"Inter", sans-serif',
      bodySize: '1.2rem',
      bodyColor: '#67e8f9',
    },
    qrStyle: {
      position: 'center',
      size: 'large',
      defaultColor: '#22d3ee',
      frameStyle: 'rounded',
    },
    decorations: [
      {
        type: 'icon',
        element: 'circle',
        position: { x: '8%', y: '12%' },
        size: '80px',
        color: '#ec4899',
        opacity: 0.35,
      },
      {
        type: 'icon',
        element: 'circle',
        position: { x: '82%', y: '15%' },
        size: '70px',
        color: '#a855f7',
        opacity: 0.3,
      },
      {
        type: 'icon',
        element: 'lightning',
        position: { x: '12%', y: '78%' },
        size: '75px',
        color: '#fbbf24',
        opacity: 0.4,
      },
      {
        type: 'icon',
        element: 'sparkle',
        position: { x: '78%', y: '75%' },
        size: '85px',
        color: '#06b6d4',
        opacity: 0.35,
      },
      {
        type: 'icon',
        element: 'waves',
        position: { x: '0%', y: '50%' },
        size: '100%',
        color: '#0ea5e9',
        opacity: 0.1,
      },
    ],
    layout: {
      orientation: 'portrait',
      contentAlignment: 'center',
      spacing: '2rem',
    },
  },
}

export const modernTemplates = [
  techGradientTemplate,
  boldGeometricTemplate,
  neonPopTemplate,
]
