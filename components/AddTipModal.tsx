'use client'

import { useState } from 'react'
import { X, Plus, Loader2, Upload, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AddTipModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  clientId: string
  categories: Array<{ id: string; name: string; icon?: string | null }>
}

export default function AddTipModal({ isOpen, onClose, onSuccess, clientId, categories }: AddTipModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [imageUrls, setImageUrls] = useState<string>('')
  const [imageInputMode, setImageInputMode] = useState<'file' | 'url'>('file')

  // Données du formulaire
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [comment, setComment] = useState('')
  const [location, setLocation] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [routeUrl, setRouteUrl] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [website, setWebsite] = useState('')

  const supabase = createClient()

  if (!isOpen) return null

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setImageFiles(files)

    // Créer des previews
    const previews = files.map(file => URL.createObjectURL(file))
    setImagePreviews(previews)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // 1. Créer le conseil
      const tipData: any = {
        client_id: clientId,
        title,
        comment: comment || null,
        location: location || null,
        contact_phone: contactPhone || null,
        contact_email: contactEmail || null,
        route_url: routeUrl || null,
        promo_code: promoCode || null,
        category_id: categoryId || null,
      }

      // Ajouter les coordonnées si fournies
      if (latitude && longitude) {
        tipData.coordinates = {
          lat: parseFloat(latitude),
          lng: parseFloat(longitude),
        }
      }

      // Ajouter le site web dans contact_social
      if (website) {
        tipData.contact_social = {
          website,
        }
      }

      const { data: tip, error: tipError } = await supabase
        .from('tips')
        .insert(tipData)
        .select()
        .single()

      if (tipError) throw tipError

      // 2. Gérer les images (fichiers ou URLs)
      if (tip) {
        // Mode fichiers uploadés
        if (imageInputMode === 'file' && imageFiles.length > 0) {
          for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i]
            const fileExt = file.name.split('.').pop()
            const fileName = `${tip.id}-${Date.now()}-${i}.${fileExt}`
            const filePath = `tips/${fileName}`

            // Upload l'image
            const { error: uploadError } = await supabase.storage
              .from('media')
              .upload(filePath, file)

            if (uploadError) {
              console.error('Upload error:', uploadError)
              continue
            }

            // Récupérer l'URL publique
            const { data: publicUrlData } = supabase.storage
              .from('media')
              .getPublicUrl(filePath)

            // Créer l'entrée dans tip_media
            await supabase.from('tip_media').insert({
              tip_id: tip.id,
              url: publicUrlData.publicUrl,
              type: 'image',
              order: i,
            })
          }
        }

        // Mode URLs directes
        if (imageInputMode === 'url' && imageUrls.trim()) {
          const urls = imageUrls.split('\n').map(url => url.trim()).filter(url => url)
          for (let i = 0; i < urls.length; i++) {
            await supabase.from('tip_media').insert({
              tip_id: tip.id,
              url: urls[i],
              type: 'image',
              order: i,
            })
          }
        }
      }

      // 3. Réinitialiser le formulaire et fermer
      resetForm()
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error creating tip:', err)
      setError(err.message || 'Erreur lors de la création du conseil')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setCategoryId('')
    setComment('')
    setLocation('')
    setLatitude('')
    setLongitude('')
    setContactPhone('')
    setContactEmail('')
    setRouteUrl('')
    setPromoCode('')
    setWebsite('')
    setImageFiles([])
    setImagePreviews([])
    setImageUrls('')
    setImageInputMode('file')
  }

  const handleClose = () => {
    if (!loading) {
      resetForm()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Ajouter un conseil</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-full transition disabled:cursor-not-allowed"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titre */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="Le Petit Gourmet"
            />
          </div>

          {/* Catégorie */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2">
              Catégorie
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Sans catégorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Commentaire */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={loading}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="Restaurant gastronomique local avec des spécialités régionales..."
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Photos
            </label>

            {/* Tabs pour choisir le mode */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setImageInputMode('file')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  imageInputMode === 'file'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📁 Uploader des fichiers
              </button>
              <button
                type="button"
                onClick={() => setImageInputMode('url')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  imageInputMode === 'url'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔗 Ajouter des liens
              </button>
            </div>

            {/* Mode fichier */}
            {imageInputMode === 'file' && (
              <>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition">
                  <input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    disabled={loading}
                    className="hidden"
                  />
                  <label htmlFor="images" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Cliquez pour ajouter des photos
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      PNG, JPG jusqu'à 10MB
                    </p>
                  </label>
                </div>
                {imagePreviews.length > 0 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto">
                    {imagePreviews.map((preview, index) => (
                      <img
                        key={index}
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Mode URL */}
            {imageInputMode === 'url' && (
              <div>
                <textarea
                  value={imageUrls}
                  onChange={(e) => setImageUrls(e.target.value)}
                  disabled={loading}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 font-mono text-sm"
                  placeholder="https://exemple.com/image1.jpg&#10;https://exemple.com/image2.jpg&#10;https://exemple.com/image3.jpg&#10;&#10;Une URL par ligne"
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Entrez une URL d'image par ligne (Unsplash, Imgur, etc.)
                </p>
              </div>
            )}
          </div>

          {/* Localisation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="location" className="block text-sm font-medium mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Adresse
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Rue de la Station 15, 6980 La Roche-en-Ardenne"
              />
            </div>
            <div>
              <label htmlFor="latitude" className="block text-sm font-medium mb-2">
                Latitude
              </label>
              <input
                id="latitude"
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="50.1831"
              />
            </div>
            <div>
              <label htmlFor="longitude" className="block text-sm font-medium mb-2">
                Longitude
              </label>
              <input
                id="longitude"
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="5.5769"
              />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium mb-2">
                Téléphone
              </label>
              <input
                id="contactPhone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="+32 84 41 15 25"
              />
            </div>
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="contactEmail"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="contact@exemple.com"
              />
            </div>
          </div>

          {/* Liens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="website" className="block text-sm font-medium mb-2">
                Site web
              </label>
              <input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="https://exemple.com"
              />
            </div>
            <div>
              <label htmlFor="routeUrl" className="block text-sm font-medium mb-2">
                Lien Google Maps
              </label>
              <input
                id="routeUrl"
                type="url"
                value={routeUrl}
                onChange={(e) => setRouteUrl(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="https://maps.google.com/..."
              />
            </div>
          </div>

          {/* Code promo */}
          <div>
            <label htmlFor="promoCode" className="block text-sm font-medium mb-2">
              Code promo
            </label>
            <input
              id="promoCode"
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="WELCOME2024"
            />
          </div>

          {/* Erreur */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !title}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center gap-2 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Créer le conseil
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
