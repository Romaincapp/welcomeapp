'use client'

import { QRTemplate } from '@/types'
import { cn } from '@/lib/utils'
import { generateBackgroundStyle, getQRCodeSize } from '@/lib/qr-templates'
import { DecorationElement } from '@/lib/qr-templates/decorations/icons'
import { PhotoFrame } from '@/components/qr/PhotoFrame'
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

  // Contenu de la page A4 (réutilisable)
  const PageContent = () => (
    <>
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
            className="text-center font-bold leading-tight break-words line-clamp-3 overflow-hidden"
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
          <PhotoFrame frameStyle={config.qrStyle.photoFrame}>
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
              {qrCodeUrl ? (
                <Image
                  src={qrCodeUrl}
                  alt="QR Code"
                  width={qrSize}
                  height={qrSize}
                  quality={75}
                  sizes="(max-width: 640px) 256px, 384px"
                  className="relative z-0"
                />
              ) : (
                <div
                  className="bg-gray-100 animate-pulse rounded-lg flex items-center justify-center relative z-0"
                  style={{ width: qrSize, height: qrSize }}
                >
                  <span className="text-gray-400 text-xs">Génération...</span>
                </div>
              )}
            </div>
          </PhotoFrame>
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
    </>
  )

  return (
    <>
      {/* Version ÉCRAN avec cadre photo décoratif */}
      <div className={cn('print:hidden p-4 sm:p-6 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100', className)}>
        {/* Cadre photo réaliste effet bois */}
        <div
          className="relative overflow-visible"
          style={{
            boxShadow: '0 25px 70px rgba(0, 0, 0, 0.35), 0 10px 30px rgba(0, 0, 0, 0.25), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
            border: '12px solid transparent',
            borderImage: 'linear-gradient(135deg, #8b7355 0%, #5d4e3a 25%, #6d5d4b 50%, #5d4e3a 75%, #8b7355 100%) 1',
            borderRadius: '4px',
            background: 'linear-gradient(135deg, #8b7355 0%, #5d4e3a 25%, #6d5d4b 50%, #5d4e3a 75%, #8b7355 100%)',
          }}
        >
          {/* Passe-partout blanc */}
          <div
            className="p-3 sm:p-4 bg-white"
            style={{
              boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.15), inset 0 -1px 3px rgba(0, 0, 0, 0.08)',
            }}
          >
            {/* Page A4 */}
            <div
              className={cn(
                'relative',
                orientation === 'portrait' ? 'aspect-[210/297]' : 'aspect-[297/210]'
              )}
              style={{
                background: backgroundStyle,
              }}
            >
              <PageContent />
            </div>
          </div>
        </div>
      </div>

      {/* Version PRINT sans cadre - page A4 pleine */}
      <div
        className="hidden print:block w-full h-full"
        style={{
          background: backgroundStyle,
        }}
      >
        <PageContent />
      </div>
    </>
  )
}
