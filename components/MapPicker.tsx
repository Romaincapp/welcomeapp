'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { Icon, LatLng } from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapPickerProps {
  initialLat?: number
  initialLng?: number
  onLocationSelect: (lat: number, lng: number) => void
}

// Composant pour gérer les clics sur la carte
function LocationMarker({ onLocationSelect, initialPosition }: {
  onLocationSelect: (lat: number, lng: number) => void
  initialPosition?: LatLng
}) {
  const [position, setPosition] = useState<LatLng | null>(initialPosition || null)

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

export default function MapPicker({ initialLat, initialLng, onLocationSelect }: MapPickerProps) {
  const [mounted, setMounted] = useState(false)

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

  // Ne pas rendre la carte côté serveur
  if (!mounted) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Chargement de la carte...</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Cliquez sur la carte pour placer le marqueur
        </p>
        {initialLat && initialLng && (
          <button
            type="button"
            onClick={() => onLocationSelect(0, 0)}
            className="text-xs text-red-600 hover:text-red-700 font-medium"
          >
            Réinitialiser
          </button>
        )}
      </div>

      <div className="w-full h-[400px] rounded-lg overflow-hidden border-2 border-gray-300 shadow-sm">
        <MapContainer
          center={center}
          zoom={initialLat && initialLng ? 15 : 8}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            onLocationSelect={onLocationSelect}
            initialPosition={initialPosition}
          />
        </MapContainer>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          Vous pouvez zoomer avec la molette de la souris et vous déplacer en faisant glisser la carte
        </span>
      </div>
    </div>
  )
}
