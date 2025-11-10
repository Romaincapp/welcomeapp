'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Download, Save } from 'lucide-react'
import QRCode from 'react-qr-code'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ColorPicker,
  ColorPickerTrigger,
  ColorPickerContent,
  ColorPickerArea,
  ColorPickerHueSlider,
  ColorPickerInput,
  ColorPickerSwatch,
} from '@/components/ui/color-picker'
import type { Client, QRTemplate } from '@/types'
import { QRTemplateSelector } from '@/components/qr/QRTemplateSelector'
import { QRTemplatePreview } from '@/components/qr/QRTemplatePreview'
import { getTemplateById, ALL_TEMPLATES } from '@/lib/qr-templates'

interface QRCodeDesignerModalProps {
  isOpen: boolean
  onClose: () => void
  client: Client
  welcomebookUrl: string
}

export default function QRCodeDesignerModal({
  isOpen,
  onClose,
  client,
  welcomebookUrl,
}: QRCodeDesignerModalProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const qrCodeRef = useRef<HTMLDivElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')

  // Template sélectionné (par défaut: Beach Paradise pour vacation rentals)
  const [selectedTemplate, setSelectedTemplate] = useState<QRTemplate>(
    getTemplateById('vacation-beach-paradise') || ALL_TEMPLATES[0]
  )

  // Données du formulaire (pré-remplies avec les données du client)
  const [formData, setFormData] = useState({
    title: client.name || '',
    subtitle: client.header_subtitle || '',
    content: `Scannez ce QR code pour accéder à votre guide de bienvenue personnalisé`,
    footerCol1: client.footer_contact_email || '',
    footerCol2: client.footer_contact_phone || '',
    footerCol3: client.footer_contact_website || '',
  })

  // Personnalisations du QR code
  const [customizations, setCustomizations] = useState({
    qrColor: selectedTemplate.config.qrStyle.defaultColor,
    logoUrl: null as string | null,
    logoFile: null as File | null,
  })

  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // Générer le QR code en data URL pour affichage dans le preview
  useEffect(() => {
    if (qrCodeRef.current) {
      const svg = qrCodeRef.current.querySelector('svg')
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg)
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(svgBlob)
        setQrCodeDataUrl(url)
        return () => URL.revokeObjectURL(url)
      }
    }
  }, [welcomebookUrl, customizations.qrColor])

  // Mettre à jour la couleur du QR quand le template change
  useEffect(() => {
    setCustomizations((prev) => ({
      ...prev,
      qrColor: selectedTemplate.config.qrStyle.defaultColor,
    }))
  }, [selectedTemplate])

  // Fermer modal avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Empêcher le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleTemplateSelect = (template: QRTemplate) => {
    setSelectedTemplate(template)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCustomizations({ ...customizations, logoFile: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setLogoPreview(result)
        setCustomizations((prev) => ({ ...prev, logoUrl: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleExportPDF = () => {
    if (printRef.current) {
      window.print()
    }
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    try {
      // TODO: Implémenter la sauvegarde via server action
      console.log('Saving draft:', {
        templateId: selectedTemplate.id,
        formData,
        customizations,
      })
      setTimeout(() => {
        setIsSaving(false)
        alert('Brouillon sauvegardé avec succès !')
      }, 1000)
    } catch (error) {
      console.error('Error saving draft:', error)
      setIsSaving(false)
      alert('Erreur lors de la sauvegarde')
    }
  }

  return (
    <>
      {/* Hidden QR Code for data URL generation */}
      <div ref={qrCodeRef} className="hidden">
        <QRCode value={welcomebookUrl} fgColor={customizations.qrColor} size={512} />
      </div>

      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 overflow-hidden">
        <div
          className="bg-white rounded-2xl w-full max-w-7xl h-[90vh] flex flex-col shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Créer votre QR Code imprimable
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Choisissez un template, personnalisez et exportez votre QR code au format A4
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleExportPDF}
                style={{ backgroundColor: client.header_color || '#4F46E5' }}
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter PDF
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Body: 2 colonnes */}
          <div className="flex-1 flex overflow-hidden">
            {/* Colonne Gauche: Personnalisation */}
            <div className="w-1/2 border-r border-gray-200 overflow-y-auto p-6">
              <Tabs defaultValue="template" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="template">🎨 Modèle & Style</TabsTrigger>
                  <TabsTrigger value="content">📝 Contenu</TabsTrigger>
                </TabsList>

                {/* Tab 1: Sélection du template + Personnalisation */}
                <TabsContent value="template" className="space-y-6 mt-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Choisissez votre template
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Parcourez les catégories et sélectionnez le design qui vous correspond
                    </p>
                  </div>

                  <QRTemplateSelector
                    selectedTemplateId={selectedTemplate.id}
                    onSelectTemplate={handleTemplateSelect}
                  />

                  {/* Divider */}
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Personnalisez votre QR code
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Ajustez la couleur et ajoutez un logo
                    </p>
                  </div>

                  {/* Couleur du QR Code */}
                  <div className="space-y-2">
                    <Label htmlFor="qr-color">Couleur du QR Code</Label>
                    <ColorPicker
                      value={customizations.qrColor}
                      onValueChange={(color) =>
                        setCustomizations({ ...customizations, qrColor: color })
                      }
                    >
                      <ColorPickerTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          id="qr-color"
                        >
                          <ColorPickerSwatch className="w-10 h-10 mr-3" />
                          <span className="font-mono">{customizations.qrColor}</span>
                        </Button>
                      </ColorPickerTrigger>
                      <ColorPickerContent>
                        <ColorPickerArea />
                        <ColorPickerHueSlider />
                        <ColorPickerInput withoutAlpha />
                      </ColorPickerContent>
                    </ColorPicker>
                    <p className="text-xs text-gray-500">
                      Choisissez une couleur contrastée pour assurer la scannabilité
                    </p>
                  </div>

                  {/* Logo central */}
                  <div className="space-y-2">
                    <Label htmlFor="logo-upload">Logo central (optionnel)</Label>
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="cursor-pointer"
                    />
                    {logoPreview && (
                      <div className="mt-3 p-4 border border-gray-200 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">Aperçu du logo:</p>
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-24 h-24 object-contain mx-auto bg-white rounded-lg"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setLogoPreview(null)
                            setCustomizations({ ...customizations, logoUrl: null, logoFile: null })
                          }}
                          className="mt-2 w-full"
                        >
                          Supprimer le logo
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Recommandé: PNG transparent, 200x200px minimum
                    </p>
                  </div>
                </TabsContent>

                {/* Tab 2: Contenu textuel */}
                <TabsContent value="content" className="space-y-6 mt-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Personnalisez le contenu
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Modifiez les textes affichés sur votre affiche A4
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Titre principal</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Bienvenue à..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Sous-titre</Label>
                    <Input
                      id="subtitle"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="Votre guide de bienvenue"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Texte descriptif</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Scannez ce QR code..."
                      rows={3}
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <Label className="text-sm font-semibold text-gray-900 mb-3 block">
                      Footer (3 colonnes)
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="footer1" className="text-xs">
                          Email
                        </Label>
                        <Input
                          id="footer1"
                          value={formData.footerCol1}
                          onChange={(e) =>
                            setFormData({ ...formData, footerCol1: e.target.value })
                          }
                          placeholder="contact@..."
                          className="text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="footer2" className="text-xs">
                          Téléphone
                        </Label>
                        <Input
                          id="footer2"
                          value={formData.footerCol2}
                          onChange={(e) =>
                            setFormData({ ...formData, footerCol2: e.target.value })
                          }
                          placeholder="+33..."
                          className="text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="footer3" className="text-xs">
                          Website
                        </Label>
                        <Input
                          id="footer3"
                          value={formData.footerCol3}
                          onChange={(e) =>
                            setFormData({ ...formData, footerCol3: e.target.value })
                          }
                          placeholder="www..."
                          className="text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Colonne Droite: Preview A4 */}
            <div className="w-1/2 bg-gray-50 overflow-y-auto p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Aperçu A4</h3>
                <p className="text-sm text-gray-600">
                  Template: <span className="font-medium">{selectedTemplate.name}</span> •{' '}
                  {selectedTemplate.config.layout.orientation === 'portrait'
                    ? 'Portrait'
                    : 'Paysage'}
                </p>
              </div>

              {/* Preview container avec scaling */}
              <div className="flex justify-center">
                <div
                  ref={printRef}
                  className="print-content transform scale-[0.65] origin-top"
                  style={{
                    width:
                      selectedTemplate.config.layout.orientation === 'portrait'
                        ? '210mm'
                        : '297mm',
                    height:
                      selectedTemplate.config.layout.orientation === 'portrait'
                        ? '297mm'
                        : '210mm',
                  }}
                >
                  <QRTemplatePreview
                    template={selectedTemplate}
                    qrCodeUrl={qrCodeDataUrl}
                    formData={formData}
                    customizations={customizations}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content,
          .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            transform: none !important;
            width: 100% !important;
            height: 100% !important;
          }
          @page {
            size: ${selectedTemplate.config.layout.orientation === 'portrait' ? 'A4 portrait' : 'A4 landscape'};
            margin: 0;
          }
        }
      `}</style>
    </>
  )
}
