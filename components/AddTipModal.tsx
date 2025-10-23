'use client'

import { useState } from 'react'
import { X, Plus, Loader2, Upload, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CategoryInsert, TipInsert, TipMediaInsert } from '@/types'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import PlaceAutocomplete from './PlaceAutocomplete'

// Import dynamique pour éviter les erreurs SSR avec Leaflet
const MapPicker = dynamic(() => import('./MapPicker'), { ssr: false })

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [autoFilledData, setAutoFilledData] = useState<{
    fields: string[]
    categoryName: string | null
    needsCategoryCheck: boolean
  } | null>(null)
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [mediaPreviews, setMediaPreviews] = useState<Array<{ url: string; type: 'image' | 'video' }>>([])
  const [mediaUrls, setMediaUrls] = useState<string>('')
  const [mediaInputMode, setMediaInputMode] = useState<'file' | 'url'>('file')

  // Données du formulaire
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [comment, setComment] = useState('')
  const [location, setLocation] = useState('')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [routeUrl, setRouteUrl] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [website, setWebsite] = useState('')

  // Nouveaux champs : notes et avis
  const [rating, setRating] = useState<number | null>(null)
  const [userRatingsTotal, setUserRatingsTotal] = useState<number>(0)
  const [priceLevel, setPriceLevel] = useState<number | null>(null)
  const [reviews, setReviews] = useState<Array<any>>([])

  // Horaires d'ouverture
  const [showOpeningHours, setShowOpeningHours] = useState(false)
  const [openingHours, setOpeningHours] = useState({
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    sunday: '',
  })

  // Nouvelle catégorie
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryIcon, setNewCategoryIcon] = useState('📍')

  const supabase = createClient()

  if (!isOpen) return null

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setMediaFiles(files)

    // Créer des previews avec détection du type
    const previews = files.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' as const : 'image' as const
    }))
    setMediaPreviews(previews)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      let finalCategoryId = categoryId

      // 0. Si nouvelle catégorie, la créer d'abord
      if (showNewCategory && newCategoryName.trim()) {
        const categoryData: CategoryInsert = {
          name: newCategoryName.trim(),
          slug: newCategoryName.trim().toLowerCase().replace(/\s+/g, '-'),
          icon: newCategoryIcon,
        }
        const { data: newCategory, error: categoryError } = await (supabase
          .from('categories') as any)
          .insert([categoryData])
          .select()
          .single()

        if (categoryError) throw categoryError
        if (newCategory) {
          finalCategoryId = newCategory.id
        }
      }

      // 1. Créer le conseil
      const tipData: TipInsert = {
        client_id: clientId,
        title,
        comment: comment || null,
        location: location || null,
        contact_phone: contactPhone || null,
        contact_email: contactEmail || null,
        route_url: routeUrl || null,
        promo_code: promoCode || null,
        category_id: finalCategoryId || null,
      }

      // Ajouter les coordonnées si fournies
      if (latitude !== null && longitude !== null) {
        tipData.coordinates = {
          lat: latitude,
          lng: longitude,
        }
      }

      // Ajouter le site web dans contact_social
      if (website) {
        tipData.contact_social = {
          website,
        }
      }

      // Ajouter les horaires d'ouverture si au moins un jour est rempli
      const hasOpeningHours = Object.values(openingHours).some(h => h.trim())
      if (hasOpeningHours) {
        tipData.opening_hours = openingHours
      }

      // Ajouter les notes et avis Google si disponibles
      if (rating !== null) {
        tipData.rating = rating
      }
      if (userRatingsTotal > 0) {
        tipData.user_ratings_total = userRatingsTotal
      }
      if (priceLevel !== null) {
        tipData.price_level = priceLevel
      }
      if (reviews.length > 0) {
        tipData.reviews = reviews
      }

      const { data: tip, error: tipError } = await (supabase
        .from('tips') as any)
        .insert([tipData])
        .select()
        .single()

      if (tipError) throw tipError

      // 2. Gérer les médias (fichiers ou URLs)
      if (tip) {
        // Mode fichiers uploadés
        if (mediaInputMode === 'file' && mediaFiles.length > 0) {
          for (let i = 0; i < mediaFiles.length; i++) {
            const file = mediaFiles[i]
            const fileExt = file.name.split('.').pop()
            const fileName = `${tip.id}-${Date.now()}-${i}.${fileExt}`
            const filePath = `tips/${fileName}`

            // Upload le fichier (image ou vidéo)
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

            // Détecter le type de média
            const mediaType = file.type.startsWith('video/') ? 'video' : 'image'

            // Créer l'entrée dans tip_media
            const mediaData: TipMediaInsert = {
              tip_id: tip.id,
              url: publicUrlData.publicUrl,
              type: mediaType,
              order: i,
            }
            await (supabase.from('tip_media') as any).insert([mediaData])
          }
        }

        // Mode URLs directes
        if (mediaInputMode === 'url' && mediaUrls.trim()) {
          const urls = mediaUrls.split('\n').map(url => url.trim()).filter(url => url)
          for (let i = 0; i < urls.length; i++) {
            // Détecter si c'est une vidéo ou une image basé sur l'extension
            const url = urls[i]
            const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(url)

            const mediaData: TipMediaInsert = {
              tip_id: tip.id,
              url: url,
              type: isVideo ? 'video' : 'image',
              order: i,
            }
            await (supabase.from('tip_media') as any).insert([mediaData])
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
    setLatitude(null)
    setLongitude(null)
    setContactPhone('')
    setContactEmail('')
    setRouteUrl('')
    setPromoCode('')
    setWebsite('')
    setRating(null)
    setUserRatingsTotal(0)
    setPriceLevel(null)
    setReviews([])
    setMediaFiles([])
    setMediaPreviews([])
    setMediaUrls('')
    setMediaInputMode('file')
    setShowNewCategory(false)
    setNewCategoryName('')
    setNewCategoryIcon('📍')
    setShowOpeningHours(false)
    setOpeningHours({
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: '',
    })
    setError(null)
    setSuccessMessage(null)
    setAutoFilledData(null)
  }

  const handleLocationSelect = (lat: number, lng: number) => {
    if (lat === 0 && lng === 0) {
      // Réinitialisation
      setLatitude(null)
      setLongitude(null)
    } else {
      setLatitude(lat)
      setLongitude(lng)
    }
  }

  const handlePlaceSelected = (place: {
    name: string
    address: string
    coordinates: { lat: number; lng: number } | null
    phone: string
    website: string
    opening_hours: Record<string, string>
    photos: Array<{ url: string; reference: string }>
    google_maps_url: string
    suggested_category: string | null
    rating: number | null
    user_ratings_total: number
    price_level: number | null
    reviews: Array<any>
  }) => {
    // Réinitialiser les messages
    setError(null)
    setSuccessMessage(null)

    // Traquer les champs remplis pour le message de succès
    const filledFields: string[] = []

    // Remplir automatiquement les champs du formulaire
    setTitle(place.name)
    filledFields.push('Titre')

    setLocation(place.address)
    filledFields.push('Adresse')

    // Générer une description automatique basée sur les infos disponibles
    const descriptionParts: string[] = []
    if (place.address) {
      const city = place.address.split(',').slice(-2)[0]?.trim()
      if (city) {
        descriptionParts.push(`Situé à ${city}`)
      }
    }
    if (place.phone) {
      descriptionParts.push('Réservation recommandée')
    }
    const hasOpeningHours = Object.values(place.opening_hours).some(h => h)
    if (hasOpeningHours) {
      descriptionParts.push('Consultez les horaires ci-dessous')
    }
    if (descriptionParts.length > 0) {
      setComment(descriptionParts.join('. ') + '.')
      filledFields.push('Description')
    }

    if (place.coordinates) {
      setLatitude(place.coordinates.lat)
      setLongitude(place.coordinates.lng)
      filledFields.push('Coordonnées GPS')
    }

    if (place.phone) {
      setContactPhone(place.phone)
      filledFields.push('Téléphone')
    }

    if (place.website) {
      setWebsite(place.website)
      filledFields.push('Site web')
    }

    if (place.google_maps_url) {
      setRouteUrl(place.google_maps_url)
      filledFields.push('Lien Google Maps')
    }

    // Remplir les horaires si disponibles
    const hasHours = Object.values(place.opening_hours).some(h => h)
    if (hasHours) {
      setOpeningHours({
        monday: place.opening_hours.monday || '',
        tuesday: place.opening_hours.tuesday || '',
        wednesday: place.opening_hours.wednesday || '',
        thursday: place.opening_hours.thursday || '',
        friday: place.opening_hours.friday || '',
        saturday: place.opening_hours.saturday || '',
        sunday: place.opening_hours.sunday || '',
      })
      setShowOpeningHours(true)
      filledFields.push('Horaires d\'ouverture')
    }

    // Remplir uniquement la première photo
    if (place.photos.length > 0) {
      setMediaUrls(place.photos[0].url)
      setMediaInputMode('url')
      filledFields.push('Photo')
    }

    // Remplir les notes et avis Google
    if (place.rating !== null) {
      setRating(place.rating)
      filledFields.push('Note Google')
    }

    if (place.user_ratings_total > 0) {
      setUserRatingsTotal(place.user_ratings_total)
      filledFields.push(`${place.user_ratings_total} avis`)
    }

    if (place.price_level !== null) {
      setPriceLevel(place.price_level)
      filledFields.push('Niveau de prix')
    }

    if (place.reviews && place.reviews.length > 0) {
      setReviews(place.reviews)
      filledFields.push(`${place.reviews.length} avis détaillés`)
    }

    // Suggérer la catégorie (comparaison flexible avec slug et nom)
    let suggestedCategoryName: string | null = null
    let categoryMatched = false

    if (place.suggested_category) {
      // Créer un slug normalisé pour la comparaison
      const normalizeSlug = (str: string): string =>
        str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-')

      const matchingCategory = categories.find(cat => {
        // Comparaison flexible : slug exact ou nom similaire
        const catSlug = normalizeSlug(cat.name)
        const suggestedSlug = normalizeSlug(place.suggested_category || '')

        return catSlug === suggestedSlug || catSlug.includes(suggestedSlug) || suggestedSlug.includes(catSlug)
      })

      if (matchingCategory) {
        setCategoryId(matchingCategory.id)
        suggestedCategoryName = matchingCategory.name
        categoryMatched = true
        filledFields.push('Catégorie suggérée')
      }
    }

    // Afficher le message de succès avec détails
    setAutoFilledData({
      fields: filledFields,
      categoryName: suggestedCategoryName,
      needsCategoryCheck: !categoryMatched || place.suggested_category === null
    })

    setSuccessMessage(`✅ Informations récupérées avec succès ! ${filledFields.length} champs remplis automatiquement.`)
  }

  const handleClose = () => {
    if (!loading) {
      resetForm()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Ajouter un conseil</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-full transition disabled:cursor-not-allowed"
          >
            <X className="w-6 h-6 text-gray-900" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Remplissage intelligent */}
          <PlaceAutocomplete onPlaceSelected={handlePlaceSelected} disabled={loading} />

          {/* Message de succès avec détails */}
          {successMessage && autoFilledData && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-2xl">✅</span>
                <div className="flex-1">
                  <p className="font-semibold text-green-900">{successMessage}</p>
                  <div className="mt-2 text-sm text-green-800">
                    <p className="font-medium mb-1">Champs remplis :</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {autoFilledData.fields.map((field, index) => (
                        <li key={index}>{field}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Avertissement catégorie si nécessaire */}
              {autoFilledData.needsCategoryCheck ? (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">⚠️</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-yellow-900">
                        Vérifiez la catégorie
                      </p>
                      <p className="text-xs text-yellow-800 mt-1">
                        {autoFilledData.categoryName
                          ? `La catégorie "${autoFilledData.categoryName}" a été suggérée automatiquement. Vérifiez qu'elle correspond bien à votre conseil.`
                          : "Aucune catégorie n'a pu être suggérée automatiquement. Veuillez en sélectionner une manuellement ci-dessous pour mieux organiser vos conseils."}
                      </p>
                      {!autoFilledData.categoryName && (
                        <button
                          type="button"
                          onClick={() => {
                            // Scroll vers le sélecteur de catégorie
                            document.getElementById('category')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                            document.getElementById('category')?.focus()
                          }}
                          className="mt-2 text-xs text-yellow-900 underline hover:text-yellow-700 font-medium"
                        >
                          → Aller au sélecteur de catégorie
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : autoFilledData.categoryName ? (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">✅</span>
                    <div className="flex-1">
                      <p className="text-sm text-blue-900">
                        Catégorie <span className="font-semibold">"{autoFilledData.categoryName}"</span> suggérée automatiquement.
                        {categoryId && (
                          <button
                            type="button"
                            onClick={() => {
                              document.getElementById('category')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                              document.getElementById('category')?.focus()
                            }}
                            className="ml-2 text-xs text-blue-700 underline hover:text-blue-900"
                          >
                            Modifier
                          </button>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Titre */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2 text-gray-900">
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
            <label htmlFor="category" className="block text-sm font-medium mb-2 text-gray-900">
              Catégorie
            </label>

            {!showNewCategory ? (
              <>
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
                <button
                  type="button"
                  onClick={() => setShowNewCategory(true)}
                  disabled={loading}
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Créer une nouvelle catégorie
                </button>
              </>
            ) : (
              <div className="space-y-3 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-indigo-900">Nouvelle catégorie</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewCategory(false)
                      setNewCategoryName('')
                      setNewCategoryIcon('📍')
                    }}
                    disabled={loading}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Annuler
                  </button>
                </div>
                <div>
                  <label htmlFor="newCategoryName" className="block text-xs font-medium mb-1 text-indigo-900">
                    Nom de la catégorie
                  </label>
                  <input
                    id="newCategoryName"
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="Ex: Restaurants, Activités..."
                  />
                </div>
                <div>
                  <label htmlFor="newCategoryIcon" className="block text-xs font-medium mb-1 text-indigo-900">
                    Emoji
                  </label>
                  <input
                    id="newCategoryIcon"
                    type="text"
                    value={newCategoryIcon}
                    onChange={(e) => setNewCategoryIcon(e.target.value)}
                    disabled={loading}
                    maxLength={2}
                    className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 text-2xl"
                    placeholder="🍴"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['🍴', '🏨', '🎭', '🏖️', '🚶', '🚴', '🏊', '⛷️', '🎿', '🛒', '🏥', '🚗', '🚌', '📍', '⭐', '🎉', '🎨', '🎵', '☕', '🍺', '🏔️', '🌲', '🎣', '⛪', '🏛️', '📸', '🌅', '👁️', '🗻', '⛰️', '🏞️', '🌄', '🌉', '🗼', '🏰', '🎪', '🎢', '🎡', '🎠', '🛝', '🧗', '🪂', '🚡', '🚠', '🛶', '⛵', '🚤'].map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewCategoryIcon(emoji)}
                        disabled={loading}
                        className="text-2xl hover:scale-125 transition-transform p-1 hover:bg-indigo-100 rounded"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Commentaire */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium mb-2 text-gray-900">
              Description
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={loading}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          {/* Photos et Vidéos */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900">
              Photos & Vidéos
            </label>

            {/* Tabs pour choisir le mode */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setMediaInputMode('file')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  mediaInputMode === 'file'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📁 Uploader des fichiers
              </button>
              <button
                type="button"
                onClick={() => setMediaInputMode('url')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  mediaInputMode === 'url'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔗 Ajouter des liens
              </button>
            </div>

            {/* Mode fichier */}
            {mediaInputMode === 'file' && (
              <>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition">
                  <input
                    id="media"
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleMediaChange}
                    disabled={loading}
                    className="hidden"
                  />
                  <label htmlFor="media" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-700">
                      Cliquez pour ajouter des photos ou vidéos
                    </p>
                  </label>
                </div>
                {mediaPreviews.length > 0 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto">
                    {mediaPreviews.map((preview, index) => (
                      <div key={index} className="relative w-24 h-24 flex-shrink-0">
                        {preview.type === 'image' ? (
                          <img
                            src={preview.url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="relative w-full h-full">
                            <video
                              src={preview.url}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-lg">
                              <span className="text-white text-2xl">▶️</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Mode URL */}
            {mediaInputMode === 'url' && (
              <div className="space-y-3">
                {/* Aperçu de l'image si URL présente */}
                {mediaUrls && (
                  <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
                    <Image
                      src={mediaUrls.split('\n')[0]}
                      alt="Aperçu"
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                      Photo Google Places
                    </div>
                  </div>
                )}
                {/* N'afficher le champ URL que si ce n'est pas une photo Google */}
                {!mediaUrls.includes('photo_reference') && (
                  <textarea
                    value={mediaUrls}
                    onChange={(e) => setMediaUrls(e.target.value)}
                    disabled={loading}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 font-mono text-xs"
                    placeholder="Une URL par ligne"
                  />
                )}
              </div>
            )}
          </div>

          {/* Localisation */}
          <div className="space-y-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-2 text-gray-900">
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
              <label className="block text-sm font-medium mb-2 text-gray-900">
                Position sur la carte
              </label>
              <MapPicker
                initialLat={latitude || undefined}
                initialLng={longitude || undefined}
                onLocationSelect={handleLocationSelect}
              />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium mb-2 text-gray-900">
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
              <label htmlFor="contactEmail" className="block text-sm font-medium mb-2 text-gray-900">
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
              <label htmlFor="website" className="block text-sm font-medium mb-2 text-gray-900">
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
              <label htmlFor="routeUrl" className="block text-sm font-medium mb-2 text-gray-900">
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
            <label htmlFor="promoCode" className="block text-sm font-medium mb-2 text-gray-900">
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

          {/* Horaires d'ouverture */}
          <div>
            {!showOpeningHours ? (
              <button
                type="button"
                onClick={() => setShowOpeningHours(true)}
                disabled={loading}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Ajouter les horaires d'ouverture
              </button>
            ) : (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-900">Horaires d'ouverture</label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowOpeningHours(false)
                      setOpeningHours({
                        monday: '',
                        tuesday: '',
                        wednesday: '',
                        thursday: '',
                        friday: '',
                        saturday: '',
                        sunday: '',
                      })
                    }}
                    disabled={loading}
                    className="text-sm text-gray-600 hover:text-gray-700"
                  >
                    Annuler
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { key: 'monday', label: 'Lundi' },
                    { key: 'tuesday', label: 'Mardi' },
                    { key: 'wednesday', label: 'Mercredi' },
                    { key: 'thursday', label: 'Jeudi' },
                    { key: 'friday', label: 'Vendredi' },
                    { key: 'saturday', label: 'Samedi' },
                    { key: 'sunday', label: 'Dimanche' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label htmlFor={`hour-${key}`} className="block text-xs font-medium mb-1 text-gray-700">
                        {label}
                      </label>
                      <input
                        id={`hour-${key}`}
                        type="text"
                        value={openingHours[key as keyof typeof openingHours]}
                        onChange={(e) =>
                          setOpeningHours((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        disabled={loading}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                        placeholder="9h-18h"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-900 hover:bg-gray-50 transition disabled:cursor-not-allowed disabled:opacity-50"
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
