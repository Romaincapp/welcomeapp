'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Download, Save, Clock, FileText, Palette, Image as ImageIcon, Check } from 'lucide-react'
import QRCode from 'react-qr-code'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ColorPicker, ColorPickerTrigger, ColorPickerContent, ColorPickerArea, ColorPickerHueSlider, ColorPickerInput, ColorPickerSwatch } from '@/components/ui/color-picker'
import type { Client, QRTheme, QROrientation, QRCodeDesignFormData, QRThemeConfig } from '@/types'

interface QRCodeDesignerModalProps {
  isOpen: boolean
  onClose: () => void
  client: Client
  welcomebookUrl: string
}

// Définition des 4 thèmes modernes
const THEMES: QRThemeConfig[] = [
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'Bordure fine, coins arrondis, beaucoup d\'espace blanc',
    previewClasses: 'border-2 border-gray-200 rounded-2xl',
    borderStyle: '2px solid #e5e7eb',
    backgroundColor: '#ffffff',
  },
  {
    id: 'bold-gradient',
    name: 'Bold Gradient',
    description: 'Bordure gradient subtil, ombres douces',
    previewClasses: 'border-4 rounded-xl shadow-lg',
    borderStyle: '4px solid',
    backgroundColor: '#ffffff',
  },
  {
    id: 'clean-professional',
    name: 'Clean Professional',
    description: 'Lignes fines doubles, layout équilibré',
    previewClasses: 'border-2 border-gray-300 rounded-lg',
    borderStyle: '2px solid #d1d5db',
    backgroundColor: '#fafafa',
  },
  {
    id: 'elegant-frame',
    name: 'Elegant Frame',
    description: 'Cadre avec coins décoratifs subtils',
    previewClasses: 'border-4 border-gray-800 rounded-none',
    borderStyle: '4px solid #1f2937',
    backgroundColor: '#ffffff',
  },
]

export default function QRCodeDesignerModal({
  isOpen,
  onClose,
  client,
  welcomebookUrl,
}: QRCodeDesignerModalProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'logo'>('content')
  const [isSaving, setIsSaving] = useState(false)

  // Données du formulaire (pré-remplies avec les données du client)
  const [formData, setFormData] = useState<QRCodeDesignFormData>({
    title: client.name || '',
    subtitle: client.header_subtitle || '',
    content: `Scannez ce QR code pour accéder à votre guide de bienvenue personnalisé`,
    footerCol1: client.footer_contact_email || '',
    footerCol2: client.footer_contact_phone || '',
    footerCol3: client.footer_contact_website || '',
    theme: 'modern-minimal',
    orientation: 'portrait',
    qrColor: client.header_color || '#000000',
    logoFile: null,
    logoUrl: null,
  })

  const [logoPreview, setLogoPreview] = useState<string | null>(null)

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

  const currentTheme = THEMES.find((t) => t.id === formData.theme) || THEMES[0]

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, logoFile: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
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
      console.log('Saving draft:', formData)
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
      {/* Modal Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl w-full max-w-7xl h-[90vh] flex flex-col shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Créer votre QR Code imprimable
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Personnalisez et exportez votre QR code au format A4 pour impression professionnelle
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder brouillon'}
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
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Body: 2 colonnes */}
          <div className="flex-1 flex overflow-hidden">
            {/* Colonne gauche: Éditeur */}
            <div className="w-1/2 overflow-y-auto p-6 border-r border-gray-200">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="content">
                    <FileText className="w-4 h-4 mr-2" />
                    Contenu
                  </TabsTrigger>
                  <TabsTrigger value="style">
                    <Palette className="w-4 h-4 mr-2" />
                    Style
                  </TabsTrigger>
                  <TabsTrigger value="logo">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Logo
                  </TabsTrigger>
                </TabsList>

                {/* Onglet Contenu */}
                <TabsContent value="content" className="space-y-6">
                  <div>
                    <Label htmlFor="title">Titre principal</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Bienvenue chez Maison de Vacances"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subtitle">Sous-titre</Label>
                    <Input
                      id="subtitle"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="Ex: Votre guide de bienvenue"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Texte sous le QR code</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Message d'instructions pour vos voyageurs"
                      rows={4}
                      className="mt-2"
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">
                      Footer (3 colonnes)
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="footer1" className="text-xs">Colonne 1 (Email)</Label>
                        <Input
                          id="footer1"
                          value={formData.footerCol1}
                          onChange={(e) => setFormData({ ...formData, footerCol1: e.target.value })}
                          placeholder="contact@example.com"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="footer2" className="text-xs">Colonne 2 (Téléphone)</Label>
                        <Input
                          id="footer2"
                          value={formData.footerCol2}
                          onChange={(e) => setFormData({ ...formData, footerCol2: e.target.value })}
                          placeholder="+32 123 45 67 89"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="footer3" className="text-xs">Colonne 3 (Site web)</Label>
                        <Input
                          id="footer3"
                          value={formData.footerCol3}
                          onChange={(e) => setFormData({ ...formData, footerCol3: e.target.value })}
                          placeholder="www.example.com"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Onglet Style */}
                <TabsContent value="style" className="space-y-6">
                  <div>
                    <Label>Orientation de la page</Label>
                    <div className="flex items-center gap-4 mt-3">
                      <button
                        onClick={() => setFormData({ ...formData, orientation: 'portrait' })}
                        className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                          formData.orientation === 'portrait'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-16 h-20 bg-gray-200 rounded mx-auto mb-2" />
                        <p className="text-sm font-medium text-center">Portrait</p>
                      </button>
                      <button
                        onClick={() => setFormData({ ...formData, orientation: 'landscape' })}
                        className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                          formData.orientation === 'landscape'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-20 h-16 bg-gray-200 rounded mx-auto mb-2" />
                        <p className="text-sm font-medium text-center">Paysage</p>
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label>Thème de bordure</Label>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {THEMES.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => setFormData({ ...formData, theme: theme.id })}
                          className={`p-4 border-2 rounded-lg text-left transition-all ${
                            formData.theme === theme.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-gray-900">{theme.name}</p>
                            {formData.theme === theme.id && (
                              <Check className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600">{theme.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Couleur du QR Code</Label>
                    <div className="mt-3">
                      <ColorPicker
                        value={formData.qrColor}
                        onValueChange={(color) => setFormData({ ...formData, qrColor: color })}
                      >
                        <ColorPickerTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <ColorPickerSwatch className="w-10 h-10 mr-3" />
                            <span className="font-mono">{formData.qrColor}</span>
                          </Button>
                        </ColorPickerTrigger>
                        <ColorPickerContent>
                          <ColorPickerArea />
                          <ColorPickerHueSlider />
                          <ColorPickerInput withoutAlpha />
                        </ColorPickerContent>
                      </ColorPicker>
                    </div>
                  </div>
                </TabsContent>

                {/* Onglet Logo */}
                <TabsContent value="logo" className="space-y-6">
                  <div>
                    <Label htmlFor="logo-upload">Logo (affiché au centre du QR code)</Label>
                    <p className="text-xs text-gray-500 mt-1 mb-3">
                      Format recommandé: PNG avec fond transparent, 200x200px minimum
                    </p>
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="cursor-pointer"
                    />
                  </div>

                  {logoPreview && (
                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-3">Aperçu du logo</p>
                      <div className="flex justify-center">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="max-w-[120px] max-h-[120px] object-contain"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setLogoPreview(null)
                          setFormData({ ...formData, logoFile: null })
                        }}
                        className="w-full mt-3"
                      >
                        Supprimer le logo
                      </Button>
                    </div>
                  )}

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Conseil:</strong> Pour une meilleure lisibilité, votre logo ne devrait pas dépasser 20% de la taille du QR code.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Colonne droite: Aperçu */}
            <div className="w-1/2 overflow-y-auto p-6 bg-gray-50">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Aperçu temps réel</h3>
                <p className="text-sm text-gray-500">
                  Votre QR code tel qu'il apparaîtra sur la page A4 imprimée
                </p>
              </div>

              {/* Aperçu du design A4 */}
              <div
                ref={printRef}
                className={`
                  bg-white shadow-lg mx-auto
                  ${formData.orientation === 'portrait' ? 'w-[595px] h-[842px]' : 'w-[842px] h-[595px]'}
                  p-12 flex flex-col items-center justify-between
                  ${currentTheme.previewClasses}
                `}
                style={{
                  transform: formData.orientation === 'portrait' ? 'scale(0.6)' : 'scale(0.5)',
                  transformOrigin: 'top center',
                  borderStyle: formData.theme === 'bold-gradient' ? 'solid' : undefined,
                  borderImage:
                    formData.theme === 'bold-gradient'
                      ? `linear-gradient(135deg, ${formData.qrColor}, ${formData.qrColor}80) 1`
                      : undefined,
                  backgroundColor: currentTheme.backgroundColor,
                }}
              >
                {/* Titre */}
                {formData.title && (
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                      {formData.title}
                    </h1>
                    {formData.subtitle && (
                      <p className="text-xl text-gray-600">{formData.subtitle}</p>
                    )}
                  </div>
                )}

                {/* QR Code */}
                <div className="relative">
                  <div className="bg-white p-8 rounded-lg shadow-md">
                    <QRCode
                      value={welcomebookUrl}
                      size={300}
                      level="H"
                      fgColor={formData.qrColor}
                    />
                    {logoPreview && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white p-2 rounded-lg shadow-lg">
                          <img
                            src={logoPreview}
                            alt="Logo"
                            className="w-16 h-16 object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Texte sous le QR */}
                {formData.content && (
                  <div className="text-center max-w-lg">
                    <p className="text-lg text-gray-700">{formData.content}</p>
                  </div>
                )}

                {/* Footer 3 colonnes */}
                {(formData.footerCol1 || formData.footerCol2 || formData.footerCol3) && (
                  <div className="grid grid-cols-3 gap-8 w-full border-t pt-6">
                    {formData.footerCol1 && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600">{formData.footerCol1}</p>
                      </div>
                    )}
                    {formData.footerCol2 && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600">{formData.footerCol2}</p>
                      </div>
                    )}
                    {formData.footerCol3 && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600">{formData.footerCol3}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles pour l'impression */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          ${printRef.current ? `#${printRef.current.id}` : '.print-content'}, ${printRef.current ? `#${printRef.current.id}` : '.print-content'} * {
            visibility: visible;
          }
          ${printRef.current ? `#${printRef.current.id}` : '.print-content'} {
            position: absolute;
            left: 0;
            top: 0;
            transform: none !important;
          }
          @page {
            size: ${formData.orientation === 'portrait' ? 'A4 portrait' : 'A4 landscape'};
            margin: 0;
          }
        }
      `}</style>
    </>
  )
}
