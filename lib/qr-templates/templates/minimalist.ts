import { QRTemplate } from '@/types'

/**
 * Templates minimalistes - Design épuré et moderne
 */

export const cleanWhiteTemplate: QRTemplate = {
  id: 'minimalist-clean-white',
  name: 'Clean White',
  category: 'minimalist',
  config: {
    background: {
      type: 'solid',
      colors: ['#ffffff'],
      pattern: 'none',
    },
    typography: {
      titleFont: '"Inter", sans-serif',
      titleSize: '3rem',
      titleColor: '#000000',
      bodyFont: '"Inter", sans-serif',
      bodySize: '1.1rem',
      bodyColor: '#6b7280',
    },
    qrStyle: {
      position: 'center',
      size: 'large',
      defaultColor: '#000000',
      frameStyle: 'rounded',
      photoFrame: {
        type: 'simple',
        borderWidth: '1px',
        borderColor: '#e5e7eb',
        borderRadius: '12px',
        shadowColor: 'rgba(0, 0, 0, 0.04)',
      },
    },
    decorations: [
      {
        type: 'icon',
        element: 'circle',
        position: { x: '5%', y: '5%' },
        size: '80px',
        color: '#e5e7eb',
        opacity: 0.6,
      },
      {
        type: 'icon',
        element: 'circle',
        position: { x: '85%', y: '85%' },
        size: '100px',
        color: '#f3f4f6',
        opacity: 0.5,
      },
    ],
    layout: {
      orientation: 'portrait',
      contentAlignment: 'center',
      spacing: '2rem',
    },
  },
}

export const scandinaveTemplate: QRTemplate = {
  id: 'minimalist-scandinave',
  name: 'Scandinave',
  category: 'minimalist',
  config: {
    background: {
      type: 'solid',
      colors: ['#f9fafb'],
      pattern: 'none',
    },
    typography: {
      titleFont: '"Montserrat", sans-serif',
      titleSize: '2.8rem',
      titleColor: '#1f2937',
      bodyFont: '"Inter", sans-serif',
      bodySize: '1.1rem',
      bodyColor: '#6b7280',
    },
    qrStyle: {
      position: 'center',
      size: 'medium',
      defaultColor: '#374151',
      frameStyle: 'square',
      photoFrame: {
        type: 'simple',
        borderWidth: '2px',
        borderColor: '#d1d5db',
        borderRadius: '8px',
      },
    },
    decorations: [
      {
        type: 'icon',
        element: 'square',
        position: { x: '10%', y: '8%' },
        size: '60px',
        color: '#d1d5db',
        opacity: 0.4,
      },
      {
        type: 'icon',
        element: 'square',
        position: { x: '82%', y: '10%' },
        size: '50px',
        color: '#e5e7eb',
        opacity: 0.3,
      },
      {
        type: 'icon',
        element: 'dots',
        position: { x: '5%', y: '75%' },
        size: '120px',
        color: '#9ca3af',
        opacity: 0.25,
      },
    ],
    layout: {
      orientation: 'portrait',
      contentAlignment: 'top',
      spacing: '2.5rem',
    },
  },
}

export const zenGardenTemplate: QRTemplate = {
  id: 'minimalist-zen-garden',
  name: 'Zen Garden',
  category: 'minimalist',
  config: {
    background: {
      type: 'gradient',
      colors: ['#fafafa', '#f5f5f4'],
      pattern: 'none',
    },
    typography: {
      titleFont: '"Lora", serif',
      titleSize: '2.6rem',
      titleColor: '#292524',
      bodyFont: '"Inter", sans-serif',
      bodySize: '1rem',
      bodyColor: '#78716c',
    },
    qrStyle: {
      position: 'center',
      size: 'medium',
      defaultColor: '#44403c',
      frameStyle: 'circle',
      photoFrame: {
        type: 'simple',
        borderWidth: '2px',
        borderColor: '#d6d3d1',
        borderRadius: '50%',
        shadowColor: 'rgba(68, 64, 60, 0.08)',
      },
    },
    decorations: [
      {
        type: 'icon',
        element: 'circle',
        position: { x: '15%', y: '12%' },
        size: '40px',
        color: '#d6d3d1',
        opacity: 0.5,
      },
      {
        type: 'icon',
        element: 'circle',
        position: { x: '78%', y: '15%' },
        size: '30px',
        color: '#e7e5e4',
        opacity: 0.4,
      },
      {
        type: 'icon',
        element: 'leaf',
        position: { x: '8%', y: '80%' },
        size: '55px',
        color: '#a8a29e',
        opacity: 0.25,
      },
      {
        type: 'icon',
        element: 'circle',
        position: { x: '85%', y: '78%' },
        size: '35px',
        color: '#d6d3d1',
        opacity: 0.4,
      },
    ],
    layout: {
      orientation: 'portrait',
      contentAlignment: 'center',
      spacing: '2rem',
    },
  },
}

export const minimalistTemplates = [
  cleanWhiteTemplate,
  scandinaveTemplate,
  zenGardenTemplate,
]
