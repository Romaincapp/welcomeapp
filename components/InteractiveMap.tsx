'use client'

import { useEffect, useState, useRef, useId } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import { Crosshair, Maximize2, X, Layers, Home, Eye, EyeOff } from 'lucide-react'
import { TipWithDetails } from '@/types'
import TipCard from './TipCard'
import { getSecureSectionPublic } from '@/lib/actions/secure-section'
import { createCategoryMarkerSVG, getCategoryStyle } from '@/lib/map/category-markers'

// Types de carte disponibles
export type MapStyle = 'standard' | 'dark' | 'terrain'

export const MAP_STYLES: Record<MapStyle, { url: string; attribution: string; label: string; icon: string }> = {
  standard: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    label: 'Standard',
    icon: '🗺️'
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    label: 'Sombre',
    icon: '🌙'
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    label: 'Terrain',
    icon: '⛰️'
  }
}

// Créer une icône de marqueur personnalisée selon la catégorie
const createCustomIcon = (categorySlug: string | undefined) => {
  const style = getCategoryStyle(categorySlug)
  return L.divIcon({
    className: 'custom-map-marker',
    html: createCategoryMarkerSVG(categorySlug, style.color),
    iconSize: [40, 52],
    iconAnchor: [20, 52],
    popupAnchor: [0, -52],
  })
}

// Créer une icône de maison pour le logement
const createHomeIcon = (color: string) => {
  return L.divIcon({
    className: 'home-map-marker',
    html: `
      <div style="position: relative;">
        <svg width="50" height="60" viewBox="0 0 50 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Ombre -->
          <ellipse cx="25" cy="56" rx="12" ry="4" fill="black" opacity="0.3"/>
          <!-- Marqueur de fond -->
          <path d="M25 0C16.5 0 10 6.5 10 15C10 26 25 50 25 50C25 50 40 26 40 15C40 6.5 33.5 0 25 0Z"
                fill="${color}"
                stroke="white"
                stroke-width="2.5"/>
          <!-- Icône de maison -->
          <g transform="translate(25, 15)">
            <!-- Toit -->
            <path d="M -6 -3 L 0 -7 L 6 -3" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <!-- Murs -->
            <rect x="-5" y="-3" width="10" height="8" fill="white" stroke="white" stroke-width="1"/>
            <!-- Porte -->
            <rect x="-2" y="1" width="4" height="4" fill="${color}" stroke="${color}" stroke-width="0.5"/>
            <!-- Fenêtre -->
            <circle cx="-2.5" cy="-0.5" r="1.2" fill="${color}"/>
            <circle cx="2.5" cy="-0.5" r="1.2" fill="${color}"/>
          </g>
        </svg>
      </div>
    `,
    iconSize: [50, 60],
    iconAnchor: [25, 60],
    popupAnchor: [0, -60],
  })
}

interface InteractiveMapProps {
  tips: TipWithDetails[]
  onMarkerClick?: (tip: TipWithDetails) => void
  themeColor?: string
  clientId: string
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
      className={`absolute top-20 right-4 z-[1000] bg-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-all ${
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

// Composant pour le sélecteur de style de carte
function MapStyleSelector({
  currentStyle,
  onStyleChange
}: {
  currentStyle: MapStyle
  onStyleChange: (style: MapStyle) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="absolute top-4 left-4 z-[1000]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-all hover:bg-gray-50"
        title="Changer le style de carte"
      >
        <Layers className="w-5 h-5 text-gray-700" />
      </button>

      {isOpen && (
        <div className="absolute top-14 left-0 bg-white rounded-lg shadow-xl overflow-hidden min-w-[140px]">
          {(Object.keys(MAP_STYLES) as MapStyle[]).map((style) => (
            <button
              key={style}
              onClick={() => {
                onStyleChange(style)
                setIsOpen(false)
              }}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                currentStyle === style ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
              }`}
            >
              <span className="text-xl">{MAP_STYLES[style].icon}</span>
              <span className="text-sm">{MAP_STYLES[style].label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Composant pour le bouton plein écran
function FullscreenButton({
  isFullscreen,
  onToggle
}: {
  isFullscreen: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={`absolute bottom-4 right-4 z-[1000] bg-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-all ${
        isFullscreen ? 'hover:bg-red-50' : 'hover:bg-gray-50'
      }`}
      title={isFullscreen ? 'Fermer' : 'Agrandir la carte'}
    >
      {isFullscreen ? (
        <X className="w-5 h-5 text-red-600" />
      ) : (
        <Maximize2 className="w-5 h-5 text-gray-700" />
      )}
    </button>
  )
}

// Composant pour afficher le logement (nécessite code d'accès)
function ShowHomeButton({
  clientId,
  onHomeLocated,
  isHomeVisible,
  themeColor
}: {
  clientId: string
  onHomeLocated: (coordinates: { lat: number; lng: number }, address: string) => void
  isHomeVisible: boolean
  themeColor: string
}) {
  const [showCodeModal, setShowCodeModal] = useState(false)
  const [accessCode, setAccessCode] = useState('')
  const [showCode, setShowCode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await getSecureSectionPublic(clientId, accessCode)

      if (result.success && result.data) {
        // ✅ FIX: Utiliser property_coordinates_parsed au lieu de property_coordinates
        const coords = result.data.property_coordinates_parsed
        const address = result.data.property_address

        if (coords && coords.lat && coords.lng) {
          onHomeLocated({ lat: coords.lat, lng: coords.lng }, address || 'Votre logement')
          setShowCodeModal(false)
          setAccessCode('')
        } else {
          setError('Aucune localisation de logement configurée')
        }
      } else {
        setError(result.message || 'Code d\'accès incorrect')
      }
    } catch (err) {
      setError('Erreur lors de la vérification du code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowCodeModal(true)}
        className={`absolute bottom-4 left-4 z-[1000] bg-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-all ${
          isHomeVisible ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-gray-50'
        }`}
        title="Afficher le logement"
      >
        <Home className={`w-5 h-5 ${isHomeVisible ? 'text-green-600' : 'text-gray-700'}`} />
      </button>

      {/* Modal de demande de code */}
      {showCodeModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-800">Localiser le logement</h3>
              </div>
              <button
                onClick={() => {
                  setShowCodeModal(false)
                  setError(null)
                  setAccessCode('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-indigo-800">
                <span className="font-semibold">🔒 Information protégée</span>
                <br />
                La localisation exacte du logement nécessite le code d'accès fourni par votre hôte.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="homeAccessCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Code d'accès
                </label>
                <div className="relative">
                  <input
                    id="homeAccessCode"
                    type={showCode ? 'text' : 'password'}
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Entrez votre code d'accès"
                    required
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !accessCode}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Vérification...' : 'Afficher le logement'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default function InteractiveMap({ tips, onMarkerClick, themeColor = '#4F46E5', clientId }: InteractiveMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [mapStyle, setMapStyle] = useState<MapStyle>('standard')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [homeLocation, setHomeLocation] = useState<{ lat: number; lng: number; address: string } | null>(null)

  // Clé unique stable pour MapContainer (useId génère la même valeur SSR et client)
  const mapKey = useId()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Centre par défaut (Bruxelles)
  const defaultCenter: [number, number] = [50.8503, 4.3517]
  const defaultZoom = 8

  // Style actuel de la carte
  const currentMapStyle = MAP_STYLES[mapStyle]

  // Gérer l'affichage du logement
  const handleHomeLocated = (coordinates: { lat: number; lng: number }, address: string) => {
    setHomeLocation({ ...coordinates, address })
  }

  // Empêcher le rendu côté serveur (Leaflet nécessite le DOM)
  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Chargement de la carte...</p>
      </div>
    )
  }

  const mapContent = (
    <MapContainer
      key={mapKey}
      center={defaultCenter}
      zoom={defaultZoom}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
      zoomControl={false}
    >
      <TileLayer
        attribution={currentMapStyle.attribution}
        url={currentMapStyle.url}
        key={mapStyle}
      />

      {/* Contrôles de zoom en haut à droite */}
      <ZoomControl position="topright" />

      {/* Ajustement automatique des bounds */}
      <FitBounds tips={tips} />

      {/* Sélecteur de style de carte */}
      <MapStyleSelector currentStyle={mapStyle} onStyleChange={setMapStyle} />

      {/* Bouton de géolocalisation */}
      <LocationButton themeColor={themeColor} />

      {/* Bouton plein écran */}
      <FullscreenButton isFullscreen={isFullscreen} onToggle={() => setIsFullscreen(!isFullscreen)} />

      {/* Bouton pour afficher le logement */}
      <ShowHomeButton
        clientId={clientId}
        onHomeLocated={handleHomeLocated}
        isHomeVisible={!!homeLocation}
        themeColor={themeColor}
      />

      {/* Marqueur du logement (maison) */}
      {homeLocation && (
        <Marker
          position={[homeLocation.lat, homeLocation.lng]}
          icon={createHomeIcon(themeColor)}
        >
          <Popup maxWidth={200} minWidth={200} closeButton={false}>
            <div className="text-center p-2">
              <div className="text-2xl mb-2">🏠</div>
              <div className="font-bold text-gray-800 mb-1">{homeLocation.address}</div>
              <div className="text-xs text-gray-500">Votre logement</div>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Marqueurs des tips */}
      {tips
        .filter((tip) => tip.coordinates_parsed)
        .map((tip) => (
          <Marker
            key={tip.id}
            position={[tip.coordinates_parsed!.lat, tip.coordinates_parsed!.lng]}
            icon={createCustomIcon(tip.category?.slug)}
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
  )

  // Mode normal : carte intégrée
  if (!isFullscreen) {
    return (
      <div className="relative w-full h-full">
        {mapContent}
      </div>
    )
  }

  // Mode fullscreen : modal overlay
  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-90">
      {/* Overlay cliquable pour fermer */}
      <div
        className="absolute inset-0"
        onClick={() => setIsFullscreen(false)}
      />

      {/* Container de la carte */}
      <div className="absolute inset-0 bg-white">
        {/* Carte */}
        {mapContent}
      </div>
    </div>
  )
}
