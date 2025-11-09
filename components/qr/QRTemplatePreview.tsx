'use client'

import { QRTemplate, Client } from '@/types'
import { cn } from '@/lib/utils'
import { generateBackgroundStyle, getQRCodeSize } from '@/lib/qr-templates'
import { DecorationElement } from '@/lib/qr-templates/decorations/icons'
import Image from 'next/image'

interface QRTemplatePreviewProps {
  template: QRTemplate
  qrCodeUrl: string
  formData: {
    title: string
    subtitle: string
    content: string
    footerCol1: string
    footerCol2: string
    footerCol3: string
  }
  customizations?: {
    qrColor?: string
    logoUrl?: string | null
  }
  className?: string
}

/**
 * Aperçu live du template QR en format A4
 * Affiche le design avec les données du client
 */
export function QRTemplatePreview({
  template,
  qrCodeUrl,
  formData,
  customizations,
  className,
}: QRTemplatePreviewProps) {
  const { config } = template
  const orientation = config.layout.orientation
  const backgroundStyle = generateBackgroundStyle(config.background)
  const qrSize = getQRCodeSize(config.qrStyle.size)

  return (
    <div
      className={cn(
        'relative bg-white shadow-2xl overflow-hidden print:shadow-none',
        orientation === 'portrait' ? 'aspect-[210/297]' : 'aspect-[297/210]',
        className
      )}
      style={{
        background: backgroundStyle,
      }}
    >
      {/* Décorations */}
      <div className="absolute inset-0 pointer-events-none">
        {config.decorations.map((decoration, i) => (
          <DecorationElement key={i} decoration={decoration} />
        ))}
      </div>

      {/* Contenu principal */}
      <div
        className={cn(
          'relative z-10 h-full flex flex-col px-8 py-10',
          config.layout.contentAlignment === 'top' && 'justify-start',
          config.layout.contentAlignment === 'center' && 'justify-center',
          config.layout.contentAlignment === 'bottom' && 'justify-end'
        )}
        style={{
          gap: config.layout.spacing,
        }}
      >
        {/* Titre */}
        {formData.title && (
          <h1
            className="text-center font-bold leading-tight break-words"
            style={{
              fontFamily: config.typography.titleFont,
              fontSize: config.typography.titleSize,
              color: config.typography.titleColor,
            }}
          >
            {formData.title}
          </h1>
        )}

        {/* Sous-titre */}
        {formData.subtitle && (
          <p
            className="text-center leading-relaxed break-words"
            style={{
              fontFamily: config.typography.bodyFont,
              fontSize: config.typography.bodySize,
              color: config.typography.bodyColor,
            }}
          >
            {formData.subtitle}
          </p>
        )}

        {/* QR Code */}
        <div
          className={cn(
            'flex justify-center items-center',
            config.layout.contentAlignment === 'top' && 'mt-auto mb-0',
            config.layout.contentAlignment === 'bottom' && 'mt-0 mb-auto'
          )}
        >
          <div
            className={cn(
              'relative bg-white p-4 shadow-lg',
              config.qrStyle.frameStyle === 'rounded' && 'rounded-2xl',
              config.qrStyle.frameStyle === 'circle' && 'rounded-full',
              config.qrStyle.frameStyle === 'square' && 'rounded-none',
              config.qrStyle.frameStyle === 'none' && 'shadow-none p-0'
            )}
          >
            {/* Logo central (si présent) */}
            {customizations?.logoUrl && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="bg-white rounded-lg p-2 shadow-md">
                  <Image
                    src={customizations.logoUrl}
                    alt="Logo"
                    width={qrSize * 0.2}
                    height={qrSize * 0.2}
                    quality={65}
                    sizes="64px"
                    className="object-contain"
                  />
                </div>
              </div>
            )}

            {/* QR Code image */}
            <Image
              src={qrCodeUrl}
              alt="QR Code"
              width={qrSize}
              height={qrSize}
              quality={75}
              sizes="(max-width: 640px) 256px, 384px"
              className="relative z-0"
              style={{
                filter: customizations?.qrColor
                  ? `hue-rotate(${getHueRotation(customizations.qrColor)}deg)`
                  : undefined,
              }}
            />
          </div>
        </div>

        {/* Contenu descriptif */}
        {formData.content && (
          <p
            className="text-center leading-relaxed break-words max-w-2xl mx-auto"
            style={{
              fontFamily: config.typography.bodyFont,
              fontSize: config.typography.bodySize,
              color: config.typography.bodyColor,
            }}
          >
            {formData.content}
          </p>
        )}

        {/* Footer avec 3 colonnes (email, phone, website) */}
        {(formData.footerCol1 || formData.footerCol2 || formData.footerCol3) && (
          <div
            className="grid grid-cols-3 gap-4 mt-auto pt-6 border-t"
            style={{
              borderColor: config.typography.bodyColor,
              opacity: 0.7,
            }}
          >
            {formData.footerCol1 && (
              <div className="text-center">
                <p
                  className="text-sm break-words"
                  style={{
                    fontFamily: config.typography.bodyFont,
                    color: config.typography.bodyColor,
                  }}
                >
                  {formData.footerCol1}
                </p>
              </div>
            )}
            {formData.footerCol2 && (
              <div className="text-center">
                <p
                  className="text-sm break-words"
                  style={{
                    fontFamily: config.typography.bodyFont,
                    color: config.typography.bodyColor,
                  }}
                >
                  {formData.footerCol2}
                </p>
              </div>
            )}
            {formData.footerCol3 && (
              <div className="text-center">
                <p
                  className="text-sm break-words"
                  style={{
                    fontFamily: config.typography.bodyFont,
                    color: config.typography.bodyColor,
                  }}
                >
                  {formData.footerCol3}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Calculer la rotation de teinte pour changer la couleur du QR code
 * (approximation simple pour changer la couleur noire du QR)
 */
function getHueRotation(hexColor: string): number {
  // Convertir hex en HSL et retourner la teinte
  const r = parseInt(hexColor.slice(1, 3), 16) / 255
  const g = parseInt(hexColor.slice(3, 5), 16) / 255
  const b = parseInt(hexColor.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let h = 0
  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta + (g < b ? 6 : 0)) / 6
    } else if (max === g) {
      h = ((b - r) / delta + 2) / 6
    } else {
      h = ((r - g) / delta + 4) / 6
    }
  }

  return h * 360
}
