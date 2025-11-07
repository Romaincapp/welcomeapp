import { QRTemplate } from '@/types'

/**
 * Templates elegant - Design raffiné et sophistiqué
 */

export const classicFrameTemplate: QRTemplate = {
  id: 'elegant-classic-frame',
  name: 'Classic Frame',
  category: 'elegant',
  config: {
    background: {
      type: 'solid',
      colors: ['#faf8f6'],
      pattern: 'none',
    },
    typography: {
      titleFont: '"Playfair Display", serif',
      titleSize: '3.2rem',
      titleColor: '#292524',
      bodyFont: '"Lora", serif',
      bodySize: '1.2rem',
      bodyColor: '#57534e',
    },
    qrStyle: {
      position: 'center',
      size: 'medium',
      defaultColor: '#44403c',
      frameStyle: 'square',
    },
    decorations: [
      {
        type: 'icon',
        element: 'square',
        position: { x: '8%', y: '8%' },
        size: '90px',
        color: '#a8a29e',
        opacity: 0.15,
      },
      {
        type: 'icon',
        element: 'square',
        position: { x: '82%', y: '8%' },
        size: '90px',
        color: '#a8a29e',
        opacity: 0.15,
      },
      {
        type: 'icon',
        element: 'square',
        position: { x: '8%', y: '82%' },
        size: '90px',
        color: '#a8a29e',
        opacity: 0.15,
      },
      {
        type: 'icon',
        element: 'square',
        position: { x: '82%', y: '82%' },
        size: '90px',
        color: '#a8a29e',
        opacity: 0.15,
      },
    ],
    layout: {
      orientation: 'portrait',
      contentAlignment: 'center',
      spacing: '2.5rem',
    },
  },
}

export const artDecoTemplate: QRTemplate = {
  id: 'elegant-art-deco',
  name: 'Art Deco',
  category: 'elegant',
  config: {
    background: {
      type: 'gradient',
      colors: ['#18181b', '#27272a', '#3f3f46'],
      pattern: 'none',
    },
    typography: {
      titleFont: '"Cinzel", serif',
      titleSize: '2.8rem',
      titleColor: '#fbbf24',
      bodyFont: '"Lora", serif',
      bodySize: '1.1rem',
      bodyColor: '#fef3c7',
    },
    qrStyle: {
      position: 'center',
      size: 'medium',
      defaultColor: '#f59e0b',
      frameStyle: 'square',
    },
    decorations: [
      {
        type: 'icon',
        element: 'triangle',
        position: { x: '10%', y: '5%' },
        size: '70px',
        color: '#fbbf24',
        opacity: 0.2,
      },
      {
        type: 'icon',
        element: 'triangle',
        position: { x: '80%', y: '5%' },
        size: '70px',
        color: '#f59e0b',
        opacity: 0.2,
      },
      {
        type: 'icon',
        element: 'hexagon',
        position: { x: '12%', y: '80%' },
        size: '80px',
        color: '#d97706',
        opacity: 0.18,
      },
      {
        type: 'icon',
        element: 'hexagon',
        position: { x: '78%', y: '80%' },
        size: '80px',
        color: '#b45309',
        opacity: 0.18,
      },
      {
        type: 'icon',
        element: 'grid',
        position: { x: '0%', y: '0%' },
        size: '100%',
        color: '#71717a',
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

export const botanicalTemplate: QRTemplate = {
  id: 'elegant-botanical',
  name: 'Botanical',
  category: 'elegant',
  config: {
    background: {
      type: 'gradient',
      colors: ['#f7fee7', '#fefce8', '#ffffff'],
      pattern: 'none',
    },
    typography: {
      titleFont: '"Cormorant Garamond", serif',
      titleSize: '3rem',
      titleColor: '#365314',
      bodyFont: '"Lora", serif',
      bodySize: '1.1rem',
      bodyColor: '#4d7c0f',
    },
    qrStyle: {
      position: 'center',
      size: 'medium',
      defaultColor: '#4d7c0f',
      frameStyle: 'circle',
    },
    decorations: [
      {
        type: 'icon',
        element: 'leaf',
        position: { x: '8%', y: '8%' },
        size: '85px',
        color: '#65a30d',
        opacity: 0.25,
      },
      {
        type: 'icon',
        element: 'leaf',
        position: { x: '82%', y: '12%' },
        size: '75px',
        color: '#84cc16',
        opacity: 0.22,
      },
      {
        type: 'icon',
        element: 'flower',
        position: { x: '10%', y: '78%' },
        size: '90px',
        color: '#f59e0b',
        opacity: 0.28,
      },
      {
        type: 'icon',
        element: 'butterfly',
        position: { x: '80%', y: '75%' },
        size: '70px',
        color: '#ec4899',
        opacity: 0.3,
      },
      {
        type: 'icon',
        element: 'leaf',
        position: { x: '45%', y: '15%' },
        size: '60px',
        color: '#a3e635',
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

export const elegantTemplates = [
  classicFrameTemplate,
  artDecoTemplate,
  botanicalTemplate,
]
