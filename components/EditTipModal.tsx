'use client'

import { useState, useEffect } from 'react'
import { X, Save, Loader2, Upload, MapPin, Trash2, Plus, Sparkles, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { TipWithDetails, CategoryInsert, TipUpdate, TipMediaInsert } from '@/types'
import dynamic from 'next/dynamic'
import PlaceAutocomplete from './PlaceAutocomplete'
import { generateCommentFromReviews } from '@/lib/translate'
import { soundManager } from '@/lib/sounds'
import HikeUploader from './HikeUploader'
import HikeElevationProfile from './HikeElevationProfile'
import { HikeData } from '@/types'
import { generateAndUploadHikeThumbnail, deleteHikeThumbnail } from '@/lib/generate-hike-thumbnail'

// Import dynamique pour éviter les erreurs SSR avec Leaflet
const MapPicker = dynamic(() => import('./MapPicker'), { ssr: false })

interface EditTipModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (tip?: any) => void // Accepte le tip mis à jour en paramètre
  tip: TipWithDetails | null
  categories: Array<{ id: string; name: string; icon?: string | null }>
}

export default function EditTipModal({ isOpen, onClose, onSuccess, tip, categories }: EditTipModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [mediaPreviews, setMediaPreviews] = useState<Array<{ url: string; type: 'image' | 'video' }>>([])
  const [mediaUrls, setMediaUrls] = useState<string>('')
  const [mediaInputMode, setMediaInputMode] = useState<'file' | 'url'>('file')
  const [existingMedia, setExistingMedia] = useState<Array<{ id: string; url: string; type: string; order: number }>>([])
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

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
  const [hikeData, setHikeData] = useState<HikeData | null>(null)

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

  // Génération de commentaire IA
  const [isGeneratingComment, setIsGeneratingComment] = useState(false)

  const supabase = createClient()

  // Pré-remplir le formulaire avec les données du tip
  useEffect(() => {
    if (tip) {
      setTitle(tip.title || '')
      setCategoryId(tip.category_id || '')
      setComment(tip.comment || '')
      setLocation(tip.location || '')
      setLatitude(tip.coordinates_parsed?.lat ?? null)
      setLongitude(tip.coordinates_parsed?.lng ?? null)
      setContactPhone(tip.contact_phone || '')
      setContactEmail(tip.contact_email || '')
      setRouteUrl(tip.route_url || '')
      setPromoCode(tip.promo_code || '')
      setWebsite(tip.contact_social_parsed?.website || '')
      setExistingMedia(
        tip.media
          .map(m => ({ id: m.id, url: m.url, type: m.type, order: m.order ?? 0 }))
          .sort((a, b) => a.order - b.order)
      )

      // Charger les horaires d'ouverture si présents
      if (tip.opening_hours_parsed) {
        setOpeningHours({
          monday: tip.opening_hours_parsed.monday || '',
          tuesday: tip.opening_hours_parsed.tuesday || '',
          wednesday: tip.opening_hours_parsed.wednesday || '',
          thursday: tip.opening_hours_parsed.thursday || '',
          friday: tip.opening_hours_parsed.friday || '',
          saturday: tip.opening_hours_parsed.saturday || '',
          sunday: tip.opening_hours_parsed.sunday || '',
        })
        setShowOpeningHours(true)
      }

      // Charger les données de randonnée si présentes
      if (tip.hike_data) {
        setHikeData(tip.hike_data as any)
      }
    }
  }, [tip])

  if (!isOpen || !tip) return null

  const handleUseCurrentLocation = async () => {
    setIsLoadingLocation(true)
    setError(null)

    try {
      // 1. Obtenir la position GPS
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        })
      })

      const lat = position.coords.latitude
      const lng = position.coords.longitude

      console.log('[GEOLOCATION] Position obtenue:', { lat, lng })

      // 2. Reverse geocoding via notre API
      const response = await fetch(`/api/places/reverse-geocode?lat=${lat}&lng=${lng}`)
      if (!response.ok) {
        throw new Error('Erreur lors du reverse geocoding')
      }

      const data = await response.json()
      console.log('[GEOLOCATION] Adresse trouvée:', data.address)

      // 3. Remplir les champs
      setLatitude(lat)
      setLongitude(lng)
      setLocation(data.address)

    } catch (error: any) {
      console.error('[GEOLOCATION] Erreur:', error)

      let errorMessage = 'Erreur de géolocalisation'
      if (error.code === 1) {
        errorMessage = 'Permission de géolocalisation refusée. Veuillez autoriser l\'accès à votre position dans les paramètres de votre navigateur.'
      } else if (error.code === 2) {
        errorMessage = 'Position indisponible. Vérifiez que le GPS est activé sur votre appareil.'
      } else if (error.code === 3) {
        errorMessage = 'Délai dépassé lors de la récupération de votre position. Réessayez.'
      } else if (error.message) {
        errorMessage = error.message
      }

      setError(errorMessage)
    } finally {
      setIsLoadingLocation(false)
    }
  }

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

  const handleRemoveExistingMedia = async (mediaId: string, mediaUrl: string) => {
    if (!confirm('Supprimer ce média ?')) return

    try {
      // Récupérer le média complet pour avoir le thumbnail_url
      const { data: mediaData } = await (supabase
        .from('tip_media') as any)
        .select('url, thumbnail_url')
        .eq('id', mediaId)
        .single()

      // Supprimer du Storage (image originale + thumbnail)
      const filePaths: string[] = []

      // URL principale
      const mainPath = mediaUrl.split('/storage/v1/object/public/media/')[1]
      if (mainPath) filePaths.push(mainPath)

      // Thumbnail si il existe
      if (mediaData?.thumbnail_url) {
        const thumbPath = mediaData.thumbnail_url.split('/storage/v1/object/public/media/')[1]
        if (thumbPath) filePaths.push(thumbPath)
      }

      if (filePaths.length > 0) {
        console.log('[DELETE MEDIA] Suppression de', filePaths.length, 'fichier(s) du storage')
        await supabase.storage.from('media').remove(filePaths)
      }

      // Supprimer de la base de données
      const { error: deleteError } = await supabase
        .from('tip_media')
        .delete()
        .eq('id', mediaId)

      if (deleteError) throw deleteError

      // Retirer de l'état local
      setExistingMedia(prev => prev.filter(media => media.id !== mediaId))
    } catch (err: any) {
      console.error('Error deleting media:', err)
      alert('Erreur lors de la suppression du média')
    }
  }

  const handleSetAsPrimaryMedia = async (mediaId: string) => {
    try {
      // Trouver l'index du média sélectionné
      const selectedIndex = existingMedia.findIndex(m => m.id === mediaId)
      if (selectedIndex === -1 || selectedIndex === 0) return // Déjà en première position

      // Créer le nouvel ordre : le média sélectionné devient premier, les autres suivent
      const newOrder = [
        existingMedia[selectedIndex],
        ...existingMedia.filter((_, i) => i !== selectedIndex)
      ]

      // Mettre à jour les orders en DB
      for (let i = 0; i < newOrder.length; i++) {
        await (supabase
          .from('tip_media') as any)
          .update({ order: i })
          .eq('id', newOrder[i].id)
      }

      // Mettre à jour l'état local avec les nouveaux orders
      setExistingMedia(newOrder.map((m, i) => ({ ...m, order: i })))

      console.log('[EDIT TIP] ⭐ Image principale définie:', mediaId)
    } catch (err: any) {
      console.error('Error setting primary media:', err)
      alert('Erreur lors du changement d\'image principale')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      let finalCategoryId = categoryId

      // 0. Si nouvelle catégorie, la créer d'abord (sans traductions - traduction côté client)
      if (showNewCategory && newCategoryName.trim()) {
        const categoryData: CategoryInsert = {
          name: newCategoryName.trim(),
          slug: newCategoryName.trim().toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
            .replace(/[^a-z0-9]+/g, '-') // Remplacer espaces et caractères spéciaux par -
            .replace(/^-+|-+$/g, ''), // Enlever les - au début/fin
        }
        const { data: newCategory, error: categoryError } = await (supabase
          .from('categories') as any)
          .insert([categoryData])
          .select()
          .single()

        if (categoryError) throw categoryError
        if (newCategory) {
          finalCategoryId = newCategory.id
          console.log('[EDIT TIP] Catégorie créée:', finalCategoryId)
        }
      }

      // 1. Mettre à jour le conseil
      const tipData: TipUpdate = {
        title,
        comment: comment || null,
        location: location || null,
        contact_phone: contactPhone || null,
        contact_email: contactEmail || null,
        route_url: routeUrl || null,
        promo_code: promoCode || null,
        category_id: finalCategoryId || null,
        updated_at: new Date().toISOString(),
      }

      // Ajouter les coordonnées si fournies
      if (latitude !== null && longitude !== null) {
        tipData.coordinates = {
          lat: latitude,
          lng: longitude,
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

      // Ajouter les horaires d'ouverture si au moins un jour est rempli
      const hasOpeningHours = Object.values(openingHours).some(h => h.trim())
      if (hasOpeningHours) {
        tipData.opening_hours = openingHours
      } else {
        tipData.opening_hours = null
      }

      // Ajouter les données de randonnée si disponibles
      if (hikeData) {
        tipData.hike_data = hikeData as any
      } else {
        tipData.hike_data = null
      }

      const { error: tipError } = await (supabase
        .from('tips') as any)
        .update(tipData)
        .eq('id', tip.id)

      if (tipError) throw tipError

      // 1.5. Gérer la miniature de carte pour les randonnées
      const oldHikeThumbnailUrl = (tip as any).hike_thumbnail_url
      if (hikeData && hikeData.waypoints && hikeData.waypoints.length > 0) {
        // Supprimer l'ancienne miniature si elle existe
        if (oldHikeThumbnailUrl) {
          await deleteHikeThumbnail(oldHikeThumbnailUrl)
        }

        // Générer la nouvelle miniature
        console.log('[EditTipModal] Génération de la miniature de carte...')
        const thumbnailResult = await generateAndUploadHikeThumbnail(hikeData.waypoints, tip.id)

        if (thumbnailResult.success && thumbnailResult.url) {
          // Mettre à jour le tip avec l'URL de la miniature
          const { error: updateError } = await (supabase
            .from('tips') as any)
            .update({ hike_thumbnail_url: thumbnailResult.url })
            .eq('id', tip.id)

          if (updateError) {
            console.error('[EditTipModal] Erreur lors de la mise à jour de hike_thumbnail_url:', updateError)
          } else {
            console.log('[EditTipModal] Miniature de carte générée avec succès:', thumbnailResult.url)
          }
        }
      } else if (!hikeData && oldHikeThumbnailUrl) {
        // Si on a supprimé les données de randonnée, supprimer aussi la miniature
        await deleteHikeThumbnail(oldHikeThumbnailUrl)
        await (supabase
          .from('tips') as any)
          .update({ hike_thumbnail_url: null })
          .eq('id', tip.id)
      }

      // 2. Ajouter de nouveaux médias (fichiers ou URLs)
      const currentMaxOrder = existingMedia.length

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
            order: currentMaxOrder + i,
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
            order: currentMaxOrder + i,
          }
          await (supabase.from('tip_media') as any).insert([mediaData])
        }
      }

      // 3. Récupérer le tip mis à jour avec relations pour optimistic update
      const { data: updatedTip } = await (supabase
        .from('tips') as any)
        .select(`
          *,
          category:categories(*),
          media:tip_media(*)
        `)
        .eq('id', tip.id)
        .single()

      // 4. Animation flip 3D de la card
      console.log('[EDIT TIP] 🔄 Animation flip 3D...')
      soundManager.play('flip')

      const cardElement = document.querySelector(`[data-tip-id="${tip.id}"]`)
      if (cardElement) {
        cardElement.classList.add('animate-flip-3d')

        // Retirer la classe après l'animation
        setTimeout(() => {
          cardElement.classList.remove('animate-flip-3d')
        }, 800)
      }

      // 5. Réinitialiser et fermer avec le tip mis à jour
      resetForm()
      onSuccess(updatedTip) // Passer le tip mis à jour
      onClose()
    } catch (err: any) {
      console.error('Error updating tip:', err)
      setError(err.message || 'Erreur lors de la mise à jour du conseil')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setMediaFiles([])
    setMediaPreviews([])
    setMediaUrls('')
    setMediaInputMode('file')
    setError(null)
    setShowNewCategory(false)
    setNewCategoryName('')
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
    setHikeData(null)
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

  const handlePlaceSelected = async (place: {
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
    // Remplir automatiquement les champs du formulaire
    setTitle(place.name)
    setLocation(place.address)

    // Générer un commentaire inspiré des avis Google (si disponibles)
    if (place.reviews && place.reviews.length > 0) {
      console.log('[EDIT TIP] Génération du commentaire depuis les avis...')
      const generatedComment = await generateCommentFromReviews(
        place.reviews,
        place.name,
        place.rating,
        place.user_ratings_total
      )
      if (generatedComment) {
        setComment(generatedComment)
        console.log('[EDIT TIP] Commentaire généré:', generatedComment)
      }
    } else {
      // Fallback : Générer une description basique si pas d'avis
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
      }
    }
    if (place.coordinates) {
      setLatitude(place.coordinates.lat)
      setLongitude(place.coordinates.lng)
    }
    setContactPhone(place.phone)
    setWebsite(place.website)
    setRouteUrl(place.google_maps_url)

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
    }

    // Remplir uniquement la première photo (avec upload permanent si Google)
    if (place.photos.length > 0) {
      const photoUrl = place.photos[0].url
      setMediaInputMode('url')

      // Si c'est une photo Google, l'uploader vers Supabase Storage
      if (photoUrl.includes('photo_reference') || photoUrl.includes('/api/places/photo')) {
        setIsUploadingImage(true)
        setMediaUrls(photoUrl) // Afficher temporairement pour preview

        // Upload async en arrière-plan
        try {
          const fullUrl = photoUrl.startsWith('/')
            ? `${window.location.origin}${photoUrl}`
            : photoUrl

          const uploadResponse = await fetch('/api/upload-google-photo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              googlePhotoUrl: fullUrl,
              tipId: tip?.id || `temp-${Date.now()}`
            })
          })

          if (uploadResponse.ok) {
            const data = await uploadResponse.json()
            setMediaUrls(data.url) // URL permanente Supabase
            console.log(`[EDIT TIP] ✅ Image optimisée: économie ${data.savings}%`)
          } else {
            console.error('[EDIT TIP] Erreur upload image, fallback vers proxy URL')
          }
        } catch (error) {
          console.error('[EDIT TIP] Erreur upload:', error)
        } finally {
          setIsUploadingImage(false)
        }
      } else {
        setMediaUrls(photoUrl)
      }
    }

    // Suggérer la catégorie (comparaison flexible avec slug et nom)
    if (place.suggested_category) {
      const normalizeSlug = (str: string): string =>
        str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-')

      const matchingCategory = categories.find(cat => {
        const catSlug = normalizeSlug(cat.name)
        const suggestedSlug = normalizeSlug(place.suggested_category || '')
        return catSlug === suggestedSlug || catSlug.includes(suggestedSlug) || suggestedSlug.includes(catSlug)
      })

      if (matchingCategory) {
        setCategoryId(matchingCategory.id)
      }
    }
  }

  const handleGenerateCommentFromExistingReviews = async () => {
    if (!tip || !tip.reviews) {
      alert('Ce conseil n\'a pas d\'avis Google disponibles')
      return
    }

    // Type guard pour vérifier que reviews est bien un array
    const reviews = tip.reviews as any[]
    if (!Array.isArray(reviews) || reviews.length === 0) {
      alert('Ce conseil n\'a pas d\'avis Google disponibles')
      return
    }

    setIsGeneratingComment(true)
    try {
      console.log('[EDIT TIP] Génération du commentaire depuis les avis existants...')
      const generatedComment = await generateCommentFromReviews(
        reviews,
        tip.title,
        tip.rating,
        tip.user_ratings_total || 0
      )
      if (generatedComment) {
        setComment(generatedComment)
        console.log('[EDIT TIP] Commentaire généré:', generatedComment)
      } else {
        alert('Impossible de générer un commentaire')
      }
    } catch (error) {
      console.error('[EDIT TIP] Erreur génération:', error)
      alert('Erreur lors de la génération du commentaire')
    } finally {
      setIsGeneratingComment(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      resetForm()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl my-8 force-light-theme">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Éditer le conseil</h2>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 text-gray-900"
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
                    }}
                    disabled={loading}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Annuler
                  </button>
                </div>
                <div>
                  <label htmlFor="newCategoryName" className="block text-xs font-medium mb-1 text-indigo-900">
                    Nom de la catégorie (vous pouvez ajouter un emoji)
                  </label>
                  <input
                    id="newCategoryName"
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="Ex: 🍴 Restaurants, 🎯 Activités..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Commentaire */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-900">
                Description
              </label>
              {/* Bouton génération IA si le tip a des reviews mais pas de commentaire */}
              {tip && tip.reviews && Array.isArray(tip.reviews) && (tip.reviews as any[]).length > 0 && (
                <button
                  type="button"
                  onClick={handleGenerateCommentFromExistingReviews}
                  disabled={loading || isGeneratingComment}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingComment ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Générer avec l'IA
                    </>
                  )}
                </button>
              )}
            </div>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={loading || isGeneratingComment}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 text-gray-900"
              placeholder="Ajoutez votre touche personnelle... ou cliquez sur 'Générer avec l'IA' si ce conseil a des avis Google !"
            />
            <p className="mt-1.5 text-xs text-gray-500">
              💡 Astuce : **texte** = <strong>gras</strong>, *texte* = <em>italique</em>, ==texte== = <span className="text-indigo-600 font-semibold">couleur</span>
            </p>
          </div>

          {/* Médias existants */}
          {existingMedia.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">
                Médias actuels
                {existingMedia.length > 1 && (
                  <span className="text-xs text-gray-500 font-normal ml-2">
                    (cliquez sur l'étoile pour définir l'image principale)
                  </span>
                )}
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {existingMedia.map((media, index) => (
                  <div key={media.id} className="relative group w-24 h-24 flex-shrink-0">
                    {media.type === 'image' ? (
                      <img
                        src={media.url}
                        alt="Existing"
                        className={`w-full h-full object-cover rounded-lg ${index === 0 ? 'ring-2 ring-yellow-400' : ''}`}
                      />
                    ) : (
                      <div className="relative w-full h-full">
                        <video
                          src={media.url}
                          className={`w-full h-full object-cover rounded-lg ${index === 0 ? 'ring-2 ring-yellow-400' : ''}`}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-lg pointer-events-none">
                          <span className="text-white text-2xl">▶️</span>
                        </div>
                      </div>
                    )}
                    {/* Bouton étoile pour définir comme principale */}
                    {existingMedia.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleSetAsPrimaryMedia(media.id)}
                        className={`absolute top-1 left-1 p-1 rounded-full transition ${
                          index === 0
                            ? 'bg-yellow-400 text-white'
                            : 'bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 hover:bg-yellow-400'
                        }`}
                        title={index === 0 ? 'Image principale' : 'Définir comme image principale'}
                      >
                        <Star className={`w-4 h-4 ${index === 0 ? 'fill-current' : ''}`} />
                      </button>
                    )}
                    {/* Bouton supprimer */}
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingMedia(media.id, media.url)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nouveaux médias */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900">
              Ajouter des photos & vidéos
            </label>

            {/* Tabs pour choisir le mode */}
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setMediaInputMode('file')}
                className={`flex-1 px-3 py-1.5 text-sm rounded-lg font-medium transition ${
                  mediaInputMode === 'file'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                📁 Fichiers
              </button>
              <button
                type="button"
                onClick={() => setMediaInputMode('url')}
                className={`flex-1 px-3 py-1.5 text-sm rounded-lg font-medium transition ${
                  mediaInputMode === 'url'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                🔗 Liens
              </button>
            </div>

            {/* Mode fichier */}
            {mediaInputMode === 'file' && (
              <>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-500 transition">
                  <input
                    id="media"
                    type="file"
                    accept="image/*,video/*"
                    capture="environment"
                    multiple
                    onChange={handleMediaChange}
                    disabled={loading}
                    className="hidden"
                  />
                  <label htmlFor="media" className="cursor-pointer">
                    <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-900 font-medium">
                      Ajouter des photos ou vidéos
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Depuis l'appareil ou la galerie
                    </p>
                  </label>
                </div>
                {mediaPreviews.length > 0 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                    {mediaPreviews.map((preview, index) => (
                      <div key={index} className="relative w-20 h-20 flex-shrink-0">
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
                              <span className="text-white text-xl">▶️</span>
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
                    <img
                      src={mediaUrls.split('\n')[0]}
                      alt="Aperçu"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                    {isUploadingImage ? (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                          <p className="text-sm font-medium">Optimisation de l'image...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                        {mediaUrls.includes('supabase') ? '✅ Image optimisée' : 'Photo'}
                      </div>
                    )}
                  </div>
                )}
                {/* Champ URL */}
                <textarea
                  value={mediaUrls}
                  onChange={(e) => setMediaUrls(e.target.value)}
                  disabled={loading || isUploadingImage}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 font-mono text-sm"
                  placeholder="Une URL par ligne"
                />
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
              <div className="flex gap-2">
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={loading || isLoadingLocation}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 text-gray-900"
                  placeholder="Rue de la Station 15, 6980 La Roche-en-Ardenne"
                />
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={loading || isLoadingLocation}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap"
                  title="Utiliser ma position actuelle"
                >
                  <MapPin size={18} />
                  <span className="hidden sm:inline">
                    {isLoadingLocation ? 'Localisation...' : 'Ma position'}
                  </span>
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {isLoadingLocation
                  ? 'Détection de votre position en cours...'
                  : 'Cliquez sur "Ma position" si vous êtes sur place, ou utilisez la carte ci-dessous'}
              </p>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 text-gray-900"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 text-gray-900"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 text-gray-900"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 text-gray-900"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 text-gray-900"
              placeholder="WELCOME2024"
            />
          </div>

          {/* Randonnée guidée */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900 flex items-center gap-2">
              <span className="text-lg">🥾</span>
              Randonnée guidée (optionnel)
            </label>
            <HikeUploader onHikeDataChange={setHikeData} disabled={loading} />
            {hikeData?.waypoints && hikeData.waypoints.length > 0 && (
              <div className="mt-3">
                <HikeElevationProfile waypoints={hikeData.waypoints} />
              </div>
            )}
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
                    Masquer
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
              disabled={loading || !title || isUploadingImage}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center gap-2 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sauvegarde...
                </>
              ) : isUploadingImage ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Optimisation image...
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
