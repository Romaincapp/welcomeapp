'use client'

import { useState } from 'react'
import { X, Loader2, MapPin, Star, Sparkles, CheckCircle2, Circle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { TipInsert, TipMediaInsert, CategoryInsert } from '@/types'
import Image from 'next/image'

interface SmartFillModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  clientId: string
  propertyAddress?: string
  propertyLat?: number
  propertyLng?: number
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
}

const CATEGORIES_TO_SEARCH = [
  { key: 'restaurants', label: 'Restaurants & Cafés', icon: '🍴', enabled: true },
  { key: 'activites', label: 'Activités & Attractions', icon: '🎭', enabled: true },
  { key: 'nature', label: 'Nature & Parcs', icon: '🌲', enabled: true },
  { key: 'culture', label: 'Culture & Musées', icon: '🏛️', enabled: true },
  { key: 'shopping', label: 'Shopping', icon: '🛒', enabled: false },
  { key: 'bars', label: 'Bars & Vie nocturne', icon: '🍺', enabled: false },
]

export default function SmartFillModal({
  isOpen,
  onClose,
  onSuccess,
  clientId,
  propertyAddress,
  propertyLat,
  propertyLng,
}: SmartFillModalProps) {
  const [step, setStep] = useState<'input' | 'searching' | 'preview' | 'confirm' | 'importing' | 'success'>('input')
  const [address, setAddress] = useState(propertyAddress || '')
  const [latitude, setLatitude] = useState<number | null>(propertyLat || null)
  const [longitude, setLongitude] = useState<number | null>(propertyLng || null)
  const [radius, setRadius] = useState(5000) // 5km par défaut
  const [selectedCategories, setSelectedCategories] = useState(
    CATEGORIES_TO_SEARCH.filter(c => c.enabled).map(c => c.key)
  )
  const [foundPlaces, setFoundPlaces] = useState<NearbyPlace[]>([])
  const [searchProgress, setSearchProgress] = useState(0)
  const [importProgress, setImportProgress] = useState(0)
  const [importedCount, setImportedCount] = useState(0)
  const [skippedDuplicates, setSkippedDuplicates] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [suggestedBackgroundImage, setSuggestedBackgroundImage] = useState<string | null>(null)
  const [editingPlace, setEditingPlace] = useState<NearbyPlace | null>(null) // Pour l'overlay de confirmation

  const supabase = createClient()

  if (!isOpen) return null

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

      // Suggérer une image de fond basée sur la localisation
      if (uniquePlaces.length > 0 && uniquePlaces[0].photo_url) {
        // On peut suggérer la première photo de paysage/nature si disponible
        const landscapePlace = uniquePlaces.find(p =>
          p.suggested_category === 'nature' && p.photo_url
        )
        if (landscapePlace) {
          setSuggestedBackgroundImage(landscapePlace.photo_url)
        }
      }

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
          const { data: existingCategories } = await (supabase
            .from('categories') as any)
            .select('*')

          let categoryId: string | null = null

          if (placeDetails.suggested_category) {
            const matchingCategory = (existingCategories || []).find(
              (cat: any) => cat.slug === placeDetails.suggested_category
            )

            if (matchingCategory) {
              categoryId = matchingCategory.id
            } else {
              // Créer la catégorie si elle n'existe pas
              const categoryInfo = CATEGORIES_TO_SEARCH.find(
                c => c.key === placeDetails.suggested_category
              )

              if (categoryInfo) {
                const categoryData: CategoryInsert = {
                  name: categoryInfo.label,
                  slug: categoryInfo.key,
                  icon: categoryInfo.icon,
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
          if (tip && placeDetails.photos.length > 0) {
            const mediaData: TipMediaInsert = {
              tip_id: tip.id,
              url: placeDetails.photos[0].url,
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
    setSelectedCategories(CATEGORIES_TO_SEARCH.filter(c => c.enabled).map(c => c.key))
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
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Rue de la Station 15, 6980 La Roche-en-Ardenne"
              />
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
                    {/* Photo */}
                    <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden relative">
                      {place.photo_url ? (
                        <Image
                          src={place.photo_url}
                          alt={place.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <MapPin className="w-8 h-8" />
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
                      <span className="inline-block mt-2 px-2 py-0.5 bg-white rounded-full text-xs font-medium text-gray-700">
                        {CATEGORIES_TO_SEARCH.find(c => c.key === place.suggested_category)?.icon}{' '}
                        {CATEGORIES_TO_SEARCH.find(c => c.key === place.suggested_category)?.label || place.suggested_category}
                      </span>
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

              {/* Suggestion d'image de fond */}
              {suggestedBackgroundImage && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-900 mb-1">
                        Image de fond suggérée
                      </p>
                      <p className="text-xs text-blue-700 mb-3">
                        Nous avons trouvé une belle photo de la région qui pourrait servir d'arrière-plan à votre welcomebook.
                      </p>
                      <div className="relative h-24 rounded-lg overflow-hidden mb-2">
                        <Image
                          src={suggestedBackgroundImage}
                          alt="Background suggestion"
                          fill
                          className="object-cover"
                          sizes="400px"
                        />
                      </div>
                      <p className="text-xs text-blue-600">
                        💡 Vous pourrez l'utiliser plus tard via le menu "Personnalisation &gt; Arrière-plan"
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
              <p className="text-gray-600 mb-6">
                Création de {selectedCount} conseils avec toutes leurs informations
              </p>

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

              {/* Suggestion d'image de fond */}
              {suggestedBackgroundImage && (
                <div className="max-w-md mx-auto mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <Sparkles className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-blue-900 mb-2">
                    N'oubliez pas !
                  </p>
                  <p className="text-xs text-blue-700">
                    Nous avons trouvé une belle image de votre région. Rendez-vous dans<br/>
                    <strong>Personnalisation &gt; Arrière-plan</strong> pour l'utiliser.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => {
                    onSuccess()
                    handleClose()
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
    </div>
  )
}
