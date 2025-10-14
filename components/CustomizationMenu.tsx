'use client'

import { useState } from 'react'
import { X, Upload, Palette, Save, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ClientWithDetails } from '@/types'

interface CustomizationMenuProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  client: ClientWithDetails
}

type Tab = 'background' | 'header' | 'footer'

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

  // Header state
  const [headerColor, setHeaderColor] = useState(client.header_color || '#4F46E5')

  // Footer state
  const [footerColor, setFooterColor] = useState(client.footer_color || '#1E1B4B')
  const [footerEmail, setFooterEmail] = useState(client.footer_contact_email || '')
  const [footerPhone, setFooterPhone] = useState(client.footer_contact_phone || '')
  const [footerWebsite, setFooterWebsite] = useState(client.footer_contact_website || '')
  const [footerFacebook, setFooterFacebook] = useState(client.footer_contact_facebook || '')
  const [footerInstagram, setFooterInstagram] = useState(client.footer_contact_instagram || '')

  const supabase = createClient()

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
      const imageUrl = await uploadBackgroundImage()

      const { error } = await supabase
        .from('clients')
        .update({ background_image: imageUrl })
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

      const { error } = await supabase
        .from('clients')
        .update({ header_color: headerColor })
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

      const { error } = await supabase
        .from('clients')
        .update({
          footer_color: footerColor,
          footer_contact_email: footerEmail,
          footer_contact_phone: footerPhone,
          footer_contact_website: footerWebsite,
          footer_contact_facebook: footerFacebook,
          footer_contact_instagram: footerInstagram,
        })
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

  const handleSave = () => {
    if (activeTab === 'background') {
      handleSaveBackground()
    } else if (activeTab === 'header') {
      handleSaveHeader()
    } else {
      handleSaveFooter()
    }
  }

  if (!isOpen) return null

  const tabs = [
    { id: 'background' as Tab, label: 'Arrière-plan', icon: Upload },
    { id: 'header' as Tab, label: 'Header', icon: Palette },
    { id: 'footer' as Tab, label: 'Footer', icon: Palette },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Personnalisation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition ${
                    activeTab === tab.id
                      ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
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
            </div>
          )}

          {activeTab === 'header' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Couleur du header</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Personnalisez la couleur de fond du header
                </p>
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur
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
                  <h1 className="text-3xl font-bold text-white mb-2">{client.name}</h1>
                  <p className="text-white opacity-90">Bienvenue dans votre guide personnalisé</p>
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

              {/* Color picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur de fond
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
              </div>

              {/* Preview */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Aperçu :</p>
                <div
                  className="w-full p-6 rounded-lg text-white"
                  style={{ backgroundColor: footerColor }}
                >
                  <div className="space-y-2 text-sm">
                    {footerEmail && <div>📧 {footerEmail}</div>}
                    {footerPhone && <div>📞 {footerPhone}</div>}
                    {footerWebsite && <div>🌐 Site web</div>}
                    {footerFacebook && <div>👥 Facebook</div>}
                    {footerInstagram && <div>📷 Instagram</div>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-semibold transition disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={loading || (activeTab === 'background' && !backgroundImage)}
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
