import { QRTemplate } from '@/types'

/**
 * Templates festive - Design pour occasions spéciales
 */

export const winterHolidaysTemplate: QRTemplate = {
  id: 'festive-winter-holidays',
  name: 'Winter Holidays',
  category: 'festive',
  config: {
    background: {
      type: 'gradient',
      colors: ['#dbeafe', '#eff6ff', '#ffffff'],
      pattern: 'none',
    },
    typography: {
      titleFont: '"Mountains of Christmas", cursive',
      titleSize: '3rem',
      titleColor: '#1e40af',
      bodyFont: '"Inter", sans-serif',
      bodySize: '1.2rem',
      bodyColor: '#475569',
    },
    qrStyle: {
      position: 'center',
      size: 'large',
      defaultColor: '#2563eb',
      frameStyle: 'rounded',
    },
    decorations: [
      {
        type: 'icon',
        element: 'star',
        position: { x: '10%', y: '8%' },
        size: '65px',
        color: '#fbbf24',
        opacity: 0.4,
      },
      {
        type: 'icon',
        element: 'star',
        position: { x: '82%', y: '12%' },
        size: '55px',
        color: '#f59e0b',
        opacity: 0.35,
      },
      {
        type: 'icon',
        element: 'sparkle',
        position: { x: '15%', y: '20%' },
        size: '45px',
        color: '#60a5fa',
        opacity: 0.3,
      },
      {
        type: 'icon',
        element: 'gift',
        position: { x: '8%', y: '78%' },
        size: '85px',
        color: '#dc2626',
        opacity: 0.3,
      },
      {
        type: 'icon',
        element: 'balloon',
        position: { x: '80%', y: '75%' },
        size: '75px',
        color: '#ef4444',
        opacity: 0.28,
      },
      {
        type: 'icon',
        element: 'dots',
        position: { x: '30%', y: '85%' },
        size: '100px',
        color: '#3b82f6',
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

export const summerVibesTemplate: QRTemplate = {
  id: 'festive-summer-vibes',
  name: 'Summer Vibes',
  category: 'festive',
  config: {
    background: {
      type: 'gradient',
      colors: ['#fef3c7', '#fed7aa', '#fecaca'],
      pattern: 'none',
    },
    typography: {
      titleFont: '"Lobster", cursive',
      titleSize: '3.2rem',
      titleColor: '#c2410c',
      bodyFont: '"Inter", sans-serif',
      bodySize: '1.2rem',
      bodyColor: '#92400e',
    },
    qrStyle: {
      position: 'center',
      size: 'large',
      defaultColor: '#ea580c',
      frameStyle: 'rounded',
    },
    decorations: [
      {
        type: 'icon',
        element: 'sun',
        position: { x: '8%', y: '8%' },
        size: '90px',
        color: '#fbbf24',
        opacity: 0.4,
      },
      {
        type: 'icon',
        element: 'surfboard',
        position: { x: '80%', y: '10%' },
        size: '80px',
        color: '#0ea5e9',
        opacity: 0.35,
      },
      {
        type: 'icon',
        element: 'balloon',
        position: { x: '12%', y: '75%' },
        size: '85px',
        color: '#ec4899',
        opacity: 0.3,
      },
      {
        type: 'icon',
        element: 'balloon',
        position: { x: '78%', y: '78%' },
        size: '75px',
        color: '#a855f7',
        opacity: 0.28,
      },
      {
        type: 'icon',
        element: 'confetti',
        position: { x: '0%', y: '0%' },
        size: '100%',
        color: '#f43f5e',
        opacity: 0.25,
      },
      {
        type: 'icon',
        element: 'sparkle',
        position: { x: '45%', y: '15%' },
        size: '60px',
        color: '#fbbf24',
        opacity: 0.35,
      },
    ],
    layout: {
      orientation: 'portrait',
      contentAlignment: 'center',
      spacing: '2rem',
    },
  },
}

export const festiveTemplates = [
  winterHolidaysTemplate,
  summerVibesTemplate,
]
