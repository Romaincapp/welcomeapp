'use client'

import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Crosshair } from 'lucide-react'
import { TipWithDetails } from '@/types'
import TipCard from './TipCard'

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
  themeColor?: string
}

// Composant pour ajuster automatiquement les bounds de la carte
function FitBounds({ tips }: { tips: TipWithDetails[] }) {
  const map = useMap()

  useEffect(() => {
    const validTips = tips.filter((tip) => tip.coordinates_parsed)

    if (validTips.length === 0) return

    if (validTips.length === 1) {
      // Si un seul marqueur, centrer et zoomer
      const tip = validTips[0]
      map.setView([tip.coordinates_parsed!.lat, tip.coordinates_parsed!.lng], 15)
    } else {
      // Si plusieurs marqueurs, ajuster les bounds pour tous les voir
      const bounds = L.latLngBounds(
        validTips.map((tip) => [tip.coordinates_parsed!.lat, tip.coordinates_parsed!.lng])
      )
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 })
    }
  }, [tips, map])

  return null
}

// Composant pour le bouton de géolocalisation
function LocationButton() {
  const map = useMap()
  const [isLocating, setIsLocating] = useState(false)
  const [hasLocation, setHasLocation] = useState(false)
  const userMarkerRef = useRef<L.Marker | null>(null)

  const handleLocate = () => {
    setIsLocating(true)

    map.locate({ setView: true, maxZoom: 16 })
      .on('locationfound', (e) => {
        setIsLocating(false)
        setHasLocation(true)

        // Supprimer l'ancien marqueur utilisateur s'il existe
        if (userMarkerRef.current) {
          userMarkerRef.current.remove()
        }

        // Créer un marqueur personnalisé pour la position de l'utilisateur
        const userIcon = L.divIcon({
          className: 'user-location-marker',
          html: `<div style="
            width: 20px;
            height: 20px;
            background: #3B82F6;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        })

        userMarkerRef.current = L.marker(e.latlng, { icon: userIcon })
          .addTo(map)
          .bindPopup('📍 Vous êtes ici')
      })
      .on('locationerror', () => {
        setIsLocating(false)
        alert('Impossible de récupérer votre position. Vérifiez les autorisations de localisation.')
      })
  }

  return (
    <button
      onClick={handleLocate}
      disabled={isLocating}
      className={`absolute top-4 right-4 z-[1000] bg-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-all ${
        isLocating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
      } ${hasLocation ? 'ring-2 ring-blue-500' : ''}`}
      title="Me localiser"
    >
      <Crosshair
        className={`w-5 h-5 text-gray-700 ${isLocating ? 'animate-spin' : ''}`}
      />
    </button>
  )
}

export default function InteractiveMap({ tips, onMarkerClick, themeColor = '#4F46E5' }: InteractiveMapProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Centre par défaut (Bruxelles)
  const defaultCenter: [number, number] = [50.8503, 4.3517]
  const defaultZoom = 8

  // Empêcher le rendu côté serveur (Leaflet nécessite le DOM)
  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Chargement de la carte...</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Ajustement automatique des bounds */}
        <FitBounds tips={tips} />

        {/* Bouton de géolocalisation */}
        <LocationButton />

        {/* Marqueurs */}
        {tips
          .filter((tip) => tip.coordinates_parsed)
          .map((tip) => (
            <Marker
              key={tip.id}
              position={[tip.coordinates_parsed!.lat, tip.coordinates_parsed!.lng]}
              icon={createDefaultIcon()}
            >
              <Popup maxWidth={180} minWidth={180} className="tip-preview-popup" closeButton={false}>
                <TipCard
                  tip={tip}
                  onClick={() => {
                    if (onMarkerClick) {
                      onMarkerClick(tip)
                    }
                  }}
                  isEditMode={false}
                  compact={true}
                />
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  )
}
