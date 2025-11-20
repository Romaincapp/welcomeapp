'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, MapPin, Star, Sparkles, CheckCircle2, Circle, ChevronLeft, ChevronRight, ChevronDown, RefreshCw, Navigation, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { TipInsert, TipMediaInsert, CategoryInsert } from '@/types'
import Image from 'next/image'
import AddressAutocomplete from './AddressAutocomplete'
import { generateCommentFromReviews } from '@/lib/translate'
import AnimationOverlay from './AnimationOverlay'
import { Stats, detectNewBadge } from '@/lib/badge-detector'

interface SmartFillModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (tips?: any[]) => void // Accepte un tableau de tips créés
  clientId: string
  propertyAddress?: string
  propertyLat?: number
  propertyLng?: number
  stats: Stats
  hasCustomBackground?: boolean
}

interface NearbyPlace {
  place_id: string
  name: string
  address: string
  rating?: number
  user_ratings_total?: number
  coordinates: { lat: number; lng: number }
  photo_url: string | null
  suggested_category: string
  types: string[]
  selected?: boolean
  isDuplicate?: boolean // Indique si le lieu existe déjà
  editedCategory?: string // Catégorie modifiée par l'utilisateur
  availablePhotos?: string[] // Photos alternatives chargées à la demande
  selectedPhotoIndex?: number // Index de la photo sélectionnée
  isLoadingPhotos?: boolean // Indicateur de chargement des photos
}

interface PlaceDetails {
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
  reviews: Array<{
    author_name: string
    rating: number
    text: string
    relative_time_description: string
    profile_photo_url?: string
    time?: number
  }>
}

const CATEGORIES_TO_SEARCH = [
  { key: 'restaurants', label: 'Restaurants & Cafés', icon: '🍴', defaultSelected: true },
  { key: 'activites', label: 'Activités & Attractions', icon: '🎭', defaultSelected: true },
  { key: 'nature', label: 'Nature & Parcs', icon: '🌲', defaultSelected: false },
  { key: 'culture', label: 'Culture & Musées', icon: '🏛️', defaultSelected: false },
  { key: 'shopping', label: 'Shopping', icon: '🛒', defaultSelected: false },
  { key: 'bars', label: 'Bars & Vie nocturne', icon: '🍺', defaultSelected: false },
]

export default function SmartFillModal({
  isOpen,
  onClose,
  onSuccess,
  clientId,
  propertyAddress,
  propertyLat,
  propertyLng,
  stats,
  hasCustomBackground = false
}: SmartFillModalProps) {
  const [step, setStep] = useState<'input' | 'searching' | 'preview' | 'confirm' | 'importing' | 'success'>('input')
  const [showAnimation, setShowAnimation] = useState(false)
  const [detectedBadge, setDetectedBadge] = useState<any>(null)
  const [address, setAddress] = useState(propertyAddress || '')
  const [latitude, setLatitude] = useState<number | null>(propertyLat || null)
  const [longitude, setLongitude] = useState<number | null>(propertyLng || null)
  const [radius, setRadius] = useState(5000) // 5km par défaut
  const [selectedCategories, setSelectedCategories] = useState(
    CATEGORIES_TO_SEARCH.filter(c => c.defaultSelected).map(c => c.key)
  )
  const [foundPlaces, setFoundPlaces] = useState<NearbyPlace[]>([])
  const [searchProgress, setSearchProgress] = useState(0)
  const [importProgress, setImportProgress] = useState(0)
  const [importedCount, setImportedCount] = useState(0)
  const [skippedDuplicates, setSkippedDuplicates] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [editingPlace, setEditingPlace] = useState<NearbyPlace | null>(null) // Pour l'overlay de confirmation
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [showCategoryWarning, setShowCategoryWarning] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const [generateComments, setGenerateComments] = useState(false) // Option pour générer les commentaires IA
  const [currentGeneratingPlace, setCurrentGeneratingPlace] = useState<string | null>(null) // Lieu en cours de génération

  const supabase = createClient()

  // Vérifier localStorage au montage pour le message d'avertissement
  useEffect(() => {
    const hideWarning = localStorage.getItem('smartfill_hide_category_warning')
    if (hideWarning !== 'true' && step === 'preview' && foundPlaces.length > 0) {
      setShowCategoryWarning(true)
    }
  }, [step, foundPlaces.length])

  // Fonction pour fermer le message d'avertissement
  const handleCloseWarning = () => {
    if (dontShowAgain) {
      localStorage.setItem('smartfill_hide_category_warning', 'true')
    }
    setShowCategoryWarning(false)
  }

  if (!isOpen) return null

  const handleUseCurrentLocation = async () => {
    setIsLoadingLocation(true)
    setError(null)

    try {
      // Vérifier si la géolocalisation est disponible
      if (!navigator.geolocation) {
        throw new Error('La géolocalisation n\'est pas disponible sur votre navigateur')
      }

      // Obtenir la position actuelle
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        })
      })

      const { latitude: lat, longitude: lng } = position.coords

      // Reverse geocoding pour obtenir l'adresse via notre API
      const response = await fetch(`/api/places/reverse-geocode?lat=${lat}&lng=${lng}`)

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'adresse')
      }

      const data = await response.json()

      if (!data.address) {
        throw new Error('Impossible de trouver une adresse pour cette position')
      }

      // Mettre à jour les champs
      setLatitude(lat)
      setLongitude(lng)
      setAddress(data.address)

      setIsLoadingLocation(false)
    } catch (err) {
      console.error('Error getting location:', err)

      let errorMessage = 'Impossible d\'obtenir votre position'

      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Permission de géolocalisation refusée. Veuillez l\'activer dans les paramètres de votre navigateur.'
            break
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Position non disponible. Vérifiez que votre GPS est activé.'
            break
          case err.TIMEOUT:
            errorMessage = 'Délai d\'attente dépassé. Veuillez réessayer.'
            break
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }

      setError(errorMessage)
      setIsLoadingLocation(false)
    }
  }

  const handleSearch = async () => {
    if (!latitude || !longitude) {
      setError('Veuillez entrer une adresse valide avec coordonnées GPS')
      return
    }

    setStep('searching')
    setError(null)
    setSearchProgress(0)
    const allPlaces: NearbyPlace[] = []

    try {
      const totalCategories = selectedCategories.length

      // 1. Récupérer les conseils existants pour détecter les doublons
      const { data: existingTips } = await (supabase
        .from('tips') as any)
        .select('title, location')
        .eq('client_id', clientId)

      const existingTipsData = existingTips || []

      // Fonction pour normaliser les chaînes (ignorer accents, casse, espaces)
      const normalize = (str: string): string =>
        str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '')

      // Fonction pour vérifier si un lieu est un doublon
      const isDuplicate = (placeName: string, placeAddress: string): boolean => {
        const normalizedName = normalize(placeName)
        const normalizedAddress = normalize(placeAddress)

        return existingTipsData.some((tip: { title: string; location: string | null }) => {
          const tipName = normalize(tip.title || '')
          const tipLocation = normalize(tip.location || '')

          // Doublon si le nom correspond OU si l'adresse correspond
          return (
            (tipName && normalizedName === tipName) ||
            (tipLocation && normalizedAddress.includes(tipLocation)) ||
            (normalizedAddress && tipLocation.includes(normalizedAddress))
          )
        })
      }

      // 2. Rechercher dans chaque catégorie sélectionnée
      for (let i = 0; i < selectedCategories.length; i++) {
        const category = selectedCategories[i]
        setSearchProgress(((i + 1) / totalCategories) * 100)

        const response = await fetch(
          `/api/places/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}&category=${category}`
        )

        if (!response.ok) {
          console.error(`Failed to fetch category ${category}`)
          continue
        }

        const data: { results: NearbyPlace[] } = await response.json()

        // Marquer avec détection de doublons et sélection par défaut
        const placesWithSelection = data.results.map(place => {
          const duplicate = isDuplicate(place.name, place.address)
          return {
            ...place,
            selected: !duplicate, // Désélectionner les doublons par défaut
            isDuplicate: duplicate
          }
        })

        allPlaces.push(...placesWithSelection)
      }

      // 3. Enlever les doublons (même place_id)
      const uniquePlaces = allPlaces.filter(
        (place, index, self) => index === self.findIndex(p => p.place_id === place.place_id)
      )

      setFoundPlaces(uniquePlaces)

      setStep('preview')
    } catch (err) {
      console.error('Error searching places:', err)
      setError('Erreur lors de la recherche des lieux')
      setStep('input')
    }
  }

  const handleProceedToConfirm = () => {
    const placesToImport = foundPlaces.filter(p => p.selected)

    if (placesToImport.length === 0) {
      setError('Veuillez sélectionner au moins un lieu')
      return
    }

    setError(null)
    setStep('confirm')
  }

  const handleImport = async () => {
    const placesToImport = foundPlaces.filter(p => p.selected)

    if (placesToImport.length === 0) {
      setError('Veuillez sélectionner au moins un lieu')
      return
    }

    setStep('importing')
    setError(null)
    setImportProgress(0)
    setSkippedDuplicates(0)

    try {
      const totalPlaces = placesToImport.length
      let successCount = 0
      let skippedCount = 0

      for (let i = 0; i < placesToImport.length; i++) {
        const place = placesToImport[i]
        setImportProgress(((i + 1) / totalPlaces) * 100)

        // Ignorer les doublons même s'ils sont sélectionnés
        if (place.isDuplicate) {
          skippedCount++
          setSkippedDuplicates(skippedCount)
          continue
        }

        try {
          // 1. Récupérer les détails complets du lieu
          const detailsResponse = await fetch(`/api/places/details?place_id=${place.place_id}`)

          if (!detailsResponse.ok) {
            console.error(`Failed to fetch details for ${place.name}`)
            continue
          }

          const placeDetails: PlaceDetails = await detailsResponse.json()

          // 2. Trouver ou créer la catégorie
          // Utiliser la catégorie éditée par l'utilisateur si elle existe, sinon celle suggérée par l'API
          const finalCategory = place.editedCategory || placeDetails.suggested_category

          const { data: existingCategories } = await (supabase
            .from('categories') as any)
            .select('*')

          let categoryId: string | null = null

          if (finalCategory) {
            const matchingCategory = (existingCategories || []).find(
              (cat: any) => cat.slug === finalCategory
            )

            if (matchingCategory) {
              categoryId = matchingCategory.id
            } else {
              // Créer la catégorie si elle n'existe pas
              const categoryInfo = CATEGORIES_TO_SEARCH.find(
                c => c.key === finalCategory
              )

              if (categoryInfo) {
                const categoryData: CategoryInsert = {
                  name: `${categoryInfo.icon} ${categoryInfo.label}`,
                  slug: categoryInfo.key,
                }

                const { data: newCategory } = await (supabase
                  .from('categories') as any)
                  .insert([categoryData])
                  .select()
                  .single()

                if (newCategory) {
                  categoryId = newCategory.id
                }
              }
            }
          }

          // 3. Créer le conseil
          const tipData: TipInsert = {
            client_id: clientId,
            title: placeDetails.name,
            comment: null,
            location: placeDetails.address || null,
            contact_phone: placeDetails.phone || null,
            contact_email: null,
            route_url: placeDetails.google_maps_url || null,
            promo_code: null,
            category_id: categoryId,
            // Données Google Places
            rating: placeDetails.rating,
            user_ratings_total: placeDetails.user_ratings_total,
            price_level: placeDetails.price_level,
          }

          // Ajouter les coordonnées
          if (placeDetails.coordinates) {
            tipData.coordinates = {
              lat: placeDetails.coordinates.lat,
              lng: placeDetails.coordinates.lng,
            }
          }

          // Ajouter le site web
          if (placeDetails.website) {
            tipData.contact_social = {
              website: placeDetails.website,
            }
          }

          // Ajouter les horaires
          const hasOpeningHours = Object.values(placeDetails.opening_hours).some(h => h)
          if (hasOpeningHours) {
            tipData.opening_hours = placeDetails.opening_hours
          }

          // Générer un commentaire inspiré des avis Google (si l'option est activée)
          if (generateComments && placeDetails.reviews && placeDetails.reviews.length > 0) {
            setCurrentGeneratingPlace(placeDetails.name)
            console.log('[SMART FILL] Génération du commentaire pour:', placeDetails.name)
            const generatedComment = await generateCommentFromReviews(
              placeDetails.reviews,
              placeDetails.name,
              placeDetails.rating,
              placeDetails.user_ratings_total
            )
            if (generatedComment) {
              tipData.comment = generatedComment
              console.log('[SMART FILL] Commentaire généré:', generatedComment)
            }
            setCurrentGeneratingPlace(null)
          }

          // Ajouter les avis Google
          if (placeDetails.reviews && placeDetails.reviews.length > 0) {
            tipData.reviews = placeDetails.reviews
          }

          const { data: tip, error: tipError } = await (supabase
            .from('tips') as any)
            .insert([tipData])
            .select()
            .single()

          if (tipError) {
            console.error('Error creating tip:', tipError)
            continue
          }

          // 4. Ajouter la photo si disponible
          // Utiliser la photo sélectionnée par l'utilisateur si elle existe, sinon la première photo de l'API
          if (tip && placeDetails.photos.length > 0) {
            let photoUrl: string

            if (place.availablePhotos && place.selectedPhotoIndex !== undefined) {
              // Utiliser la photo sélectionnée par l'utilisateur
              photoUrl = place.availablePhotos[place.selectedPhotoIndex]
            } else {
              // Utiliser la première photo de l'API
              photoUrl = placeDetails.photos[0].url
            }

            const mediaData: TipMediaInsert = {
              tip_id: tip.id,
              url: photoUrl,
              type: 'image',
              order: 0,
            }

            await (supabase.from('tip_media') as any).insert([mediaData])
          }

          successCount++
        } catch (placeError) {
          console.error(`Error importing place ${place.name}:`, placeError)
        }
      }

      // Succès !
      setImportedCount(successCount)

      // Calculer les nouvelles stats et détecter badge
      const newStats: Stats = {
        ...stats,
        totalTips: stats.totalTips + successCount,
        // Les autres stats restent identiques pour l'instant
      }

      const badge = detectNewBadge(stats, newStats, hasCustomBackground)
      console.log('[SMART FILL] 🎯 Badge détecté:', badge)
      setDetectedBadge(badge)

      setStep('success')
    } catch (err) {
      console.error('Error importing places:', err)
      setError('Erreur lors de l\'importation des lieux')
      setStep('preview')
    }
  }

  const handleClose = () => {
    setStep('input')
    setAddress(propertyAddress || '')
    setLatitude(propertyLat || null)
    setLongitude(propertyLng || null)
    setRadius(5000)
    setSelectedCategories(CATEGORIES_TO_SEARCH.filter(c => c.defaultSelected).map(c => c.key))
    setFoundPlaces([])
    setSearchProgress(0)
    setImportProgress(0)
    setError(null)
    onClose()
  }

  const togglePlaceSelection = (placeId: string) => {
    setFoundPlaces(prev =>
      prev.map(place =>
        place.place_id === placeId ? { ...place, selected: !place.selected } : place
      )
    )
  }

  const toggleAllSelection = () => {
    // Vérifier si tous les lieux non-doublons sont sélectionnés
    const allNonDuplicatesSelected = foundPlaces
      .filter(p => !p.isDuplicate)
      .every(p => p.selected)

    setFoundPlaces(prev =>
      prev.map(place =>
        place.isDuplicate
          ? place // Ne pas modifier les doublons
          : { ...place, selected: !allNonDuplicatesSelected }
      )
    )
  }

  const updatePlaceCategory = (placeId: string, newCategory: string) => {
    setFoundPlaces(prev =>
      prev.map(place =>
        place.place_id === placeId ? { ...place, editedCategory: newCategory } : place
      )
    )
    setEditingPlace(null) // Fermer le menu
  }

  const loadAlternativePhotos = async (placeId: string) => {
    // Marquer comme en cours de chargement
    setFoundPlaces(prev =>
      prev.map(place =>
        place.place_id === placeId ? { ...place, isLoadingPhotos: true } : place
      )
    )

    try {
      // Récupérer les détails du lieu pour obtenir toutes les photos
      const response = await fetch(`/api/places/details?place_id=${placeId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch photos')
      }

      const details: PlaceDetails = await response.json()

      // Extraire les URLs des photos (max 5)
      const photoUrls = details.photos?.map(p => p.url) || []

      // Vérifier si des photos sont disponibles
      if (photoUrls.length === 0) {
        // Aucune photo disponible - afficher un message temporaire
        setFoundPlaces(prev =>
          prev.map(place =>
            place.place_id === placeId
              ? { ...place, isLoadingPhotos: false, availablePhotos: undefined }
              : place
          )
        )
        // Afficher brièvement un message (via console pour debug)
        console.log('Aucune photo disponible pour ce lieu')
        return
      }

      // Mettre à jour avec les photos disponibles
      setFoundPlaces(prev =>
        prev.map(place =>
          place.place_id === placeId
            ? {
                ...place,
                availablePhotos: photoUrls,
                selectedPhotoIndex: 0, // Commencer à la première photo
                isLoadingPhotos: false
              }
            : place
        )
      )
    } catch (error) {
      console.error('Error loading alternative photos:', error)
      // Retirer le loading en cas d'erreur
      setFoundPlaces(prev =>
        prev.map(place =>
          place.place_id === placeId ? { ...place, isLoadingPhotos: false } : place
        )
      )
    }
  }

  const changePhoto = (placeId: string, direction: 'prev' | 'next') => {
    setFoundPlaces(prev =>
      prev.map(place => {
        if (place.place_id === placeId && place.availablePhotos) {
          const currentIndex = place.selectedPhotoIndex ?? 0
          const totalPhotos = place.availablePhotos.length

          let newIndex: number
          if (direction === 'next') {
            newIndex = (currentIndex + 1) % totalPhotos
          } else {
            newIndex = (currentIndex - 1 + totalPhotos) % totalPhotos
          }

          return { ...place, selectedPhotoIndex: newIndex }
        }
        return place
      })
    )
  }

  const selectedCount = foundPlaces.filter(p => p.selected).length

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Pré-remplissage intelligent</h2>
              <p className="text-sm text-gray-600">Créez votre welcomebook en quelques clics</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={step === 'searching' || step === 'importing'}
            className="p-2 hover:bg-gray-100 rounded-full transition disabled:cursor-not-allowed"
          >
            <X className="w-6 h-6 text-gray-900" />
          </button>
        </div>

        {/* Étape 1 : Configuration */}
        {step === 'input' && (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-900">
                <strong>Comment ça marche ?</strong> Nous allons rechercher automatiquement les meilleurs
                restaurants, activités et attractions autour de votre propriété, puis vous pourrez choisir
                lesquels ajouter à votre welcomebook.
              </p>
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">
                Adresse de votre propriété
              </label>
              <div className="space-y-2">
                <AddressAutocomplete
                  value={address}
                  onChange={setAddress}
                  onLocationSelected={(lat, lng, addr) => {
                    setLatitude(lat)
                    setLongitude(lng)
                    setAddress(addr)
                  }}
                  placeholder="Rue de la Station 15, 6980 La Roche-en-Ardenne"
                />
                <button
                  onClick={handleUseCurrentLocation}
                  disabled={isLoadingLocation}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {isLoadingLocation ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Localisation en cours...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4" />
                      📍 Utiliser ma position actuelle
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Coordonnées (readonly) */}
            {latitude && longitude && (
              <div className="text-sm text-gray-600">
                <MapPin className="w-4 h-4 inline mr-1" />
                Coordonnées : {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </div>
            )}

            {/* Rayon de recherche */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">
                Rayon de recherche : {(radius / 1000).toFixed(1)} km
              </label>
              <input
                type="range"
                min="1000"
                max="20000"
                step="1000"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Catégories */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-900">
                Catégories à rechercher
              </label>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES_TO_SEARCH.map((category) => (
                  <button
                    key={category.key}
                    type="button"
                    onClick={() => {
                      if (selectedCategories.includes(category.key)) {
                        setSelectedCategories(prev => prev.filter(c => c !== category.key))
                      } else {
                        setSelectedCategories(prev => [...prev, category.key])
                      }
                    }}
                    className={`p-3 rounded-lg border-2 transition flex items-center gap-2 ${
                      selectedCategories.includes(category.key)
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{category.icon}</span>
                    <span className="font-medium text-sm">{category.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleSearch}
              disabled={!latitude || !longitude || selectedCategories.length === 0}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-5 h-5" />
              Lancer la recherche intelligente
            </button>
          </div>
        )}

        {/* Étape 2 : Recherche en cours */}
        {step === 'searching' && (
          <div className="space-y-6 py-12">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin mx-auto text-indigo-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Recherche des meilleurs lieux en cours...
              </h3>
              <p className="text-gray-600 mb-6">
                Nous analysons {selectedCategories.length} catégories autour de votre propriété
              </p>

              {/* Barre de progression */}
              <div className="max-w-md mx-auto">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${searchProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">{Math.round(searchProgress)}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Étape 3 : Preview des résultats */}
        {step === 'preview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {foundPlaces.length} lieux trouvés
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}
                  {foundPlaces.filter(p => p.isDuplicate).length > 0 && (
                    <span className="ml-2 text-orange-600">
                      • {foundPlaces.filter(p => p.isDuplicate).length} doublon{foundPlaces.filter(p => p.isDuplicate).length > 1 ? 's' : ''} détecté{foundPlaces.filter(p => p.isDuplicate).length > 1 ? 's' : ''}
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={toggleAllSelection}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                {foundPlaces.every(p => p.selected || p.isDuplicate) ? 'Tout désélectionner' : 'Tout sélectionner'}
              </button>
            </div>

            {/* Alerte doublons */}
            {foundPlaces.filter(p => p.isDuplicate).length > 0 && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <span className="text-xl">⚠️</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-orange-900">
                      Doublons détectés
                    </p>
                    <p className="text-xs text-orange-800 mt-1">
                      {foundPlaces.filter(p => p.isDuplicate).length} lieu{foundPlaces.filter(p => p.isDuplicate).length > 1 ? 'x' : ''} existe{foundPlaces.filter(p => p.isDuplicate).length > 1 ? 'nt' : ''} déjà dans votre welcomebook.
                      {foundPlaces.filter(p => p.isDuplicate).length > 1 ? ' Ils ont été' : ' Il a été'} automatiquement désélectionné{foundPlaces.filter(p => p.isDuplicate).length > 1 ? 's' : ''} pour éviter les doublons.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Message d'avertissement - Édition des catégories */}
            {showCategoryWarning && (
              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl shadow-sm">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900 mb-2">
                      💡 Astuce : Vérifiez les catégories suggérées
                    </p>
                    <p className="text-xs text-blue-800 mb-3">
                      Notre intelligence artificielle suggère automatiquement une catégorie pour chaque lieu,
                      mais elle peut parfois se tromper. Nous vous encourageons à vérifier et modifier les catégories
                      en cliquant sur le badge coloré sous chaque lieu avant de les ajouter à votre WelcomeApp.
                    </p>
                    <div className="flex items-center justify-between gap-3">
                      <label className="flex items-center gap-2 text-xs text-blue-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dontShowAgain}
                          onChange={(e) => setDontShowAgain(e.target.checked)}
                          className="w-3.5 h-3.5 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>Ne plus afficher ce message</span>
                      </label>
                      <button
                        onClick={handleCloseWarning}
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition"
                      >
                        Compris !
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Liste des lieux */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
              {foundPlaces.map((place) => (
                <div
                  key={place.place_id}
                  onClick={() => !place.isDuplicate && togglePlaceSelection(place.place_id)}
                  className={`p-4 border-2 rounded-xl transition ${
                    place.isDuplicate
                      ? 'border-orange-300 bg-orange-50 opacity-60 cursor-not-allowed'
                      : place.selected
                      ? 'border-indigo-500 bg-indigo-50 cursor-pointer'
                      : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Photo avec contrôles */}
                    <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden relative">
                      {/* Image avec skeleton */}
                      {(() => {
                        const displayPhoto = place.availablePhotos && place.selectedPhotoIndex !== undefined
                          ? place.availablePhotos[place.selectedPhotoIndex]
                          : place.photo_url

                        return displayPhoto ? (
                          <Image
                            src={displayPhoto}
                            alt={place.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                            loading="lazy"
                            quality={70}
                            placeholder="blur"
                            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=="
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <MapPin className="w-8 h-8" />
                          </div>
                        )
                      })()}

                      {/* Loading overlay */}
                      {place.isLoadingPhotos && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </div>
                      )}

                      {/* Contrôles photo - TOUJOURS VISIBLES */}
                      {!place.isDuplicate && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent">
                          {!place.availablePhotos ? (
                            // Bouton pour charger les photos alternatives
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                loadAlternativePhotos(place.place_id)
                              }}
                              className="w-full p-1.5 text-white text-[10px] font-medium hover:bg-white/20 transition flex items-center justify-center gap-1"
                              title="Voir plus de photos"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>{place.photo_url ? 'Autres photos' : 'Charger des photos'}</span>
                            </button>
                          ) : (
                            // Flèches de navigation entre photos
                            <div className="flex items-center justify-between p-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  changePhoto(place.place_id, 'prev')
                                }}
                                className="bg-white/90 p-1 rounded shadow hover:bg-white transition"
                                title="Photo précédente"
                              >
                                <ChevronLeft className="w-3.5 h-3.5 text-gray-700" />
                              </button>
                              {/* Indicateur de position */}
                              <div className="text-white text-[10px] font-medium px-2">
                                {(place.selectedPhotoIndex ?? 0) + 1}/{place.availablePhotos.length}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  changePhoto(place.place_id, 'next')
                                }}
                                className="bg-white/90 p-1 rounded shadow hover:bg-white transition"
                                title="Photo suivante"
                              >
                                <ChevronRight className="w-3.5 h-3.5 text-gray-700" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">
                          {place.name}
                        </h4>
                        {place.isDuplicate ? (
                          <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full flex-shrink-0 font-medium">
                            Existe déjà
                          </span>
                        ) : place.selected ? (
                          <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 truncate mt-1">{place.address}</p>
                      {place.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-medium text-gray-900">
                            {place.rating.toFixed(1)}
                          </span>
                          {place.user_ratings_total && (
                            <span className="text-xs text-gray-500">
                              ({place.user_ratings_total})
                            </span>
                          )}
                        </div>
                      )}
                      {/* Badge catégorie cliquable pour édition */}
                      <div className="relative mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingPlace(editingPlace?.place_id === place.place_id ? null : place)
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition group"
                          title="Modifier la catégorie"
                        >
                          <span className="text-sm">{CATEGORIES_TO_SEARCH.find(c => c.key === (place.editedCategory || place.suggested_category))?.icon}</span>
                          <span className="font-semibold">{CATEGORIES_TO_SEARCH.find(c => c.key === (place.editedCategory || place.suggested_category))?.label || (place.editedCategory || place.suggested_category)}</span>
                          <ChevronDown className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" />
                        </button>

                        {/* Menu déroulant pour changer la catégorie */}
                        {editingPlace?.place_id === place.place_id && (
                          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[200px]">
                            {CATEGORIES_TO_SEARCH.map((category) => (
                              <button
                                key={category.key}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  updatePlaceCategory(place.place_id, category.key)
                                }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition flex items-center gap-2 first:rounded-t-lg last:rounded-b-lg"
                              >
                                <span>{category.icon}</span>
                                <span>{category.label}</span>
                                {(place.editedCategory || place.suggested_category) === category.key && (
                                  <CheckCircle2 className="w-4 h-4 ml-auto text-indigo-600" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('input')}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-900 hover:bg-gray-50 transition"
              >
                Modifier la recherche
              </button>
              <button
                onClick={handleProceedToConfirm}
                disabled={selectedCount === 0}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-5 h-5" />
                Continuer avec {selectedCount} lieu{selectedCount > 1 ? 'x' : ''}
              </button>
            </div>
          </div>
        )}

        {/* Étape 4 : Confirmation finale */}
        {step === 'confirm' && (
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
                Confirmation finale
              </h3>

              {/* Récapitulatif */}
              <div className="bg-white rounded-lg p-5 mb-4 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">Vous êtes sur le point d'ajouter :</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 bg-indigo-50 rounded-lg">
                      <p className="text-indigo-900 font-bold text-2xl">{selectedCount}</p>
                      <p className="text-indigo-700">Nouveaux conseils</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-purple-900 font-bold text-2xl">
                        {new Set(foundPlaces.filter(p => p.selected).map(p => p.suggested_category)).size}
                      </p>
                      <p className="text-purple-700">Catégories</p>
                    </div>
                  </div>
                </div>

                {/* Liste des catégories */}
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">Répartition par catégorie :</p>
                  <div className="space-y-2">
                    {Array.from(new Set(foundPlaces.filter(p => p.selected).map(p => p.suggested_category))).map(category => {
                      const categoryCount = foundPlaces.filter(p => p.selected && p.suggested_category === category).length
                      const categoryInfo = CATEGORIES_TO_SEARCH.find(c => c.key === category)
                      return (
                        <div key={category} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium text-gray-700">
                            {categoryInfo?.icon} {categoryInfo?.label || category}
                          </span>
                          <span className="text-sm font-bold text-gray-900">{categoryCount}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Chaque conseil comprendra */}
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Chaque conseil inclura :</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                    <div className="flex items-center gap-1">
                      <span className="text-green-500">✓</span> Titre & Description
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-green-500">✓</span> Adresse complète
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-green-500">✓</span> Coordonnées GPS
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-green-500">✓</span> Photo principale
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-green-500">✓</span> Téléphone & Site web
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-green-500">✓</span> Horaires d'ouverture
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-green-500">✓</span> Lien Google Maps
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-green-500">✓</span> Note & Avis
                    </div>
                  </div>
                </div>
              </div>

              {/* Option génération de commentaires IA */}
              <div className="bg-white rounded-lg p-5 mb-4 border-2 border-indigo-200">
                <div className="flex items-start gap-3 mb-3">
                  <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      ✨ Bonus : Descriptions personnalisées par IA (Optionnel)
                    </p>
                    <p className="text-xs text-gray-600 mb-3">
                      Générez automatiquement des commentaires chaleureux et authentiques inspirés des meilleurs avis Google pour chaque lieu.
                      <span className="font-semibold"> Vos conseils sont déjà complets sans cette option</span>, mais cela ajoute une touche personnelle qui peut séduire vos voyageurs.
                    </p>
                    <label className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg cursor-pointer hover:bg-indigo-100 transition">
                      <input
                        type="checkbox"
                        checked={generateComments}
                        onChange={(e) => setGenerateComments(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-indigo-900">
                          Oui, générer des descriptions personnalisées avec l'IA
                        </p>
                        {generateComments && (
                          <p className="text-xs text-indigo-700 mt-1">
                            ⏱️ Temps estimé : <span className="font-semibold">~{selectedCount * 3} secondes</span> ({selectedCount} lieux × 3 sec/lieu)
                          </p>
                        )}
                      </div>
                    </label>
                    {!generateComments && (
                      <p className="text-xs text-gray-500 mt-2 italic">
                        💡 Pas de souci ! Vous pourrez toujours ajouter vos commentaires personnels plus tard depuis l'édition de chaque conseil.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-900">
                  <strong>⚠️ Important :</strong> Cette action va créer {selectedCount} nouveau{selectedCount > 1 ? 'x' : ''} conseil{selectedCount > 1 ? 's' : ''}.
                  Vous pourrez les modifier ou supprimer individuellement par la suite.
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('preview')}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-900 hover:bg-gray-50 transition"
              >
                Retour
              </button>
              <button
                onClick={handleImport}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Confirmer l'import
              </button>
            </div>
          </div>
        )}

        {/* Étape 5 : Import en cours */}
        {step === 'importing' && (
          <div className="space-y-6 py-12">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin mx-auto text-indigo-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Import des lieux en cours...
              </h3>
              <p className="text-gray-600 mb-2">
                Création de {selectedCount} conseils avec toutes leurs informations
              </p>

              {/* Indication génération commentaire en temps réel */}
              {currentGeneratingPlace && (
                <div className="mt-4 mb-6 p-3 bg-indigo-50 border border-indigo-200 rounded-lg max-w-md mx-auto">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                    <span className="text-indigo-900 font-medium">
                      Génération du commentaire pour :
                    </span>
                  </div>
                  <p className="text-indigo-700 font-semibold mt-1 text-center">
                    "{currentGeneratingPlace}"
                  </p>
                </div>
              )}

              {/* Barre de progression */}
              <div className="max-w-md mx-auto">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${importProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">{Math.round(importProgress)}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Étape 6 : Succès */}
        {step === 'success' && (
          <div className="space-y-6 py-12">
            <div className="text-center">
              {/* Icône de succès animée */}
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-16 h-16 text-white" />
              </div>

              <h3 className="text-3xl font-bold text-gray-900 mb-3">
                Félicitations ! 🎉
              </h3>
              <p className="text-lg text-gray-700 mb-8">
                Votre welcomebook a été pré-rempli avec succès
              </p>

              {/* Statistiques */}
              <div className="max-w-md mx-auto mb-8">
                <div className={`grid ${skippedDuplicates > 0 ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
                  <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                    <p className="text-4xl font-bold text-indigo-600 mb-2">{importedCount}</p>
                    <p className="text-sm font-medium text-indigo-900">
                      Conseil{importedCount > 1 ? 's' : ''} ajouté{importedCount > 1 ? 's' : ''}
                    </p>
                  </div>
                  {skippedDuplicates > 0 && (
                    <div className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-200">
                      <p className="text-4xl font-bold text-orange-600 mb-2">{skippedDuplicates}</p>
                      <p className="text-sm font-medium text-orange-900">
                        Doublon{skippedDuplicates > 1 ? 's' : ''}<br/>ignoré{skippedDuplicates > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                  <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                    <p className="text-4xl font-bold text-green-600 mb-2">100%</p>
                    <p className="text-sm font-medium text-green-900">
                      Informations<br/>complètes
                    </p>
                  </div>
                </div>
              </div>

              {/* Liste des informations incluses */}
              <div className="max-w-md mx-auto mb-8 p-6 bg-gray-50 rounded-xl text-left">
                <p className="text-sm font-semibold text-gray-900 mb-3 text-center">
                  Chaque conseil inclut :
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Photos de qualité</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Coordonnées GPS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Téléphone</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Site web</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Horaires</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Itinéraire</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    // Déclencher l'animation avant de fermer
                    setShowAnimation(true)
                    // onSuccess() et handleClose() seront appelés dans le callback d'AnimationOverlay
                  }}
                  className="w-full max-w-md mx-auto px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-6 h-6" />
                  Voir mon welcomebook
                </button>
                <p className="text-xs text-gray-500">
                  Vous pouvez modifier ou supprimer chaque conseil individuellement
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Animation de succès + badge (ajout en masse) */}
      <AnimationOverlay
        show={showAnimation}
        type="batch"
        badge={detectedBadge}
        count={importedCount}
        onComplete={() => {
          setShowAnimation(false)
          setDetectedBadge(null)
          onSuccess()
          handleClose()
        }}
      />
    </div>
  )
}
