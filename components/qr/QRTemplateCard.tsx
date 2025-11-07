'use client'

import { QRTemplate } from '@/types'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { generateBackgroundStyle } from '@/lib/qr-templates'
import { DecorationElement } from '@/lib/qr-templates/decorations/icons'

interface QRTemplateCardProps {
  template: QRTemplate
  isSelected: boolean
  onSelect: () => void
}

/**
 * Carte de prévisualisation d'un template QR
 * Affiche un aperçu miniature avec sélection
 */
export function QRTemplateCard({ template, isSelected, onSelect }: QRTemplateCardProps) {
  const backgroundStyle = generateBackgroundStyle(template.config.background)

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative w-full aspect-[3/4] rounded-lg overflow-hidden transition-all duration-200',
        'border-2 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2',
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2 shadow-lg'
          : 'border-gray-200 hover:border-gray-300 shadow-sm'
      )}
    >
      {/* Preview miniature */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background: backgroundStyle,
        }}
      >
        {/* Decorations (scaled down) */}
        <div className="relative w-full h-full scale-[0.8]">
          {template.config.decorations.slice(0, 2).map((decoration, i) => (
            <DecorationElement key={i} decoration={decoration} />
          ))}
        </div>

        {/* Placeholder QR code */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              'bg-white p-2',
              template.config.qrStyle.frameStyle === 'rounded' && 'rounded-lg',
              template.config.qrStyle.frameStyle === 'circle' && 'rounded-full',
              template.config.qrStyle.frameStyle === 'square' && 'rounded-none'
            )}
          >
            <div
              className="w-16 h-16 grid grid-cols-3 grid-rows-3 gap-0.5"
              style={{ backgroundColor: template.config.qrStyle.defaultColor }}
            >
              {/* QR code pattern miniature */}
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'bg-white',
                    [0, 2, 6, 8].includes(i) && 'opacity-0' // Coins vides pour ressembler à un QR
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay selected */}
      {isSelected && (
        <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-[0.5px]">
          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
            <Check className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Template name */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
        <p className="text-white text-sm font-medium truncate">{template.name}</p>
      </div>
    </button>
  )
}
