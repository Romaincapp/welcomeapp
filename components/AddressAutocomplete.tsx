'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, Loader2 } from 'lucide-react'

interface AddressSuggestion {
  place_id: string
  description: string
}

interface AddressAutocompleteProps {
  value: string
  onChange: (address: string) => void
  onLocationSelected: (lat: number, lng: number, address: string) => void
  placeholder?: string
  disabled?: boolean
}

export default function AddressAutocomplete({
  value,
  onChange,
  onLocationSelected,
  placeholder = "Entrez votre adresse",
  disabled = false
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
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
    if (value.length < 3) {
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
        // Utiliser l'API Google Places Autocomplete avec types=address
        const response = await fetch(
          `/api/places/autocomplete?input=${encodeURIComponent(value)}&types=address`
        )

        if (!response.ok) throw new Error('Failed to fetch suggestions')

        const data: { predictions?: AddressSuggestion[] } = await response.json()
        setSuggestions(data.predictions || [])
        setShowSuggestions(true)
      } catch (error) {
        console.error('Error fetching address suggestions:', error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [value])

  const handleSelectSuggestion = async (suggestion: AddressSuggestion) => {
    onChange(suggestion.description)
    setShowSuggestions(false)
    setSuggestions([])

    // Récupérer les coordonnées GPS de l'adresse
    try {
      const response = await fetch(`/api/places/details?place_id=${suggestion.place_id}`)
      if (!response.ok) throw new Error('Failed to fetch address details')

      const details = await response.json()

      if (details.coordinates) {
        onLocationSelected(
          details.coordinates.lat,
          details.coordinates.lng,
          suggestion.description
        )
      }
    } catch (error) {
      console.error('Error fetching address details:', error)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value.length >= 3 && suggestions.length > 0 && setShowSuggestions(true)}
          disabled={disabled}
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-900"
          placeholder={placeholder}
        />
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-600 animate-spin" />
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-indigo-50 transition flex items-start gap-3 border-b border-gray-100 last:border-b-0"
            >
              <MapPin className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-900">{suggestion.description}</span>
            </button>
          ))}
        </div>
      )}

      {/* Message si aucune suggestion */}
      {showSuggestions && !loading && value.length >= 3 && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
          <p className="text-sm text-gray-600 text-center">
            Aucune adresse trouvée. Essayez d'être plus précis.
          </p>
        </div>
      )}
    </div>
  )
}
