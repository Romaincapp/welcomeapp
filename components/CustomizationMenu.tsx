'use client'

import { useState, useEffect } from 'react'
import { X, Upload, Palette, Save, Loader2, AlertTriangle, Check, Crop, Images } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ClientWithDetails, ClientUpdate } from '@/types'
import ImagePositionPicker from './ImagePositionPicker'
import { ColorPicker, ColorPickerTrigger, ColorPickerContent, ColorPickerArea, ColorPickerHueSlider, ColorPickerInput, ColorPickerSwatch, ColorPickerEyeDropper, ColorPickerFormatSelect } from '@/components/ui/color-picker'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ImageCrop, ImageCropContent, ImageCropApply } from '@/components/ui/shadcn-io/image-crop'
import { compressImage, validateImageFile, blobToFile } from '@/lib/utils/image-compression'
import { AVAILABLE_BACKGROUNDS, type BackgroundOption } from '@/lib/backgrounds'
import { checkContrast, getSuggestedTextColor } from '@/lib/utils/contrast-checker'

interface CustomizationMenuProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedFields: Partial<ClientWithDetails>) => void
  client: ClientWithDetails
  initialTab?: Tab
}

type Tab = 'background' | 'header' | 'footer' | 'message'

export default function CustomizationMenu({
  isOpen,
  onClose,
  onSuccess,
  client,
  initialTab = 'background',
}: CustomizationMenuProps) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)
  const [loading, setLoading] = useState(false)

  // Reset activeTab when initialTab changes and menu opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
    }
  }, [isOpen, initialTab])

  // Background state
  const [backgroundMode, setBackgroundMode] = useState<'image' | 'color'>(client.background_image ? 'image' : 'color')
  const [backgroundSource, setBackgroundSource] = useState<'upload' | 'gallery'>('gallery')
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null)
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null)
  const [mobileBackgroundPosition, setMobileBackgroundPosition] = useState(client.mobile_background_position || 'center')
  const [backgroundEffect, setBackgroundEffect] = useState(client.background_effect || 'normal')
  const [selectedPredefinedBg, setSelectedPredefinedBg] = useState<string | null>(null)
  const [showCropModal, setShowCropModal] = useState(false)
  const [fileToCrop, setFileToCrop] = useState<File | null>(null)
  const [cropAspectRatio, setCropAspectRatio] = useState<number | undefined>(undefined)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [backgroundColor, setBackgroundColor] = useState(client.background_color || '#f3f4f6')
  const [syncBackgroundWithHeader, setSyncBackgroundWithHeader] = useState(client.sync_background_with_header || false)
  const [syncBackgroundWithFooter, setSyncBackgroundWithFooter] = useState(client.sync_background_with_footer || false)

  // Header state
  const [headerColor, setHeaderColor] = useState(client.header_color || '#4F46E5')
  const [headerTextColor, setHeaderTextColor] = useState(client.header_text_color || '#ffffff')
  const [welcomebookName, setWelcomebookName] = useState(client.name || '')
  const [headerSubtitle, setHeaderSubtitle] = useState(client.header_subtitle || 'Bienvenue dans votre guide personnalisé')

  // Footer state
  const [footerColor, setFooterColor] = useState(client.footer_color || '#1E1B4B')
  const [footerTextColor, setFooterTextColor] = useState(client.footer_text_color || '#ffffff')
  const [syncFooterWithHeader, setSyncFooterWithHeader] = useState(
    client.footer_color === client.header_color
  )
  const [categoryTitleColor, setCategoryTitleColor] = useState(client.category_title_color || null)
  const [footerEmail, setFooterEmail] = useState(client.footer_contact_email || '')
  const [footerPhone, setFooterPhone] = useState(client.footer_contact_phone || '')
  const [footerWebsite, setFooterWebsite] = useState(client.footer_contact_website || '')
  const [footerFacebook, setFooterFacebook] = useState(client.footer_contact_facebook || '')
  const [footerInstagram, setFooterInstagram] = useState(client.footer_contact_instagram || '')
  const [adIframeUrl, setAdIframeUrl] = useState(client.ad_iframe_url || '')
  const [footerCustomText, setFooterCustomText] = useState(client.footer_custom_text || '')

  // Message state
  const [welcomeMessage, setWelcomeMessage] = useState(client.welcome_message || '')
  const [welcomeMessagePhoto, setWelcomeMessagePhoto] = useState<File | null>(null)
  const [welcomeMessagePhotoPreview, setWelcomeMessagePhotoPreview] = useState<string | null>(client.welcome_message_photo || null)

  const supabase = createClient()

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateImageFile(file, 10)
    if (!validation.valid) {
      setValidationError(validation.error || 'Fichier invalide')
      return
    }

    setValidationError(null)
    setFileToCrop(file)
    setShowCropModal(true)
  }

  const handleCropComplete = async (croppedImageDataUrl: string) => {
    try {
      // Convert base64 to Blob
      const response = await fetch(croppedImageDataUrl)
      const blob = await response.blob()

      // Convert blob to File
      const file = blobToFile(blob, fileToCrop?.name || 'background.png')

      // Compress image
      const compressedFile = await compressImage(file, 1920, 0.8)

      // Set as background and generate preview
      setBackgroundImage(compressedFile)
      const reader = new FileReader()
      reader.onloadend = () => {
        setBackgroundPreview(reader.result as string)
      }
      reader.readAsDataURL(compressedFile)

      // Close modal
      setShowCropModal(false)
      setFileToCrop(null)
    } catch (error) {
      console.error('Error processing cropped image:', error)
      setValidationError('Erreur lors du traitement de l\'image')
    }
  }

  const handleSelectPredefinedBackground = (bg: BackgroundOption) => {
    setSelectedPredefinedBg(bg.path)
    setBackgroundPreview(bg.path)
    setBackgroundImage(null)
  }

  const uploadBackgroundImage = async () => {
    if (!backgroundImage) return client.background_image

    const fileExt = backgroundImage.name.split('.').pop()
    const fileName = `${client.id}/background-${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from('media')
      .upload(fileName, backgroundImage)

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(fileName)

    return publicUrl
  }

  const handleSaveBackground = async () => {
    try {
      setLoading(true)

      let imageUrl = client.background_image

      // Si mode couleur, on supprime l'image
      if (backgroundMode === 'color') {
        // Supprimer l'ancien background du Storage si il existe ET qu'il n'est pas un background prédéfini
        if (client.background_image && !client.background_image.startsWith('/backgrounds/')) {
          const oldFilePath = client.background_image.split('/storage/v1/object/public/media/')[1]
          if (oldFilePath) {
            console.log('[BACKGROUND] Suppression de l\'ancien background:', oldFilePath)
            await supabase.storage.from('media').remove([oldFilePath])
          }
        }
        imageUrl = null
      }
      // Si mode image
      else if (backgroundMode === 'image') {
        // Si un background prédéfini est sélectionné
        if (selectedPredefinedBg && backgroundSource === 'gallery') {
          imageUrl = selectedPredefinedBg
        }
        // Si une nouvelle image custom est uploadée
        else if (backgroundImage && backgroundSource === 'upload') {
          // Supprimer l'ancien background du Storage si il existe ET qu'il n'est pas un background prédéfini
          if (client.background_image && !client.background_image.startsWith('/backgrounds/')) {
            const oldFilePath = client.background_image.split('/storage/v1/object/public/media/')[1]
            if (oldFilePath) {
              console.log('[BACKGROUND] Suppression de l\'ancien background:', oldFilePath)
              await supabase.storage.from('media').remove([oldFilePath])
            }
          }

          // Upload la nouvelle image
          imageUrl = await uploadBackgroundImage()
        }
      }

      const finalBackgroundColor = syncBackgroundWithHeader
        ? headerColor
        : syncBackgroundWithFooter
        ? (syncFooterWithHeader ? headerColor : footerColor)
        : backgroundColor

      const updateData: ClientUpdate = {
        background_image: imageUrl,
        mobile_background_position: mobileBackgroundPosition,
        background_effect: backgroundEffect,
        background_color: finalBackgroundColor,
        sync_background_with_header: syncBackgroundWithHeader,
        sync_background_with_footer: syncBackgroundWithFooter,
        category_title_color: categoryTitleColor
      }
      const { error } = await (supabase
        .from('clients') as any)
        .update(updateData)
        .eq('id', client.id)

      if (error) throw error

      // Appeler onSuccess avec les champs mis à jour pour update optimiste
      onSuccess({
        background_image: imageUrl,
        mobile_background_position: mobileBackgroundPosition,
        background_effect: backgroundEffect,
        background_color: finalBackgroundColor,
        sync_background_with_header: syncBackgroundWithHeader,
        sync_background_with_footer: syncBackgroundWithFooter,
        category_title_color: categoryTitleColor,
      })

      setBackgroundImage(null)
      setBackgroundPreview(null)
      setSelectedPredefinedBg(null)
    } catch (error) {
      console.error('Error updating background:', error)
      alert('Erreur lors de la mise à jour du fond')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveHeader = async () => {
    try {
      setLoading(true)

      if (!welcomebookName.trim()) {
        alert('Le nom du welcomebook ne peut pas être vide')
        setLoading(false)
        return
      }

      const updateData: ClientUpdate = {
        header_color: headerColor,
        header_text_color: headerTextColor,
        name: welcomebookName.trim(),
        header_subtitle: headerSubtitle.trim()
      }
      const { error } = await (supabase
        .from('clients') as any)
        .update(updateData)
        .eq('id', client.id)

      if (error) throw error

      onSuccess({
        header_color: headerColor,
        header_text_color: headerTextColor,
        name: welcomebookName.trim(),
        header_subtitle: headerSubtitle.trim(),
      })
    } catch (error) {
      console.error('Error updating header:', error)
      alert('Erreur lors de la mise à jour du header')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveFooter = async () => {
    try {
      setLoading(true)

      const finalFooterColor = syncFooterWithHeader ? headerColor : footerColor

      const updateData: ClientUpdate = {
        footer_color: finalFooterColor,
        footer_text_color: footerTextColor,
        footer_contact_email: footerEmail,
        footer_contact_phone: footerPhone,
        footer_contact_website: footerWebsite,
        footer_contact_facebook: footerFacebook,
        footer_contact_instagram: footerInstagram,
        ad_iframe_url: adIframeUrl || null,
        footer_custom_text: footerCustomText.trim() || null,
      }
      const { error } = await (supabase
        .from('clients') as any)
        .update(updateData)
        .eq('id', client.id)

      if (error) throw error

      onSuccess({
        footer_color: finalFooterColor,
        footer_text_color: footerTextColor,
        footer_contact_email: footerEmail,
        footer_contact_phone: footerPhone,
        footer_contact_website: footerWebsite,
        footer_contact_facebook: footerFacebook,
        footer_contact_instagram: footerInstagram,
        ad_iframe_url: adIframeUrl || null,
        footer_custom_text: footerCustomText.trim() || null,
      })
    } catch (error) {
      console.error('Error updating footer:', error)
      alert('Erreur lors de la mise à jour du footer')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveMessage = async () => {
    try {
      setLoading(true)

      let photoUrl = client.welcome_message_photo

      // Upload de la nouvelle photo si sélectionnée
      if (welcomeMessagePhoto) {
        const fileExt = welcomeMessagePhoto.name.split('.').pop()
        const fileName = `${client.id}/welcome-photo-${Date.now()}.${fileExt}`

        const { data, error: uploadError } = await supabase.storage
          .from('media')
          .upload(fileName, welcomeMessagePhoto)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(fileName)

        photoUrl = publicUrl
      }

      const updateData: ClientUpdate = {
        welcome_message: welcomeMessage.trim() || null,
        welcome_message_photo: photoUrl,
      }
      const { error } = await (supabase
        .from('clients') as any)
        .update(updateData)
        .eq('id', client.id)

      if (error) throw error

      onSuccess({
        welcome_message: welcomeMessage.trim() || null,
        welcome_message_photo: photoUrl,
      })
    } catch (error) {
      console.error('Error updating message:', error)
      alert('Erreur lors de la mise à jour du message')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    if (activeTab === 'background') {
      handleSaveBackground()
    } else if (activeTab === 'header') {
      handleSaveHeader()
    } else if (activeTab === 'footer') {
      handleSaveFooter()
    } else if (activeTab === 'message') {
      handleSaveMessage()
    }
  }

  if (!isOpen) return null

  const tabs = [
    { id: 'background' as Tab, label: 'Arrière-plan', icon: Upload },
    { id: 'header' as Tab, label: 'Header', icon: Palette },
    { id: 'footer' as Tab, label: 'Footer', icon: Palette },
    { id: 'message' as Tab, label: 'Message', icon: Palette },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Personnalisation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50">
          <div className="flex w-full">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-6 py-3 sm:py-4 font-semibold transition whitespace-nowrap text-sm sm:text-base ${
                    activeTab === tab.id
                      ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden text-xs">{tab.id === 'background' ? 'Fond' : tab.id === 'header' ? 'Head' : tab.id === 'footer' ? 'Foot' : tab.id === 'message' ? 'Msg' : 'Autre'}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'background' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Arrière-plan</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Choisissez une image de fond ou une couleur unie
                </p>
              </div>

              {/* Mode selector: Image vs Couleur */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setBackgroundMode('image')}
                  className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition flex items-center justify-center gap-2 ${
                    backgroundMode === 'image'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Images className="w-4 h-4" />
                  Image
                </button>
                <button
                  type="button"
                  onClick={() => setBackgroundMode('color')}
                  className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition flex items-center justify-center gap-2 ${
                    backgroundMode === 'color'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  Couleur
                </button>
              </div>

              {/* Tabs: Upload / Galerie (seulement si mode image) */}
              {backgroundMode === 'image' && (
                <div className="border-b border-gray-200">
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setBackgroundSource('upload')}
                      className={`pb-3 px-1 font-medium text-sm transition border-b-2 ${
                        backgroundSource === 'upload'
                          ? 'border-indigo-600 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Upload Custom
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBackgroundSource('gallery')}
                      className={`pb-3 px-1 font-medium text-sm transition border-b-2 ${
                        backgroundSource === 'gallery'
                          ? 'border-indigo-600 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Images className="w-4 h-4" />
                        Galerie Prédéfinie
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Upload Section */}
              {backgroundMode === 'image' && backgroundSource === 'upload' && (
                <>
                  {/* Current background */}
                  {client.background_image && !backgroundPreview && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-700">Image actuelle :</p>
                        <button
                          type="button"
                          onClick={() => {
                            setBackgroundMode('color')
                            setBackgroundPreview(null)
                            setBackgroundImage(null)
                            setSelectedPredefinedBg(null)
                          }}
                          className="text-xs text-red-600 hover:text-red-700 hover:underline flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          Supprimer l'image
                        </button>
                      </div>
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                        <img
                          src={client.background_image}
                          alt="Current background"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Preview */}
                  {backgroundPreview && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-700">Aperçu :</p>
                        <button
                          type="button"
                          onClick={() => {
                            setBackgroundPreview(null)
                            setBackgroundImage(null)
                          }}
                          className="text-xs text-gray-600 hover:text-gray-700 hover:underline flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          Annuler
                        </button>
                      </div>
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-indigo-500">
                        <img
                          src={backgroundPreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Validation Error */}
                  {validationError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-red-800 text-sm">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span>{validationError}</span>
                      </div>
                    </div>
                  )}

                  {/* Upload button */}
                  <div>
                    <label className="block">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 hover:bg-indigo-50 transition cursor-pointer">
                        <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Cliquez pour télécharger une nouvelle image
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG ou WEBP (max. 10MB)
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Vous pourrez recadrer l'image après sélection
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                </>
              )}

              {/* Galerie Section */}
              {backgroundMode === 'image' && backgroundSource === 'gallery' && (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Sélectionnez un fond parmi notre galerie de {AVAILABLE_BACKGROUNDS.length} images professionnelles
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {AVAILABLE_BACKGROUNDS.map((bg) => (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => handleSelectPredefinedBackground(bg)}
                        className={`relative rounded-lg overflow-hidden border-2 transition group ${
                          selectedPredefinedBg === bg.path
                            ? 'border-indigo-600 ring-2 ring-indigo-200'
                            : 'border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        <div className="aspect-video relative">
                          <img
                            src={bg.path}
                            alt={bg.name}
                            className="w-full h-full object-cover"
                          />
                          {selectedPredefinedBg === bg.path && (
                            <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                              <div className="bg-indigo-600 rounded-full p-1.5">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="p-2 bg-white">
                          <p className="text-xs font-medium text-gray-900 truncate">
                            {bg.name}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Background effect selector - Instagram style */}
              {backgroundMode === 'image' && (client.background_image || backgroundPreview || selectedPredefinedBg) && (
                <div className="pt-6 border-t border-gray-200">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Effets visuels
                    </label>
                    <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
                      {[
                        { value: 'normal', label: 'Normal', icon: '◐' },
                        { value: 'dark', label: 'Sombre', icon: '●' },
                        { value: 'light', label: 'Lumineux', icon: '○' },
                        { value: 'blur', label: 'Flou', icon: '◎' },
                      ].map((effect) => (
                        <button
                          key={effect.value}
                          type="button"
                          onClick={() => setBackgroundEffect(effect.value)}
                          className="flex-shrink-0 snap-start"
                        >
                          <div className="w-20 h-20 relative rounded-lg overflow-hidden border-2 transition mb-1.5 group">
                            <img
                              src={backgroundPreview || selectedPredefinedBg || client.background_image || ''}
                              alt={effect.label}
                              className={`w-full h-full object-cover ${
                                effect.value === 'blur' ? 'blur-sm' : ''
                              }`}
                            />
                            <div
                              className={`absolute inset-0 ${
                                effect.value === 'light'
                                  ? 'bg-white/30'
                                  : effect.value === 'dark'
                                  ? 'bg-black/60'
                                  : 'bg-black/40'
                              }`}
                            />
                            {backgroundEffect === effect.value && (
                              <div className="absolute inset-0 ring-2 ring-indigo-600 ring-inset rounded-lg" />
                            )}
                          </div>
                          <p className={`text-xs text-center font-medium ${
                            backgroundEffect === effect.value
                              ? 'text-indigo-600'
                              : 'text-gray-600'
                          }`}>
                            {effect.label}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <ImagePositionPicker
                    imageUrl={backgroundPreview || selectedPredefinedBg || client.background_image}
                    initialPosition={mobileBackgroundPosition}
                    onPositionChange={setMobileBackgroundPosition}
                    effect={backgroundEffect as 'normal' | 'dark' | 'light' | 'blur'}
                  />
                </div>
              )}

              {/* Couleur de fond (visible seulement en mode couleur) */}
              {backgroundMode === 'color' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-md font-semibold mb-2 text-gray-900">Couleur de fond</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Choisissez une couleur unie pour l'arrière-plan de votre welcomebook
                    </p>
                  </div>

                  {/* Warning si une image existe */}
                  {client.background_image && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-800">
                          <p className="font-medium mb-1">Image de fond détectée</p>
                          <p className="text-xs text-amber-700">
                            En enregistrant en mode couleur, l'image de fond actuelle sera supprimée définitivement.
                            Vous pouvez revenir au mode "Image" pour conserver votre image.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Aperçu de la couleur */}
                  <div className="border-2 border-gray-200 rounded-lg p-8 text-center" style={{ backgroundColor: syncBackgroundWithHeader ? headerColor : syncBackgroundWithFooter ? (syncFooterWithHeader ? headerColor : footerColor) : backgroundColor }}>
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 inline-block">
                      <p className="text-sm font-medium text-gray-900 mb-1">Aperçu de l'arrière-plan</p>
                      <p className="text-xs text-gray-600">Couleur appliquée : {syncBackgroundWithHeader ? headerColor : syncBackgroundWithFooter ? (syncFooterWithHeader ? headerColor : footerColor) : backgroundColor}</p>
                    </div>
                  </div>

                  {/* Sync options */}
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                      <input
                        type="checkbox"
                        checked={syncBackgroundWithHeader}
                        onChange={(e) => {
                          setSyncBackgroundWithHeader(e.target.checked)
                          if (e.target.checked) setSyncBackgroundWithFooter(false)
                        }}
                        className="mt-1 w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Synchroniser avec le header</p>
                        <p className="text-sm text-gray-600">Le fond utilisera la couleur du header</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                      <input
                        type="checkbox"
                        checked={syncBackgroundWithFooter}
                        onChange={(e) => {
                          setSyncBackgroundWithFooter(e.target.checked)
                          if (e.target.checked) setSyncBackgroundWithHeader(false)
                        }}
                        className="mt-1 w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Synchroniser avec le footer</p>
                        <p className="text-sm text-gray-600">Le fond utilisera la couleur du footer</p>
                      </div>
                    </label>
                  </div>

                  {/* Color picker */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Couleur de fond personnalisée
                    </label>
                    {(syncBackgroundWithHeader || syncBackgroundWithFooter) && (
                      <div className="mb-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSyncBackgroundWithHeader(false)
                            setSyncBackgroundWithFooter(false)
                          }}
                          className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline"
                        >
                          Cliquez ici pour personnaliser la couleur
                        </button>
                      </div>
                    )}
                    <ColorPicker
                      value={backgroundColor}
                      onValueChange={(color) => {
                        setBackgroundColor(color)
                        // Décocher automatiquement les syncs si on change la couleur
                        if (syncBackgroundWithHeader || syncBackgroundWithFooter) {
                          setSyncBackgroundWithHeader(false)
                          setSyncBackgroundWithFooter(false)
                        }
                      }}
                    >
                      <ColorPickerTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal h-auto py-3 gap-3"
                          disabled={syncBackgroundWithHeader || syncBackgroundWithFooter}
                        >
                          <ColorPickerSwatch className="w-10 h-10" />
                          <span className="font-mono text-sm">
                            {syncBackgroundWithHeader
                              ? `${headerColor} (sync header)`
                              : syncBackgroundWithFooter
                              ? `${syncFooterWithHeader ? headerColor : footerColor} (sync footer)`
                              : backgroundColor}
                          </span>
                        </Button>
                      </ColorPickerTrigger>
                      <ColorPickerContent>
                        <ColorPickerArea />
                        <ColorPickerHueSlider />
                        <div className="flex gap-2">
                          <ColorPickerEyeDropper />
                          <ColorPickerFormatSelect className="flex-1" />
                        </div>
                        <ColorPickerInput withoutAlpha />
                      </ColorPickerContent>
                    </ColorPicker>
                  </div>
                </div>
              )}

              {/* Couleur des titres de catégories */}
              <div className="pt-6 border-t border-gray-200">
                <div>
                  <h4 className="text-md font-semibold mb-2 text-gray-900">Couleur des titres de catégories</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Par défaut, hérite de la couleur du header
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur personnalisée (optionnel)
                  </label>
                  <ColorPicker
                    value={categoryTitleColor || headerColor}
                    onValueChange={(color) => setCategoryTitleColor(color === headerColor ? null : color)}
                  >
                    <ColorPickerTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal h-auto py-3 gap-3">
                        <ColorPickerSwatch className="w-10 h-10" />
                        <span className="font-mono text-sm">{categoryTitleColor || headerColor}</span>
                        {!categoryTitleColor && <span className="text-xs text-gray-500 ml-auto">(hérite du header)</span>}
                      </Button>
                    </ColorPickerTrigger>
                    <ColorPickerContent>
                      <ColorPickerArea />
                      <ColorPickerHueSlider />
                      <div className="flex gap-2">
                        <ColorPickerEyeDropper />
                        <ColorPickerFormatSelect className="flex-1" />
                      </div>
                      <ColorPickerInput withoutAlpha />
                    </ColorPickerContent>
                  </ColorPicker>
                  {categoryTitleColor && (
                    <button
                      onClick={() => setCategoryTitleColor(null)}
                      className="text-xs text-indigo-600 hover:text-indigo-700 mt-2"
                    >
                      Réinitialiser (hériter du header)
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'header' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Personnalisation du header</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Nom, sous-titre et couleur du header
                </p>
              </div>

              {/* Nom du welcomebook */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du welcomebook
                </label>
                <input
                  type="text"
                  value={welcomebookName}
                  onChange={(e) => setWelcomebookName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                  placeholder="Villa des Ardennes"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ce nom apparaîtra dans le header et le titre de la page
                </p>
              </div>

              {/* Sous-titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sous-titre
                </label>
                <input
                  type="text"
                  value={headerSubtitle}
                  onChange={(e) => setHeaderSubtitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                  placeholder="Bienvenue dans votre guide personnalisé"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ce texte apparaîtra sous le nom dans le header
                </p>
              </div>

              {/* Color picker - fond */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur de fond du header
                </label>
                <ColorPicker
                  value={headerColor}
                  onValueChange={setHeaderColor}
                >
                  <ColorPickerTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal h-auto py-3 gap-3">
                      <ColorPickerSwatch className="w-10 h-10" />
                      <span className="font-mono text-sm">{headerColor}</span>
                    </Button>
                  </ColorPickerTrigger>
                  <ColorPickerContent>
                    <ColorPickerArea />
                    <ColorPickerHueSlider />
                    <div className="flex gap-2">
                      <ColorPickerEyeDropper />
                      <ColorPickerFormatSelect className="flex-1" />
                    </div>
                    <ColorPickerInput withoutAlpha />
                  </ColorPickerContent>
                </ColorPicker>
              </div>

              {/* Color picker - texte */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur du texte
                </label>
                <ColorPicker
                  value={headerTextColor}
                  onValueChange={setHeaderTextColor}
                >
                  <ColorPickerTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal h-auto py-3 gap-3">
                      <ColorPickerSwatch className="w-10 h-10" />
                      <span className="font-mono text-sm">{headerTextColor}</span>
                    </Button>
                  </ColorPickerTrigger>
                  <ColorPickerContent>
                    <ColorPickerArea />
                    <ColorPickerHueSlider />
                    <div className="flex gap-2">
                      <ColorPickerEyeDropper />
                      <ColorPickerFormatSelect className="flex-1" />
                    </div>
                    <ColorPickerInput withoutAlpha />
                  </ColorPickerContent>
                </ColorPicker>
                <button
                  onClick={() => setHeaderTextColor(getSuggestedTextColor(headerColor))}
                  className="text-xs text-indigo-600 hover:text-indigo-700 mt-2"
                >
                  Suggestion automatique ({getSuggestedTextColor(headerColor) === '#ffffff' ? 'Blanc' : 'Noir'})
                </button>
              </div>

              {/* Alerte contraste */}
              {(() => {
                const contrastResult = checkContrast(headerColor, headerTextColor)
                return !contrastResult.isValid ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start gap-2 text-amber-800 text-sm">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{contrastResult.message}</span>
                    </div>
                  </div>
                ) : null
              })()}

              {/* Preview */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Aperçu :</p>
                <div
                  className="w-full p-6 rounded-lg"
                  style={{ backgroundColor: headerColor, color: headerTextColor }}
                >
                  <h1 className="text-3xl font-bold mb-2">{welcomebookName || 'Nom du welcomebook'}</h1>
                  <p className="opacity-90">{headerSubtitle || 'Bienvenue dans votre guide personnalisé'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'footer' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Personnalisation du footer</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Couleur et informations de contact
                </p>
              </div>

              {/* Sync with header option */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncFooterWithHeader}
                    onChange={(e) => setSyncFooterWithHeader(e.target.checked)}
                    className="mt-1 w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Synchroniser avec la couleur du header</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Le footer utilisera automatiquement la même couleur que le header pour un thème cohérent
                    </p>
                  </div>
                </label>
              </div>

              {/* Color picker - fond */}
              {!syncFooterWithHeader && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur de fond personnalisée
                  </label>
                  <ColorPicker
                    value={footerColor}
                    onValueChange={setFooterColor}
                  >
                    <ColorPickerTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal h-auto py-3 gap-3">
                        <ColorPickerSwatch className="w-10 h-10" />
                        <span className="font-mono text-sm">{footerColor}</span>
                      </Button>
                    </ColorPickerTrigger>
                    <ColorPickerContent>
                      <ColorPickerArea />
                      <ColorPickerHueSlider />
                      <div className="flex gap-2">
                        <ColorPickerEyeDropper />
                        <ColorPickerFormatSelect className="flex-1" />
                      </div>
                      <ColorPickerInput withoutAlpha />
                    </ColorPickerContent>
                  </ColorPicker>
                </div>
              )}

              {/* Color picker - texte */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur du texte
                </label>
                <ColorPicker
                  value={footerTextColor}
                  onValueChange={setFooterTextColor}
                >
                  <ColorPickerTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal h-auto py-3 gap-3">
                      <ColorPickerSwatch className="w-10 h-10" />
                      <span className="font-mono text-sm">{footerTextColor}</span>
                    </Button>
                  </ColorPickerTrigger>
                  <ColorPickerContent>
                    <ColorPickerArea />
                    <ColorPickerHueSlider />
                    <div className="flex gap-2">
                      <ColorPickerEyeDropper />
                      <ColorPickerFormatSelect className="flex-1" />
                    </div>
                    <ColorPickerInput withoutAlpha />
                  </ColorPickerContent>
                </ColorPicker>
                <button
                  onClick={() => setFooterTextColor(getSuggestedTextColor(syncFooterWithHeader ? headerColor : footerColor))}
                  className="text-xs text-indigo-600 hover:text-indigo-700 mt-2"
                >
                  Suggestion automatique ({getSuggestedTextColor(syncFooterWithHeader ? headerColor : footerColor) === '#ffffff' ? 'Blanc' : 'Noir'})
                </button>
              </div>

              {/* Alerte contraste */}
              {(() => {
                const footerBgColor = syncFooterWithHeader ? headerColor : footerColor
                const contrastResult = checkContrast(footerBgColor, footerTextColor)
                return !contrastResult.isValid ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start gap-2 text-amber-800 text-sm">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{contrastResult.message}</span>
                    </div>
                  </div>
                ) : null
              })()}

              {/* Contact info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Informations de contact</h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={footerEmail}
                    onChange={(e) => setFooterEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                    placeholder="contact@exemple.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={footerPhone}
                    onChange={(e) => setFooterPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                    placeholder="+32 123 45 67 89"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site web
                  </label>
                  <input
                    type="url"
                    value={footerWebsite}
                    onChange={(e) => setFooterWebsite(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                    placeholder="https://www.exemple.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facebook
                  </label>
                  <input
                    type="url"
                    value={footerFacebook}
                    onChange={(e) => setFooterFacebook(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                    placeholder="https://facebook.com/votrepage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instagram
                  </label>
                  <input
                    type="url"
                    value={footerInstagram}
                    onChange={(e) => setFooterInstagram(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                    placeholder="https://instagram.com/votrepage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL iframe publicitaire (optionnel)
                  </label>
                  <input
                    type="url"
                    value={adIframeUrl}
                    onChange={(e) => setAdIframeUrl(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                    placeholder="https://example.com/pub"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ajoutez une pub sous forme d'iframe dans le footer (laisser vide pour désactiver)
                  </p>
                </div>
              </div>

              {/* Preview - Nouveau design avec boutons ronds */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Aperçu :</p>
                <div
                  className="w-full p-6 rounded-lg text-white"
                  style={{ backgroundColor: syncFooterWithHeader ? headerColor : footerColor }}
                >
                  {/* Aperçu pub si URL renseignée */}
                  {adIframeUrl && (
                    <div className="mb-4 bg-white rounded-lg p-3 text-center text-gray-500 text-xs">
                      📢 Emplacement publicité iframe
                    </div>
                  )}

                  {/* Aperçu boutons ronds */}
                  <div className="flex justify-center items-center gap-3 flex-wrap">
                    {footerPhone && (
                      <>
                        <div className="flex flex-col items-center gap-1">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg text-sm"
                            style={{ backgroundColor: `${headerColor}cc` }}
                          >
                            💬
                          </div>
                          <span className="text-[10px] opacity-90">SMS</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg text-sm"
                            style={{ backgroundColor: `${headerColor}cc` }}
                          >
                            📞
                          </div>
                          <span className="text-[10px] opacity-90">Appeler</span>
                        </div>
                      </>
                    )}
                    {footerEmail && (
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg text-sm"
                          style={{ backgroundColor: `${headerColor}cc` }}
                        >
                          📧
                        </div>
                        <span className="text-[10px] opacity-90">Mail</span>
                      </div>
                    )}
                    {footerWebsite && (
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg text-sm"
                          style={{ backgroundColor: `${headerColor}cc` }}
                        >
                          🌐
                        </div>
                        <span className="text-[10px] opacity-90">Site</span>
                      </div>
                    )}
                    {footerFacebook && (
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg text-sm"
                          style={{ backgroundColor: `${headerColor}cc` }}
                        >
                          👥
                        </div>
                        <span className="text-[10px] opacity-90">Facebook</span>
                      </div>
                    )}
                    {footerInstagram && (
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg text-sm"
                          style={{ backgroundColor: `${headerColor}cc` }}
                        >
                          📷
                        </div>
                        <span className="text-[10px] opacity-90">Instagram</span>
                      </div>
                    )}
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg text-sm"
                        style={{ backgroundColor: `${headerColor}cc` }}
                      >
                        📤
                      </div>
                      <span className="text-[10px] opacity-90">Partager</span>
                    </div>
                  </div>

                  {/* Aperçu texte personnalisé */}
                  {footerCustomText && (
                    <div className="mb-3 text-center">
                      <p className="text-xs opacity-90">{footerCustomText}</p>
                    </div>
                  )}

                  {/* Powered by */}
                  <div className="mt-4 pt-4 border-t border-white border-opacity-20 text-center">
                    <span className="text-[10px] opacity-70">Powered by welcomeapp</span>
                  </div>
                </div>
                {syncFooterWithHeader && (
                  <p className="text-xs text-gray-500 mt-2 italic">
                    ✨ Synchronisé avec le header ({headerColor})
                  </p>
                )}
              </div>

              {/* Texte personnalisé du footer */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Texte personnalisé</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message au bas de la page
                  </label>
                  <textarea
                    value={footerCustomText}
                    onChange={(e) => setFooterCustomText(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                    placeholder="Passez un excellent séjour !"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    S'affiche avant "Powered by welcomeapp". Laissez vide pour masquer.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'message' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Message d'accueil</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Personnalisez le message qui s'affiche au premier chargement
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  💡 <strong>Conseil :</strong> Rédigez un message court et chaleureux. C'est la première chose que vos voyageurs verront !
                </p>
              </div>

              {/* Photo du message d'accueil */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo (optionnelle)
                </label>
                <div className="flex items-center gap-4">
                  {welcomeMessagePhotoPreview && (
                    <div className="w-16 h-16 rounded-full overflow-hidden shadow-md">
                      <img
                        src={welcomeMessagePhotoPreview}
                        alt="Aperçu"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setWelcomeMessagePhoto(file)
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setWelcomeMessagePhotoPreview(reader.result as string)
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="text-sm text-gray-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Remplace l'emoji 👋. Format recommandé : carré, 200x200px minimum.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message d'accueil
                </label>
                <textarea
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                  placeholder="Bienvenue ! Nous sommes ravis de vous accueillir. Ce guide contient toutes les informations pour un séjour réussi."
                />
                <p className="text-xs text-gray-500 mt-1">
                  S'affiche une seule fois dans un modal au premier chargement. Laissez vide pour désactiver.
                </p>
              </div>

              {/* Aperçu du modal */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Aperçu :</p>
                <div className="bg-white rounded-2xl shadow-2xl max-w-md mx-auto overflow-hidden border border-gray-200">
                  <div className="p-8 text-center">
                    {welcomeMessagePhotoPreview ? (
                      <div className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden shadow-lg">
                        <img
                          src={welcomeMessagePhotoPreview}
                          alt="Aperçu"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-4xl">👋</span>
                      </div>
                    )}
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {client.name} vous souhaite la bienvenue
                    </h2>
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm">
                      {welcomeMessage || "Votre message s'affichera ici..."}
                    </p>
                    <button
                      disabled
                      className="mt-8 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold opacity-75 cursor-not-allowed"
                    >
                      C'est parti !
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 sm:p-6 border-t border-gray-200 flex items-center justify-end gap-2 sm:gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-semibold transition disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </div>

      {/* Crop Modal */}
      <Dialog open={showCropModal} onOpenChange={setShowCropModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Recadrer l'image</DialogTitle>
            <DialogDescription className="text-gray-600">
              Choisissez un ratio et ajustez le cadrage de votre image
            </DialogDescription>
          </DialogHeader>

          {fileToCrop && (
            <ImageCrop
              key={cropAspectRatio ?? 'free'} // Force re-render quand le ratio change
              file={fileToCrop}
              aspect={cropAspectRatio}
              onCrop={handleCropComplete}
              maxImageSize={1024 * 1024 * 5}
            >
              <div className="space-y-4">
                {/* Ratio Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ratio de recadrage
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[
                      { label: 'Libre', value: undefined },
                      { label: '16:9', value: 16 / 9 },
                      { label: '4:3', value: 4 / 3 },
                      { label: '1:1', value: 1 },
                      { label: '21:9', value: 21 / 9 },
                      { label: '9:16', value: 9 / 16 },
                    ].map((ratio) => (
                      <button
                        key={ratio.label}
                        type="button"
                        onClick={() => setCropAspectRatio(ratio.value)}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border-2 transition ${
                          cropAspectRatio === ratio.value
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {ratio.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Crop Area */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <ImageCropContent />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCropModal(false)
                    setFileToCrop(null)
                  }}
                >
                  Annuler
                </Button>
                <ImageCropApply asChild>
                  <Button type="button" className="gap-2">
                    <Crop className="w-4 h-4" />
                    Valider le recadrage
                  </Button>
                </ImageCropApply>
              </DialogFooter>
            </ImageCrop>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
