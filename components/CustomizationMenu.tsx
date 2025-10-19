'use client'

import { useState, useEffect } from 'react'
import { X, Upload, Palette, Save, Loader2, Lock, Eye, EyeOff, MapPin, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ClientWithDetails, Coordinates, ClientUpdate } from '@/types'
import { getSecureSection, upsertSecureSection, deleteSecureSection } from '@/lib/actions/secure-section'
import dynamic from 'next/dynamic'
import ImagePositionPicker from './ImagePositionPicker'

const MapPicker = dynamic(
  () => import('./MapPicker'),
  { ssr: false }
)

interface CustomizationMenuProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  client: ClientWithDetails
}

type Tab = 'background' | 'header' | 'footer' | 'secure'

export default function CustomizationMenu({
  isOpen,
  onClose,
  onSuccess,
  client,
}: CustomizationMenuProps) {
  const [activeTab, setActiveTab] = useState<Tab>('background')
  const [loading, setLoading] = useState(false)

  // Background state
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null)
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null)
  const [mobileBackgroundPosition, setMobileBackgroundPosition] = useState(client.mobile_background_position || 'center')
  const [backgroundEffect, setBackgroundEffect] = useState(client.background_effect || 'normal')

  // Header state
  const [headerColor, setHeaderColor] = useState(client.header_color || '#4F46E5')
  const [welcomebookName, setWelcomebookName] = useState(client.name || '')
  const [headerSubtitle, setHeaderSubtitle] = useState(client.header_subtitle || 'Bienvenue dans votre guide personnalisé')

  // Footer state
  const [footerColor, setFooterColor] = useState(client.footer_color || '#1E1B4B')
  const [syncFooterWithHeader, setSyncFooterWithHeader] = useState(
    client.footer_color === client.header_color
  )
  const [footerEmail, setFooterEmail] = useState(client.footer_contact_email || '')
  const [footerPhone, setFooterPhone] = useState(client.footer_contact_phone || '')
  const [footerWebsite, setFooterWebsite] = useState(client.footer_contact_website || '')
  const [footerFacebook, setFooterFacebook] = useState(client.footer_contact_facebook || '')
  const [footerInstagram, setFooterInstagram] = useState(client.footer_contact_instagram || '')
  const [adIframeUrl, setAdIframeUrl] = useState(client.ad_iframe_url || '')

  // Secure section state
  const [secureAccessCode, setSecureAccessCode] = useState('')
  const [showSecureCode, setShowSecureCode] = useState(false)
  const [secureCheckIn, setSecureCheckIn] = useState('')
  const [secureCheckOut, setSecureCheckOut] = useState('')
  const [secureArrivalInstructions, setSecureArrivalInstructions] = useState('')
  const [securePropertyAddress, setSecurePropertyAddress] = useState('')
  const [securePropertyCoordinates, setSecurePropertyCoordinates] = useState<Coordinates | null>(null)
  const [secureWifiSsid, setSecureWifiSsid] = useState('')
  const [secureWifiPassword, setSecureWifiPassword] = useState('')
  const [secureParkingInfo, setSecureParkingInfo] = useState('')
  const [secureAdditionalInfo, setSecureAdditionalInfo] = useState('')
  const [hasExistingSecureSection, setHasExistingSecureSection] = useState(false)

  const supabase = createClient()

  // Load secure section data when modal opens
  useEffect(() => {
    if (isOpen && activeTab === 'secure') {
      loadSecureSection()
    }
  }, [isOpen, activeTab])

  const loadSecureSection = async () => {
    try {
      const data = await getSecureSection(client.id)
      if (data) {
        setHasExistingSecureSection(true)
        setSecureCheckIn(data.check_in_time || '')
        setSecureCheckOut(data.check_out_time || '')
        setSecureArrivalInstructions(data.arrival_instructions || '')
        setSecurePropertyAddress(data.property_address || '')
        setSecureWifiSsid(data.wifi_ssid || '')
        setSecureWifiPassword(data.wifi_password || '')
        setSecureParkingInfo(data.parking_info || '')
        setSecureAdditionalInfo(data.additional_info || '')

        // Parse coordinates
        if (data.property_coordinates) {
          try {
            const coords = typeof data.property_coordinates === 'string'
              ? JSON.parse(data.property_coordinates)
              : data.property_coordinates
            setSecurePropertyCoordinates(coords)
          } catch (e) {
            console.error('Error parsing coordinates:', e)
          }
        }
      }
    } catch (error) {
      console.error('Error loading secure section:', error)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBackgroundImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setBackgroundPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
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

      // Upload nouvelle image seulement si une nouvelle image a été sélectionnée
      const imageUrl = backgroundImage ? await uploadBackgroundImage() : client.background_image

      const updateData: ClientUpdate = {
        background_image: imageUrl,
        mobile_background_position: mobileBackgroundPosition,
        background_effect: backgroundEffect
      }
      const { error } = await (supabase
        .from('clients') as any)
        .update(updateData)
        .eq('id', client.id)

      if (error) throw error

      onSuccess()
      setBackgroundImage(null)
      setBackgroundPreview(null)
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
        name: welcomebookName.trim(),
        header_subtitle: headerSubtitle.trim()
      }
      const { error } = await (supabase
        .from('clients') as any)
        .update(updateData)
        .eq('id', client.id)

      if (error) throw error

      onSuccess()
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
        footer_contact_email: footerEmail,
        footer_contact_phone: footerPhone,
        footer_contact_website: footerWebsite,
        footer_contact_facebook: footerFacebook,
        footer_contact_instagram: footerInstagram,
        ad_iframe_url: adIframeUrl || null,
      }
      const { error } = await (supabase
        .from('clients') as any)
        .update(updateData)
        .eq('id', client.id)

      if (error) throw error

      onSuccess()
    } catch (error) {
      console.error('Error updating footer:', error)
      alert('Erreur lors de la mise à jour du footer')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSecureSection = async () => {
    try {
      setLoading(true)

      if (!secureAccessCode && !hasExistingSecureSection) {
        alert('Veuillez définir un code d\'accès')
        return
      }

      const result = await upsertSecureSection(
        client.id,
        secureAccessCode || 'UNCHANGED', // Si pas de nouveau code et section existe, on ne change pas le hash
        {
          checkInTime: secureCheckIn,
          checkOutTime: secureCheckOut,
          arrivalInstructions: secureArrivalInstructions,
          propertyAddress: securePropertyAddress,
          propertyCoordinates: securePropertyCoordinates || undefined,
          wifiSsid: secureWifiSsid,
          wifiPassword: secureWifiPassword,
          parkingInfo: secureParkingInfo,
          additionalInfo: secureAdditionalInfo,
        }
      )

      if (result.success) {
        onSuccess()
        setSecureAccessCode('') // Reset code input
      } else {
        alert(result.message || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Error saving secure section:', error)
      alert('Erreur lors de la sauvegarde de la section sécurisée')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSecureSection = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer la section sécurisée ? Cette action est irréversible.')) {
      return
    }

    try {
      setLoading(true)
      const result = await deleteSecureSection(client.id)

      if (result.success) {
        // Reset all fields
        setSecureAccessCode('')
        setSecureCheckIn('')
        setSecureCheckOut('')
        setSecureArrivalInstructions('')
        setSecurePropertyAddress('')
        setSecurePropertyCoordinates(null)
        setSecureWifiSsid('')
        setSecureWifiPassword('')
        setSecureParkingInfo('')
        setSecureAdditionalInfo('')
        setHasExistingSecureSection(false)
        onSuccess()
      } else {
        alert(result.message || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting secure section:', error)
      alert('Erreur lors de la suppression de la section sécurisée')
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
    } else if (activeTab === 'secure') {
      handleSaveSecureSection()
    }
  }

  if (!isOpen) return null

  const tabs = [
    { id: 'background' as Tab, label: 'Arrière-plan', icon: Upload },
    { id: 'header' as Tab, label: 'Header', icon: Palette },
    { id: 'footer' as Tab, label: 'Footer', icon: Palette },
    { id: 'secure' as Tab, label: 'Infos Sensibles', icon: Lock },
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
        <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50 overflow-x-auto">
          <div className="flex min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-3 sm:py-4 font-semibold transition whitespace-nowrap text-sm sm:text-base ${
                    activeTab === tab.id
                      ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden text-xs">{tab.id === 'background' ? 'Fond' : tab.id === 'header' ? 'Head' : tab.id === 'footer' ? 'Foot' : 'Sécu'}</span>
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
                <h3 className="text-lg font-semibold mb-2">Image de fond</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Téléchargez une image de haute qualité (recommandé : 1920x1080px minimum)
                </p>
              </div>

              {/* Current background */}
              {client.background_image && !backgroundPreview && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Image actuelle :</p>
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
                  <p className="text-sm font-medium text-gray-700 mb-2">Aperçu :</p>
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-indigo-500">
                    <img
                      src={backgroundPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
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
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Background effect selector */}
              {(client.background_image || backgroundPreview) && (
                <div className="pt-6 border-t border-gray-200">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Effet visuel
                    </label>
                    <p className="text-xs text-gray-600 mb-3">
                      Appliquez un effet pour améliorer la lisibilité du contenu
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'normal', label: 'Normal', desc: 'Léger assombrissement' },
                        { value: 'dark', label: 'Sombre', desc: 'Fond très sombre' },
                        { value: 'light', label: 'Lumineux', desc: 'Fond éclaircit' },
                        { value: 'blur', label: 'Flou', desc: 'Arrière-plan flouté' },
                      ].map((effect) => (
                        <button
                          key={effect.value}
                          type="button"
                          onClick={() => setBackgroundEffect(effect.value)}
                          className={`p-3 rounded-lg border-2 text-left transition ${
                            backgroundEffect === effect.value
                              ? 'border-indigo-600 bg-indigo-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium text-sm">{effect.label}</div>
                          <div className="text-xs text-gray-500 mt-1">{effect.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <ImagePositionPicker
                    imageUrl={backgroundPreview || client.background_image}
                    initialPosition={mobileBackgroundPosition}
                    onPositionChange={setMobileBackgroundPosition}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'header' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Personnalisation du header</h3>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Bienvenue dans votre guide personnalisé"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ce texte apparaîtra sous le nom dans le header
                </p>
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur de fond
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={headerColor}
                    onChange={(e) => setHeaderColor(e.target.value)}
                    className="w-20 h-20 rounded-lg cursor-pointer border-2 border-gray-300"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={headerColor}
                      onChange={(e) => setHeaderColor(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="#4F46E5"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Aperçu :</p>
                <div
                  className="w-full p-6 rounded-lg"
                  style={{ backgroundColor: headerColor }}
                >
                  <h1 className="text-3xl font-bold text-white mb-2">{welcomebookName || 'Nom du welcomebook'}</h1>
                  <p className="text-white opacity-90">{headerSubtitle || 'Bienvenue dans votre guide personnalisé'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'footer' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Personnalisation du footer</h3>
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

              {/* Color picker */}
              {!syncFooterWithHeader && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur de fond personnalisée
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={footerColor}
                      onChange={(e) => setFooterColor(e.target.value)}
                      className="w-20 h-20 rounded-lg cursor-pointer border-2 border-gray-300"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={footerColor}
                        onChange={(e) => setFooterColor(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="#1E1B4B"
                      />
                    </div>
                  </div>
                </div>
              )}

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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
            </div>
          )}

          {activeTab === 'secure' && (
            <div className="space-y-6">
              {/* Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900">Informations sensibles</p>
                  <p className="text-sm text-amber-800 mt-1">
                    Cette section contient des informations confidentielles (localisation exacte, code WiFi, etc.).
                    <strong> Partagez le code d'accès uniquement avec les personnes ayant une réservation confirmée.</strong>
                    <br/>
                    <strong className="text-amber-900 mt-2 inline-block">Pensez à mettre à jour régulièrement votre code d'accès pour des raisons de sécurité.</strong>
                  </p>
                </div>
              </div>

              {/* Access Code */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-900 mb-3">Code d'accès</h4>
                <p className="text-sm text-indigo-800 mb-3">
                  Définissez un code que vos voyageurs devront entrer pour accéder aux informations sensibles.
                </p>
                <div className="relative">
                  <input
                    type={showSecureCode ? 'text' : 'password'}
                    value={secureAccessCode}
                    onChange={(e) => setSecureAccessCode(e.target.value)}
                    className="w-full px-4 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder={hasExistingSecureSection ? "Nouveau code (laissez vide pour ne pas changer)" : "Définissez un code d'accès"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecureCode(!showSecureCode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-800"
                  >
                    {showSecureCode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {hasExistingSecureSection && (
                  <p className="text-xs text-indigo-700 mt-2">
                    Un code existe déjà. Laissez ce champ vide pour conserver le code actuel.
                  </p>
                )}
              </div>

              {/* Check-in / Check-out */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heure de check-in
                  </label>
                  <input
                    type="text"
                    value={secureCheckIn}
                    onChange={(e) => setSecureCheckIn(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ex: 15:00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heure de check-out
                  </label>
                  <input
                    type="text"
                    value={secureCheckOut}
                    onChange={(e) => setSecureCheckOut(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ex: 11:00"
                  />
                </div>
              </div>

              {/* Localisation avec MapPicker */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-indigo-600" />
                  Localisation précise du logement
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <MapPicker
                    initialLat={securePropertyCoordinates?.lat}
                    initialLng={securePropertyCoordinates?.lng}
                    onLocationSelect={(lat, lng) => {
                      if (lat === 0 && lng === 0) {
                        // Réinitialisation
                        setSecurePropertyCoordinates(null)
                      } else {
                        setSecurePropertyCoordinates({ lat, lng })
                      }
                    }}
                    onAddressFound={(address) => {
                      setSecurePropertyAddress(address)
                    }}
                  />
                </div>
              </div>

              {/* Adresse (auto-remplie ou manuelle) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse exacte du logement
                </label>
                <input
                  type="text"
                  value={securePropertyAddress}
                  onChange={(e) => setSecurePropertyAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Rue de la Gare 123, 6900 Marche-en-Famenne"
                />
                <p className="text-xs text-gray-500 mt-1">
                  L'adresse est automatiquement remplie lorsque vous sélectionnez une position sur la carte
                </p>
              </div>

              {/* WiFi */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Informations WiFi</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du réseau (SSID)
                  </label>
                  <input
                    type="text"
                    value={secureWifiSsid}
                    onChange={(e) => setSecureWifiSsid(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="MonWiFi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe WiFi
                  </label>
                  <input
                    type="text"
                    value={secureWifiPassword}
                    onChange={(e) => setSecureWifiPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Parking Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Informations parking
                </label>
                <textarea
                  value={secureParkingInfo}
                  onChange={(e) => setSecureParkingInfo(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Place de parking n°5 dans le garage souterrain, code d'accès: 1234"
                />
              </div>

              {/* Arrival Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructions d'arrivée
                </label>
                <textarea
                  value={secureArrivalInstructions}
                  onChange={(e) => setSecureArrivalInstructions(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="À votre arrivée, prenez l'escalier à droite. La clé se trouve dans la boîte à clés (code: 5678)"
                />
              </div>

              {/* Additional Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Informations complémentaires
                </label>
                <textarea
                  value={secureAdditionalInfo}
                  onChange={(e) => setSecureAdditionalInfo(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Toute autre information utile..."
                />
              </div>

              {/* Delete button if exists */}
              {hasExistingSecureSection && (
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleDeleteSecureSection}
                    disabled={loading}
                    className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    Supprimer la section sécurisée
                  </button>
                </div>
              )}
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
    </div>
  )
}
