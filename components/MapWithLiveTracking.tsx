'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { HikeWaypoint } from '@/types'

// Fix icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface UserPosition {
  lat: number
  lng: number
  accuracy: number
}

interface MapWithLiveTrackingProps {
  waypoints: HikeWaypoint[]
  userPosition: UserPosition
}

function CenterOnUser({ userPosition }: { userPosition: UserPosition }) {
  const map = useMap()

  useEffect(() => {
    map.setView([userPosition.lat, userPosition.lng], 16, { animate: true })
  }, [userPosition, map])

  return null
}

export default function MapWithLiveTracking({ waypoints, userPosition }: MapWithLiveTrackingProps) {
  if (waypoints.length === 0) return null

  const positions: [number, number][] = waypoints.map(w => [w.lat, w.lng])

  // Trouver le waypoint le plus proche pour diviser le tracé
  const findNearestWaypointIndex = (): number => {
    let minDist = Infinity
    let nearestIndex = 0

    waypoints.forEach((wp, index) => {
      const R = 6371
      const dLat = ((wp.lat - userPosition.lat) * Math.PI) / 180
      const dLon = ((wp.lng - userPosition.lng) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((userPosition.lat * Math.PI) / 180) * Math.cos((wp.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const dist = R * c

      if (dist < minDist) {
        minDist = dist
        nearestIndex = index
      }
    })

    return nearestIndex
  }

  const nearestIndex = findNearestWaypointIndex()
  const completedPositions = positions.slice(0, nearestIndex + 1)
  const remainingPositions = positions.slice(nearestIndex)

  // Icône utilisateur
  const userIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill="#3b82f6" stroke="white" stroke-width="4"/>
        <circle cx="20" cy="20" r="10" fill="white"/>
        <path d="M20 12 L20 28 M20 12 L16 16 M20 12 L24 16" stroke="#3b82f6" stroke-width="3" fill="none" stroke-linecap="round"/>
      </svg>
    `),
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[userPosition.lat, userPosition.lng]}
        zoom={16}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Tracé parcouru (vert foncé) */}
        {completedPositions.length > 1 && (
          <Polyline
            positions={completedPositions}
            color="#059669"
            weight={5}
            opacity={0.9}
          />
        )}

        {/* Tracé restant (vert clair) */}
        {remainingPositions.length > 1 && (
          <Polyline
            positions={remainingPositions}
            color="#10b981"
            weight={4}
            opacity={0.5}
            dashArray="10, 10"
          />
        )}

        {/* Position utilisateur */}
        <Marker position={[userPosition.lat, userPosition.lng]} icon={userIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-bold text-blue-700">Votre position</p>
              <p className="text-xs text-gray-600">Précision: {Math.round(userPosition.accuracy)}m</p>
            </div>
          </Popup>
        </Marker>

        {/* Cercle de précision GPS */}
        <Circle
          center={[userPosition.lat, userPosition.lng]}
          radius={userPosition.accuracy}
          pathOptions={{
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.1,
            weight: 1
          }}
        />

        <CenterOnUser userPosition={userPosition} />
      </MapContainer>

      {/* Légende */}
      <div className="absolute bottom-4 right-4 bg-white bg-opacity-95 rounded-lg shadow-lg px-3 py-2 text-xs space-y-1 z-[1000]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-emerald-700"></div>
          <span className="text-gray-700">Parcouru</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-green-400 opacity-50 border-dashed"></div>
          <span className="text-gray-700">Restant</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
          <span className="text-gray-700">Vous</span>
        </div>
      </div>
    </div>
  )
}
