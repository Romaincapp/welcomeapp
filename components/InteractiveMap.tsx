'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { TipWithDetails } from '@/types'

// Fix pour les icônes par défaut de Leaflet avec Next.js
const createDefaultIcon = () => {
  return L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })
}

interface InteractiveMapProps {
  tips: TipWithDetails[]
  onMarkerClick?: (tip: TipWithDetails) => void
}

export default function InteractiveMap({ tips, onMarkerClick }: InteractiveMapProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Calculer le centre et le zoom en fonction des conseils
  const calculateMapCenter = () => {
    if (tips.length === 0) {
      return { center: [50.8503, 4.3517] as [number, number], zoom: 8 } // Bruxelles par défaut
    }

    const validTips = tips.filter((tip) => tip.coordinates_parsed)
    if (validTips.length === 0) {
      return { center: [50.8503, 4.3517] as [number, number], zoom: 8 }
    }

    // Calculer le centre moyen
    const avgLat =
      validTips.reduce((sum, tip) => sum + tip.coordinates_parsed!.lat, 0) / validTips.length
    const avgLng =
      validTips.reduce((sum, tip) => sum + tip.coordinates_parsed!.lng, 0) / validTips.length

    return { center: [avgLat, avgLng] as [number, number], zoom: 12 }
  }

  const { center, zoom } = calculateMapCenter()

  // Empêcher le rendu côté serveur (Leaflet nécessite le DOM)
  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Chargement de la carte...</p>
      </div>
    )
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {tips
        .filter((tip) => tip.coordinates_parsed)
        .map((tip) => (
          <Marker
            key={tip.id}
            position={[tip.coordinates_parsed!.lat, tip.coordinates_parsed!.lng]}
            icon={createDefaultIcon()}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) {
                  onMarkerClick(tip)
                }
              },
            }}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-bold text-lg mb-1">{tip.title}</h3>
                {tip.category && (
                  <p className="text-sm text-gray-600 mb-2">
                    {tip.category.icon} {tip.category.name}
                  </p>
                )}
                {tip.location && <p className="text-sm text-gray-500">{tip.location}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  )
}
