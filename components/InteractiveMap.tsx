'use client'

import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Crosshair } from 'lucide-react'
import { TipWithDetails } from '@/types'
import TipCard from './TipCard'

// Créer une icône de marqueur personnalisée avec la couleur du thème
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="position: relative;">
        <svg width="30" height="45" viewBox="0 0 30 45" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Ombre -->
          <ellipse cx="15" cy="42" rx="8" ry="3" fill="black" opacity="0.2"/>
          <!-- Marqueur principal -->
          <path d="M15 0C8.925 0 4 4.925 4 11C4 19.25 15 40 15 40C15 40 26 19.25 26 11C26 4.925 21.075 0 15 0Z"
                fill="${color}"
                stroke="white"
                stroke-width="2"/>
          <!-- Point central blanc -->
          <circle cx="15" cy="11" r="4" fill="white"/>
        </svg>
      </div>
    `,
    iconSize: [30, 45],
    iconAnchor: [15, 45],
    popupAnchor: [0, -45],
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
function LocationButton({ themeColor }: { themeColor: string }) {
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
            background: ${themeColor};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            animation: pulse 2s infinite;
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
        <LocationButton themeColor={themeColor} />

        {/* Marqueurs */}
        {tips
          .filter((tip) => tip.coordinates_parsed)
          .map((tip) => (
            <Marker
              key={tip.id}
              position={[tip.coordinates_parsed!.lat, tip.coordinates_parsed!.lng]}
              icon={createCustomIcon(themeColor)}
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
                  themeColor={themeColor}
                />
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  )
}
