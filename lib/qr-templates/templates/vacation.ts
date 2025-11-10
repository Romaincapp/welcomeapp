import { QRTemplate } from '@/types'

/**
 * Templates vacation - Thèmes pour locations de vacances
 */

export const beachParadiseTemplate: QRTemplate = {
  id: 'vacation-beach-paradise',
  name: 'Beach Paradise',
  category: 'vacation',
  config: {
    background: {
      type: 'gradient',
      colors: ['#e0f2fe', '#fef3c7', '#fed7aa'],
      pattern: 'none',
    },
    typography: {
      titleFont: '"Pacifico", cursive',
      titleSize: '3rem',
      titleColor: '#0c4a6e',
      bodyFont: '"Inter", sans-serif',
      bodySize: '1.2rem',
      bodyColor: '#475569',
    },
    qrStyle: {
      position: 'center',
      size: 'large',
      defaultColor: '#0ea5e9',
      frameStyle: 'rounded',
      photoFrame: {
        type: 'decorative',
        cornerSize: '80px',
        cornerColor: '#0ea5e9',
        borderColor: '#bae6fd',
        borderWidth: '3px',
      },
    },
    decorations: [
      {
        type: 'icon',
        element: 'palm-tree',
        position: { x: '5%', y: '5%' },
        size: '90px',
        color: '#22c55e',
        opacity: 0.35,
      },
      {
        type: 'icon',
        element: 'beach-umbrella',
        position: { x: '82%', y: '85%' },
        size: '110px',
        color: '#f97316',
        opacity: 0.25,
      },
      {
        type: 'icon',
        element: 'sun',
        position: { x: '80%', y: '8%' },
        size: '70px',
        color: '#fbbf24',
        opacity: 0.4,
      },
      {
        type: 'icon',
        element: 'waves',
        position: { x: '0%', y: '70%' },
        size: '100%',
        color: '#38bdf8',
        opacity: 0.15,
      },
    ],
    layout: {
      orientation: 'portrait',
      contentAlignment: 'center',
      spacing: '2rem',
    },
  },
}

export const mountainLodgeTemplate: QRTemplate = {
  id: 'vacation-mountain-lodge',
  name: 'Mountain Lodge',
  category: 'vacation',
  config: {
    background: {
      type: 'solid',
      colors: ['#f8fafc'],
      pattern: 'none',
    },
    typography: {
      titleFont: '"Montserrat", sans-serif',
      titleSize: '2.5rem',
      titleColor: '#1e293b',
      bodyFont: '"Inter", sans-serif',
      bodySize: '1.1rem',
      bodyColor: '#64748b',
    },
    qrStyle: {
      position: 'center',
      size: 'medium',
      defaultColor: '#334155',
      frameStyle: 'square',
      photoFrame: {
        type: 'simple',
        borderWidth: '3px',
        borderColor: '#94a3b8',
        borderRadius: '8px',
        shadowColor: 'rgba(51, 65, 85, 0.1)',
      },
    },
    decorations: [
      {
        type: 'icon',
        element: 'mountain-peak',
        position: { x: '50%', y: '10%' },
        size: '180px',
        color: '#475569',
        opacity: 0.12,
      },
      {
        type: 'icon',
        element: 'pine-tree',
        position: { x: '8%', y: '78%' },
        size: '70px',
        color: '#15803d',
        opacity: 0.28,
      },
      {
        type: 'icon',
        element: 'pine-tree',
        position: { x: '82%', y: '82%' },
        size: '85px',
        color: '#166534',
        opacity: 0.22,
      },
      {
        type: 'icon',
        element: 'tent',
        position: { x: '10%', y: '15%' },
        size: '55px',
        color: '#7c3aed',
        opacity: 0.18,
      },
    ],
    layout: {
      orientation: 'portrait',
      contentAlignment: 'top',
      spacing: '3rem',
    },
  },
}

export const cityExplorerTemplate: QRTemplate = {
  id: 'vacation-city-explorer',
  name: 'City Explorer',
  category: 'vacation',
  config: {
    background: {
      type: 'gradient',
      colors: ['#f1f5f9', '#e2e8f0'],
      pattern: 'grid',
    },
    typography: {
      titleFont: '"Poppins", sans-serif',
      titleSize: '2.8rem',
      titleColor: '#0f172a',
      bodyFont: '"Inter", sans-serif',
      bodySize: '1.1rem',
      bodyColor: '#475569',
    },
    qrStyle: {
      position: 'center',
      size: 'large',
      defaultColor: '#1e40af',
      frameStyle: 'square',
      photoFrame: {
        type: 'simple',
        borderWidth: '2px',
        borderColor: '#cbd5e1',
        borderRadius: '4px',
        shadowColor: 'rgba(15, 23, 42, 0.08)',
      },
    },
    decorations: [
      {
        type: 'icon',
        element: 'city-building',
        position: { x: '8%', y: '12%' },
        size: '80px',
        color: '#3b82f6',
        opacity: 0.2,
      },
      {
        type: 'icon',
        element: 'eiffel-tower',
        position: { x: '82%', y: '10%' },
        size: '90px',
        color: '#6366f1',
        opacity: 0.18,
      },
      {
        type: 'icon',
        element: 'plane',
        position: { x: '12%', y: '82%' },
        size: '75px',
        color: '#0ea5e9',
        opacity: 0.25,
      },
      {
        type: 'icon',
        element: 'compass',
        position: { x: '80%', y: '80%' },
        size: '65px',
        color: '#8b5cf6',
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

export const countrysideTemplate: QRTemplate = {
  id: 'vacation-countryside',
  name: 'Countryside',
  category: 'vacation',
  config: {
    background: {
      type: 'gradient',
      colors: ['#fefce8', '#fef9c3', '#fef3c7'],
      pattern: 'none',
    },
    typography: {
      titleFont: '"Merriweather", serif',
      titleSize: '2.6rem',
      titleColor: '#713f12',
      bodyFont: '"Inter", sans-serif',
      bodySize: '1.1rem',
      bodyColor: '#78716c',
    },
    qrStyle: {
      position: 'center',
      size: 'medium',
      defaultColor: '#92400e',
      frameStyle: 'rounded',
      photoFrame: {
        type: 'decorative',
        cornerSize: '70px',
        cornerColor: '#ca8a04',
        borderColor: '#fde68a',
        borderWidth: '3px',
      },
    },
    decorations: [
      {
        type: 'icon',
        element: 'leaf',
        position: { x: '10%', y: '10%' },
        size: '70px',
        color: '#65a30d',
        opacity: 0.3,
      },
      {
        type: 'icon',
        element: 'flower',
        position: { x: '82%', y: '12%' },
        size: '75px',
        color: '#f59e0b',
        opacity: 0.25,
      },
      {
        type: 'icon',
        element: 'butterfly',
        position: { x: '15%', y: '75%' },
        size: '60px',
        color: '#ec4899',
        opacity: 0.28,
      },
      {
        type: 'icon',
        element: 'sun',
        position: { x: '78%', y: '78%' },
        size: '80px',
        color: '#fbbf24',
        opacity: 0.2,
      },
      {
        type: 'icon',
        element: 'campfire',
        position: { x: '8%', y: '45%' },
        size: '55px',
        color: '#f97316',
        opacity: 0.18,
      },
    ],
    layout: {
      orientation: 'portrait',
      contentAlignment: 'center',
      spacing: '2rem',
    },
  },
}

export const vacationTemplates = [
  beachParadiseTemplate,
  mountainLodgeTemplate,
  cityExplorerTemplate,
  countrysideTemplate,
]
