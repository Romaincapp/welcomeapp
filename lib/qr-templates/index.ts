import { QRTemplate, QRTemplateCategoryMeta } from '@/types'
import { minimalistTemplates } from './templates/minimalist'
import { modernTemplates } from './templates/modern'
import { vacationTemplates } from './templates/vacation'
import { elegantTemplates } from './templates/elegant'
import { festiveTemplates } from './templates/festive'

/**
 * Métadonnées des catégories de templates
 */
export const TEMPLATE_CATEGORIES: QRTemplateCategoryMeta[] = [
  {
    id: 'minimalist',
    name: 'Minimaliste',
    icon: '⚪',
    description: 'Design épuré et moderne',
  },
  {
    id: 'modern',
    name: 'Moderne',
    icon: '⚡',
    description: 'Audacieux et contemporain',
  },
  {
    id: 'vacation',
    name: 'Vacances',
    icon: '🏖️',
    description: 'Parfait pour locations de vacances',
  },
  {
    id: 'elegant',
    name: 'Élégant',
    icon: '✨',
    description: 'Raffiné et sophistiqué',
  },
  {
    id: 'festive',
    name: 'Festif',
    icon: '🎉',
    description: 'Pour occasions spéciales',
  },
]

/**
 * Tous les templates disponibles (15 au total)
 */
export const ALL_TEMPLATES: QRTemplate[] = [
  ...minimalistTemplates,
  ...modernTemplates,
  ...vacationTemplates,
  ...elegantTemplates,
  ...festiveTemplates,
]

/**
 * Obtenir tous les templates d'une catégorie
 */
export function getTemplatesByCategory(category: string): QRTemplate[] {
  return ALL_TEMPLATES.filter((template) => template.category === category)
}

/**
 * Obtenir un template par son ID
 */
export function getTemplateById(id: string): QRTemplate | undefined {
  return ALL_TEMPLATES.find((template) => template.id === id)
}

/**
 * Obtenir les métadonnées d'une catégorie
 */
export function getCategoryMeta(categoryId: string): QRTemplateCategoryMeta | undefined {
  return TEMPLATE_CATEGORIES.find((cat) => cat.id === categoryId)
}

/**
 * Générer le style de background CSS depuis la config
 */
export function generateBackgroundStyle(background: {
  type: 'solid' | 'gradient' | 'pattern'
  colors: string[]
  pattern?: string
}): string {
  if (background.type === 'solid') {
    return background.colors[0]
  }

  if (background.type === 'gradient') {
    return `linear-gradient(135deg, ${background.colors.join(', ')})`
  }

  // Pour les patterns, on retourne un gradient de base
  // Les patterns SVG seront ajoutés par les décorations
  return `linear-gradient(135deg, ${background.colors.join(', ')})`
}

/**
 * Obtenir la taille du QR code en pixels
 */
export function getQRCodeSize(size: 'small' | 'medium' | 'large'): number {
  const sizes = {
    small: 200,
    medium: 280,
    large: 350,
  }
  return sizes[size]
}

/**
 * Migrer un ancien thème vers un template ID
 * Pour rétrocompatibilité avec les 4 thèmes existants
 */
export function migrateOldThemeToTemplateId(oldTheme: string): string {
  const migration: Record<string, string> = {
    'modern-minimal': 'minimalist-clean-white',
    'bold-gradient': 'modern-tech-gradient',
    'clean-professional': 'minimalist-scandinave',
    'elegant-frame': 'elegant-classic-frame',
  }
  return migration[oldTheme] || 'minimalist-clean-white'
}
