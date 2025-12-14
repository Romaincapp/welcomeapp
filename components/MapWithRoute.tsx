'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { HikeWaypoint } from '@/types'

// Fix pour les icônes Leaflet (utilise les icônes du CDN)
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface MapWithRouteProps {
  waypoints: HikeWaypoint[]
}

function FitBounds({ waypoints }: { waypoints: HikeWaypoint[] }) {
  const map = useMap()

  useEffect(() => {
    if (waypoints.length === 0) return

    const bounds = L.latLngBounds(waypoints.map(w => [w.lat, w.lng]))
    map.fitBounds(bounds, { padding: [20, 20] })
  }, [waypoints, map])

  return null
}

export default function MapWithRoute({ waypoints }: MapWithRouteProps) {
  if (waypoints.length === 0) return null

  const positions: [number, number][] = waypoints.map(w => [w.lat, w.lng])
  const center: [number, number] = [waypoints[0].lat, waypoints[0].lng]

  // Icônes personnalisées (encode en URI au lieu de base64 pour éviter btoa)
  const startIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="#10b981" stroke="white" stroke-width="3"/>
        <circle cx="16" cy="16" r="8" fill="white"/>
        <path d="M16 10 L16 22 M12 14 L16 10 L20 14" stroke="white" stroke-width="2" fill="none"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })

  const endIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="#ef4444" stroke="white" stroke-width="3"/>
        <circle cx="16" cy="16" r="8" fill="white"/>
        <rect x="12" y="12" width="8" height="8" fill="#ef4444"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })

  // Points d'intérêt (waypoints avec nom)
  const pois = waypoints.filter(w => w.name)

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Tracé de l'itinéraire */}
        <Polyline
          positions={positions}
          color="#10b981"
          weight={4}
          opacity={0.8}
        />

        {/* Marqueur de départ */}
        <Marker position={[waypoints[0].lat, waypoints[0].lng]} icon={startIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-bold text-green-700">Départ</p>
              {waypoints[0].elevation !== undefined && (
                <p className="text-xs text-gray-600">Alt: {Math.round(waypoints[0].elevation!)}m</p>
              )}
            </div>
          </Popup>
        </Marker>

        {/* Marqueur d'arrivée */}
        <Marker position={[waypoints[waypoints.length - 1].lat, waypoints[waypoints.length - 1].lng]} icon={endIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-bold text-red-700">Arrivée</p>
              {waypoints[waypoints.length - 1].elevation !== undefined && (
                <p className="text-xs text-gray-600">Alt: {Math.round(waypoints[waypoints.length - 1].elevation!)}m</p>
              )}
            </div>
          </Popup>
        </Marker>

        {/* Points d'intérêt */}
        {pois.map((poi, index) => (
          <Marker key={index} position={[poi.lat, poi.lng]}>
            <Popup>
              <div>
                <p className="font-bold">{poi.name}</p>
                {poi.description && <p className="text-xs text-gray-600 mt-1">{poi.description}</p>}
                {poi.elevation !== undefined && <p className="text-xs text-gray-600 mt-1">Alt: {Math.round(poi.elevation)}m</p>}
              </div>
            </Popup>
          </Marker>
        ))}

        <FitBounds waypoints={waypoints} />
      </MapContainer>
    </div>
  )
}
