'use client'

import { useState } from 'react'
import { QRTemplate } from '@/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QRTemplateCard } from './QRTemplateCard'
import { TEMPLATE_CATEGORIES, getTemplatesByCategory } from '@/lib/qr-templates'

interface QRTemplateSelectorProps {
  selectedTemplateId: string
  onSelectTemplate: (template: QRTemplate) => void
}

/**
 * Sélecteur de templates QR avec navigation par onglets
 */
export function QRTemplateSelector({
  selectedTemplateId,
  onSelectTemplate,
}: QRTemplateSelectorProps) {
  // Détecter la catégorie initiale basée sur le template sélectionné
  const getInitialCategory = () => {
    const selectedTemplate = TEMPLATE_CATEGORIES.flatMap((cat) =>
      getTemplatesByCategory(cat.id)
    ).find((t) => t.id === selectedTemplateId)

    return selectedTemplate?.category || 'vacation' // vacation par défaut (cas d'usage principal)
  }

  const [activeCategory, setActiveCategory] = useState<string>(getInitialCategory())

  return (
    <div className="space-y-4">
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        {/* Onglets des catégories */}
        <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-1 bg-gray-100 p-1">
          {TEMPLATE_CATEGORIES.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="flex items-center gap-1.5 px-3 py-2 text-sm whitespace-nowrap"
            >
              <span className="text-base" aria-hidden="true">
                {category.icon}
              </span>
              <span>{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Contenu des catégories */}
        {TEMPLATE_CATEGORIES.map((category) => {
          const templates = getTemplatesByCategory(category.id)

          return (
            <TabsContent key={category.id} value={category.id} className="mt-4">
              {/* Description de la catégorie */}
              <p className="text-sm text-gray-600 mb-4">{category.description}</p>

              {/* Grille de templates */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2">
                {templates.map((template) => (
                  <QRTemplateCard
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplateId === template.id}
                    onSelect={() => onSelectTemplate(template)}
                  />
                ))}
              </div>

              {/* Nombre de templates */}
              <p className="text-xs text-gray-500 mt-3 text-center">
                {templates.length} {templates.length === 1 ? 'template' : 'templates'}
              </p>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
