'use client'

import { HikeWaypoint } from '@/types'

interface HikeMapSnapshotProps {
  waypoints: HikeWaypoint[]
  width?: number
  height?: number
  className?: string
}

/**
 * Génère une URL d'image statique de carte pour un itinéraire de randonnée
 * Utilise l'API Static Map de OpenStreetMap via StaticMapMaker
 */
export function generateStaticMapUrl(waypoints: HikeWaypoint[], width: number = 800, height: number = 600): string {
  if (!waypoints || waypoints.length === 0) return ''

  // Calculer les bounds de l'itinéraire
  const lats = waypoints.map(w => w.lat)
  const lngs = waypoints.map(w => w.lng)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)

  // Calculer le centre et le zoom approximatif
  const centerLat = (minLat + maxLat) / 2
  const centerLng = (minLng + maxLng) / 2

  // Calculer le zoom en fonction de la bbox
  const latDiff = maxLat - minLat
  const lngDiff = maxLng - minLng
  const maxDiff = Math.max(latDiff, lngDiff)

  // Formule approximative pour le zoom
  let zoom = 13
  if (maxDiff > 0.5) zoom = 10
  else if (maxDiff > 0.2) zoom = 11
  else if (maxDiff > 0.1) zoom = 12
  else if (maxDiff > 0.05) zoom = 13
  else zoom = 14

  // Créer la liste des markers pour le départ et l'arrivée
  const startMarker = `color:green|${waypoints[0].lat},${waypoints[0].lng}`
  const endMarker = `color:red|${waypoints[waypoints.length - 1].lat},${waypoints[waypoints.length - 1].lng}`

  // Créer le path (simplifié pour éviter une URL trop longue)
  // On prend 1 point sur 10 pour les itinéraires longs
  const step = Math.max(1, Math.floor(waypoints.length / 50))
  const pathPoints = waypoints
    .filter((_, i) => i % step === 0 || i === waypoints.length - 1)
    .map(w => `${w.lat},${w.lng}`)
    .join('|')

  // Utiliser l'API StaticMapMaker (alternative gratuite)
  // Format: https://staticmap.openstreetmap.de/staticmap.php?center=lat,lng&zoom=13&size=800x600&markers=...&path=...
  const baseUrl = 'https://staticmap.openstreetmap.de/staticmap.php'
  const params = new URLSearchParams({
    center: `${centerLat},${centerLng}`,
    zoom: zoom.toString(),
    size: `${width}x${height}`,
    maptype: 'mapnik',
  })

  // Ajouter les markers
  params.append('markers', startMarker)
  params.append('markers', endMarker)

  // Ajouter le path
  if (pathPoints) {
    params.append('path', `color:0x10b981|weight:3|${pathPoints}`)
  }

  return `${baseUrl}?${params.toString()}`
}

/**
 * Composant qui affiche une carte statique d'un itinéraire de randonnée
 */
export default function HikeMapSnapshot({ waypoints, width = 800, height = 600, className = '' }: HikeMapSnapshotProps) {
  const mapUrl = generateStaticMapUrl(waypoints, width, height)

  if (!mapUrl) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`} style={{ width, height }}>
        <p className="text-gray-500">Carte non disponible</p>
      </div>
    )
  }

  return (
    <img
      src={mapUrl}
      alt="Aperçu de l'itinéraire"
      className={className}
      width={width}
      height={height}
    />
  )
}
