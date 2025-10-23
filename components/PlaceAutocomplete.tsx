'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, MapPin } from 'lucide-react'

interface PlaceSuggestion {
  place_id: string
  description: string
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

interface PlaceAutocompleteProps {
  onPlaceSelected: (place: PlaceDetails) => void
  disabled?: boolean
}

export default function PlaceAutocomplete({ onPlaceSelected, disabled = false }: PlaceAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fermer les suggestions si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Recherche avec debounce
  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setLoading(true)

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(query)}`)
        if (!response.ok) throw new Error('Failed to fetch suggestions')

        const data: { predictions?: PlaceSuggestion[] } = await response.json()
        setSuggestions(data.predictions || [])
        setShowSuggestions(true)
        setError(null)
      } catch (err) {
        console.error('Error fetching suggestions:', err)
        setError('Erreur lors de la recherche')
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [query])

  const handleSelectPlace = async (placeId: string) => {
    setLoadingDetails(true)
    setShowSuggestions(false)
    setError(null)

    try {
      const response = await fetch(`/api/places/details?place_id=${placeId}`)
      if (!response.ok) throw new Error('Failed to fetch place details')

      const placeDetails: PlaceDetails = await response.json()
      onPlaceSelected(placeDetails)
      setQuery('')
    } catch (err) {
      console.error('Error fetching place details:', err)
      setError('Erreur lors du chargement des détails')
    } finally {
      setLoadingDetails(false)
    }
  }


  return (
    <div className="space-y-4">
      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🪄</span>
          <h3 className="text-sm font-semibold text-indigo-900">Remplissage intelligent</h3>
        </div>

        {/* Recherche de lieu */}
        <div ref={containerRef} className="relative">
          <label htmlFor="place-search" className="block text-xs font-medium mb-2 text-indigo-900">
            Rechercher un lieu
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="place-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              disabled={disabled || loadingDetails}
              className="w-full pl-10 pr-4 py-2 border border-indigo-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="Ex: Le Petit Gourmet, La Roche-en-Ardenne"
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-indigo-600 animate-spin" />
            )}
          </div>

          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.place_id}
                  type="button"
                  onClick={() => handleSelectPlace(suggestion.place_id)}
                  disabled={loadingDetails}
                  className="w-full px-4 py-3 text-left hover:bg-indigo-50 transition flex items-start gap-2 border-b border-gray-100 last:border-b-0 disabled:opacity-50"
                >
                  <MapPin className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-900">{suggestion.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Loader global */}
      {loadingDetails && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Récupération des données en cours...
        </div>
      )}
    </div>
  )
}
