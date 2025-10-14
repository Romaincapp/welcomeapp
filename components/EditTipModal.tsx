'use client'

import { useState, useEffect } from 'react'
import { X, Save, Loader2, Upload, MapPin, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { TipWithDetails } from '@/types'

interface EditTipModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  tip: TipWithDetails | null
  categories: Array<{ id: string; name: string; icon?: string | null }>
}

export default function EditTipModal({ isOpen, onClose, onSuccess, tip, categories }: EditTipModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [imageUrls, setImageUrls] = useState<string>('')
  const [imageInputMode, setImageInputMode] = useState<'file' | 'url'>('file')
  const [existingImages, setExistingImages] = useState<Array<{ id: string; url: string }>>([])

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

  // Pré-remplir le formulaire avec les données du tip
  useEffect(() => {
    if (tip) {
      setTitle(tip.title || '')
      setCategoryId(tip.category_id || '')
      setComment(tip.comment || '')
      setLocation(tip.location || '')
      setLatitude(tip.coordinates_parsed?.lat?.toString() || '')
      setLongitude(tip.coordinates_parsed?.lng?.toString() || '')
      setContactPhone(tip.contact_phone || '')
      setContactEmail(tip.contact_email || '')
      setRouteUrl(tip.route_url || '')
      setPromoCode(tip.promo_code || '')
      setWebsite(tip.contact_social_parsed?.website || '')
      setExistingImages(tip.media.map(m => ({ id: m.id, url: m.url })))
    }
  }, [tip])

  if (!isOpen || !tip) return null

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setImageFiles(files)

    // Créer des previews
    const previews = files.map(file => URL.createObjectURL(file))
    setImagePreviews(previews)
  }

  const handleRemoveExistingImage = async (imageId: string, imageUrl: string) => {
    if (!confirm('Supprimer cette image ?')) return

    try {
      // Supprimer de la base de données
      const { error: deleteError } = await supabase
        .from('tip_media')
        .delete()
        .eq('id', imageId)

      if (deleteError) throw deleteError

      // Supprimer du Storage (optionnel mais recommandé)
      const filePath = imageUrl.split('/storage/v1/object/public/media/')[1]
      if (filePath) {
        await supabase.storage.from('media').remove([filePath])
      }

      // Retirer de l'état local
      setExistingImages(prev => prev.filter(img => img.id !== imageId))
    } catch (err: any) {
      console.error('Error deleting image:', err)
      alert('Erreur lors de la suppression de l\'image')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // 1. Mettre à jour le conseil
      const tipData: any = {
        title,
        comment: comment || null,
        location: location || null,
        contact_phone: contactPhone || null,
        contact_email: contactEmail || null,
        route_url: routeUrl || null,
        promo_code: promoCode || null,
        category_id: categoryId || null,
        updated_at: new Date().toISOString(),
      }

      // Ajouter les coordonnées si fournies
      if (latitude && longitude) {
        tipData.coordinates = {
          lat: parseFloat(latitude),
          lng: parseFloat(longitude),
        }
      } else {
        tipData.coordinates = null
      }

      // Ajouter le site web dans contact_social
      if (website) {
        tipData.contact_social = {
          website,
        }
      } else {
        tipData.contact_social = null
      }

      const { error: tipError } = await supabase
        .from('tips')
        .update(tipData)
        .eq('id', tip.id)

      if (tipError) throw tipError

      // 2. Ajouter de nouvelles images (fichiers ou URLs)
      const currentMaxOrder = existingImages.length

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
            order: currentMaxOrder + i,
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
            order: currentMaxOrder + i,
          })
        }
      }

      // 3. Réinitialiser et fermer
      resetForm()
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error updating tip:', err)
      setError(err.message || 'Erreur lors de la mise à jour du conseil')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setImageFiles([])
    setImagePreviews([])
    setImageUrls('')
    setImageInputMode('file')
    setError(null)
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
          <h2 className="text-2xl font-bold">Éditer le conseil</h2>
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

          {/* Images existantes */}
          {existingImages.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Images actuelles
              </label>
              <div className="flex gap-2 overflow-x-auto">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.url}
                      alt="Existing"
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(img.id, img.url)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nouvelles images */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Ajouter des photos
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
                      Cliquez pour ajouter de nouvelles photos
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
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Sauvegarder
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
