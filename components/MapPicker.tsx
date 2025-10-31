'use client'

import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { Icon, LatLng, Map as LeafletMap } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Search, Loader2 } from 'lucide-react'

interface MapPickerProps {
  initialLat?: number
  initialLng?: number
  onLocationSelect: (lat: number, lng: number) => void
  onAddressFound?: (address: string) => void
}

// Composant pour gérer les clics sur la carte
function LocationMarker({ onLocationSelect, initialPosition }: {
  onLocationSelect: (lat: number, lng: number) => void
  initialPosition?: LatLng
}) {
  const [position, setPosition] = useState<LatLng | null>(initialPosition || null)

  // Mettre à jour le marqueur quand initialPosition change (via import Google Places)
  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition)
    }
  }, [initialPosition])

  useMapEvents({
    click(e) {
      setPosition(e.latlng)
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })

  // Créer une icône personnalisée pour le marqueur
  const customIcon = new Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })

  return position === null ? null : (
    <Marker position={position} icon={customIcon} />
  )
}

export default function MapPicker({
  initialLat,
  initialLng,
  onLocationSelect,
  onAddressFound
}: MapPickerProps) {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  )
  const mapRef = useRef<LeafletMap | null>(null)

  // Coordonnées par défaut (centre de la Belgique)
  const defaultCenter: [number, number] = [50.5039, 4.4699]
  const center: [number, number] =
    initialLat && initialLng ? [initialLat, initialLng] : defaultCenter

  const initialPosition = initialLat && initialLng
    ? new LatLng(initialLat, initialLng)
    : undefined

  useEffect(() => {
    setMounted(true)
  }, [])

  // Mettre à jour currentPosition et centrer la carte quand initialLat/initialLng changent
  useEffect(() => {
    if (initialLat && initialLng && mounted) {
      setCurrentPosition({ lat: initialLat, lng: initialLng })

      // Centrer la carte sur les nouvelles coordonnées
      if (mapRef.current) {
        mapRef.current.setView([initialLat, initialLng], 15)
      }
    }
  }, [initialLat, initialLng, mounted])

  const handleLocationSelect = async (lat: number, lng: number) => {
    setCurrentPosition({ lat, lng })
    onLocationSelect(lat, lng)

    // Géocodage inversé pour obtenir l'adresse
    if (onAddressFound) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        )
        const data = await response.json()
        if (data.display_name) {
          onAddressFound(data.display_name)
        }
      } catch (error) {
        console.error('Reverse geocoding error:', error)
      }
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) {
      setSearchError('Veuillez entrer une adresse')
      return
    }

    setIsSearching(true)
    setSearchError(null)

    try {
      // Utilisation de l'API Nominatim (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=be,fr,nl,de,lu&limit=1`
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        const latitude = parseFloat(lat)
        const longitude = parseFloat(lon)

        setCurrentPosition({ lat: latitude, lng: longitude })
        onLocationSelect(latitude, longitude)

        if (onAddressFound) {
          onAddressFound(data[0].display_name)
        }

        // Centrer la carte sur la nouvelle position
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 16)
        }
      } else {
        setSearchError('Adresse introuvable. Essayez une autre formulation.')
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      setSearchError('Erreur lors de la recherche. Réessayez.')
    } finally {
      setIsSearching(false)
    }
  }

  // Ne pas rendre la carte côté serveur
  if (!mounted) {
    return (
      <div className="w-full h-[250px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Chargement de la carte...</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Barre de recherche */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setSearchError(null)
            }}
            placeholder="Rechercher une adresse (ex: Rue du Marché 1, Bruxelles)..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
        >
          {isSearching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Recherche...</span>
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Chercher</span>
            </>
          )}
        </button>
      </form>

      {searchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
          {searchError}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
        <p className="text-xs text-blue-800 flex items-start gap-2">
          <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          <span>
            Recherchez une adresse ou cliquez sur la carte pour placer le marqueur.
          </span>
        </p>
      </div>

      {/* Carte */}
      <div className="w-full h-[250px] rounded-lg overflow-hidden border-2 border-gray-300 shadow-sm">
        <MapContainer
          center={center}
          zoom={initialLat && initialLng ? 15 : 8}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            onLocationSelect={handleLocationSelect}
            initialPosition={initialPosition}
          />
        </MapContainer>
      </div>

      {/* Coordonnées actuelles */}
      {currentPosition && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-2 flex items-center justify-between gap-2">
          <p className="text-xs text-green-800">
            <span className="font-medium">Position :</span>{' '}
            <span className="font-mono">
              {currentPosition.lat.toFixed(4)}, {currentPosition.lng.toFixed(4)}
            </span>
          </p>
          <button
            type="button"
            onClick={() => {
              setCurrentPosition(null)
              onLocationSelect(0, 0)
            }}
            className="text-xs text-green-700 hover:text-green-900 font-medium whitespace-nowrap"
          >
            Réinitialiser
          </button>
        </div>
      )}
    </div>
  )
}
