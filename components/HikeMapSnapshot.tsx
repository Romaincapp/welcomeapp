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

  // Calculer le zoom en fonction de la bbox avec plus de marge
  const latDiff = maxLat - minLat
  const lngDiff = maxLng - minLng
  const maxDiff = Math.max(latDiff, lngDiff)

  // Formule approximative pour le zoom - on réduit de 1 pour avoir plus de marge
  let zoom = 12
  if (maxDiff > 0.5) zoom = 9
  else if (maxDiff > 0.2) zoom = 10
  else if (maxDiff > 0.1) zoom = 11
  else if (maxDiff > 0.05) zoom = 12
  else zoom = 13

  // Créer le path simplifié (maximum 10 points pour éviter URLs trop longues)
  const step = Math.max(1, Math.floor(waypoints.length / 10))
  const simplifiedPoints = waypoints.filter((_, i) => i % step === 0 || i === waypoints.length - 1)

  // Utiliser l'API Geoapify avec la clé stockée dans les variables d'environnement
  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || 'demo'

  // Créer les markers de départ et d'arrivée
  const startMarker = `lonlat:${waypoints[0].lng},${waypoints[0].lat};color:%23059669;size:medium`
  const endMarker = `lonlat:${waypoints[waypoints.length - 1].lng},${waypoints[waypoints.length - 1].lat};color:%23dc2626;size:medium`

  // Créer le path de la route
  // Format pour Geoapify: path comme paires lng,lat séparées par des pipes
  const pathCoords = simplifiedPoints
    .map(w => `${w.lng},${w.lat}`)
    .join('|')

  const url = `https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=${width}&height=${height}&center=lonlat:${centerLng},${centerLat}&zoom=${zoom}&marker=${startMarker}&marker=${endMarker}&path=lonlat:${pathCoords};linecolor:%232563eb;linewidth:5&apiKey=${apiKey}`

  // Debug: afficher l'URL en console
  console.log('[HikeMapSnapshot] Generated URL:', url)
  console.log('[HikeMapSnapshot] API Key:', apiKey)

  return url
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
