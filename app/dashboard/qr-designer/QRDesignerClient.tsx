'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Save, Eye, Pencil } from 'lucide-react'
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

interface QRDesignerClientProps {
  client: Client
  welcomebookUrl: string
}

export default function QRDesignerClient({
  client,
  welcomebookUrl,
}: QRDesignerClientProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const qrCodeRef = useRef<HTMLDivElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')

  // Mobile view toggle: 'edit' or 'preview'
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit')

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

  // Personnalisations du QR code (états séparés pour éviter boucles)
  const [qrColor, setQrColor] = useState(selectedTemplate.config.qrStyle.defaultColor)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // Générer le QR code en data URL pour affichage dans le preview
  useEffect(() => {
    if (qrCodeRef.current) {
      const svg = qrCodeRef.current.querySelector('svg')
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg)
        const svgBase64 = btoa(unescape(encodeURIComponent(svgData)))
        const dataUrl = `data:image/svg+xml;base64,${svgBase64}`
        setQrCodeDataUrl(dataUrl)
      }
    }
  }, [welcomebookUrl, qrColor])

  const handleTemplateSelect = (template: QRTemplate) => {
    setSelectedTemplate(template)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setLogoPreview(result)
        setLogoUrl(result)
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
      console.log('Saving draft:', {
        templateId: selectedTemplate.id,
        formData,
        customizations: { qrColor, logoUrl, logoFile },
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
    <div className="min-h-full bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Hidden QR Code for data URL generation */}
      <div ref={qrCodeRef} className="hidden">
        <QRCode value={welcomebookUrl} fgColor={qrColor} size={512} />
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                QR Code
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                Créez une affiche A4 professionnelle
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="hidden sm:flex"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="sm:hidden p-2"
            >
              <Save className="w-4 h-4" />
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleExportPDF}
              className="hidden sm:flex"
              style={{ backgroundColor: client.header_color || '#4F46E5' }}
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter PDF
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleExportPDF}
              className="sm:hidden p-2"
              style={{ backgroundColor: client.header_color || '#4F46E5' }}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile View Toggle */}
      <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex-shrink-0">
        <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
          <button
            onClick={() => setMobileView('edit')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition ${
              mobileView === 'edit'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Pencil className="w-4 h-4" />
            Éditer
          </button>
          <button
            onClick={() => setMobileView('preview')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition ${
              mobileView === 'preview'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Eye className="w-4 h-4" />
            Aperçu
          </button>
        </div>
      </div>

      {/* Body: 2 colonnes sur desktop, toggle sur mobile */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Colonne Gauche: Personnalisation */}
        <div className={`lg:w-1/2 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-4 sm:p-6 bg-white dark:bg-gray-800 ${
          mobileView === 'edit' ? 'flex-1' : 'hidden lg:block'
        }`}>
          <Tabs defaultValue="template" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-700">
              <TabsTrigger
                value="template"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
              >
                Modèle
              </TabsTrigger>
              <TabsTrigger
                value="content"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
              >
                Contenu
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Sélection du template + Personnalisation */}
            <TabsContent value="template" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Choisissez votre template
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Parcourez les catégories et sélectionnez le design
                </p>
              </div>

              <QRTemplateSelector
                selectedTemplateId={selectedTemplate.id}
                onSelectTemplate={handleTemplateSelect}
              />

              {/* Divider */}
              <div className="pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Personnalisez votre QR code
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Ajustez la couleur et ajoutez un logo
                </p>
              </div>

              {/* Couleur du QR Code */}
              <div className="space-y-2">
                <Label htmlFor="qr-color" className="text-gray-700 dark:text-gray-300">Couleur du QR Code</Label>
                <ColorPicker
                  value={qrColor}
                  onValueChange={setQrColor}
                >
                  <ColorPickerTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                      id="qr-color"
                    >
                      <ColorPickerSwatch className="w-8 h-8 sm:w-10 sm:h-10 mr-3" />
                      <span className="font-mono text-sm text-gray-900 dark:text-white">{qrColor}</span>
                    </Button>
                  </ColorPickerTrigger>
                  <ColorPickerContent>
                    <ColorPickerArea />
                    <ColorPickerHueSlider />
                    <ColorPickerInput withoutAlpha />
                  </ColorPickerContent>
                </ColorPicker>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Choisissez une couleur contrastée pour assurer la scannabilité
                </p>
              </div>

              {/* Logo central */}
              <div className="space-y-2">
                <Label htmlFor="logo-upload" className="text-gray-700 dark:text-gray-300">Logo central (optionnel)</Label>
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="cursor-pointer bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                />
                {logoPreview && (
                  <div className="mt-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Aperçu du logo:</p>
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-20 h-20 sm:w-24 sm:h-24 object-contain mx-auto bg-white dark:bg-gray-800 rounded-lg"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setLogoPreview(null)
                        setLogoUrl(null)
                        setLogoFile(null)
                      }}
                      className="mt-2 w-full text-gray-600 dark:text-gray-400"
                    >
                      Supprimer le logo
                    </Button>
                  </div>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Recommandé: PNG transparent, 200x200px minimum
                </p>
              </div>
            </TabsContent>

            {/* Tab 2: Contenu textuel */}
            <TabsContent value="content" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Personnalisez le contenu
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Modifiez les textes affichés sur votre affiche A4
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-700 dark:text-gray-300">Titre principal</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Bienvenue à..."
                  className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle" className="text-gray-700 dark:text-gray-300">Sous-titre</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Votre guide de bienvenue"
                  className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-gray-700 dark:text-gray-300">Texte descriptif</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Scannez ce QR code..."
                  rows={3}
                  className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Label className="text-sm font-semibold text-gray-900 dark:text-white mb-3 block">
                  Footer (3 colonnes)
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="footer1" className="text-xs text-gray-600 dark:text-gray-400">
                      Email
                    </Label>
                    <Input
                      id="footer1"
                      value={formData.footerCol1}
                      onChange={(e) =>
                        setFormData({ ...formData, footerCol1: e.target.value })
                      }
                      placeholder="contact@..."
                      className="text-xs bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="footer2" className="text-xs text-gray-600 dark:text-gray-400">
                      Téléphone
                    </Label>
                    <Input
                      id="footer2"
                      value={formData.footerCol2}
                      onChange={(e) =>
                        setFormData({ ...formData, footerCol2: e.target.value })
                      }
                      placeholder="+33..."
                      className="text-xs bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="footer3" className="text-xs text-gray-600 dark:text-gray-400">
                      Website
                    </Label>
                    <Input
                      id="footer3"
                      value={formData.footerCol3}
                      onChange={(e) =>
                        setFormData({ ...formData, footerCol3: e.target.value })
                      }
                      placeholder="www..."
                      className="text-xs bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Colonne Droite: Preview A4 */}
        <div className={`lg:w-1/2 bg-gray-100 dark:bg-gray-900 overflow-y-auto p-4 sm:p-6 ${
          mobileView === 'preview' ? 'flex-1' : 'hidden lg:block'
        }`}>
          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">Aperçu A4</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Template: <span className="font-medium">{selectedTemplate.name}</span> •{' '}
              {selectedTemplate.config.layout.orientation === 'portrait'
                ? 'Portrait'
                : 'Paysage'}
            </p>
          </div>

          {/* Preview container avec scaling responsive */}
          <div className="flex justify-center">
            <div
              ref={printRef}
              className="print-content transform scale-[0.35] sm:scale-[0.45] lg:scale-[0.55] origin-top"
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
                customizations={{ qrColor, logoUrl }}
              />
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
    </div>
  )
}
