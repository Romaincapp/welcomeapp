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

  // Créer le path en format GeoJSON simplifié (prendre maximum 30 points)
  const step = Math.max(1, Math.floor(waypoints.length / 30))
  const pathCoords = waypoints
    .filter((_, i) => i % step === 0 || i === waypoints.length - 1)
    .map(w => [w.lng, w.lat])

  // Créer un GeoJSON pour la route
  const geojson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { stroke: "#10b981", "stroke-width": 3 },
        geometry: {
          type: "LineString",
          coordinates: pathCoords
        }
      },
      {
        type: "Feature",
        properties: { "marker-color": "#16a34a", "marker-size": "small", "marker-symbol": "circle" },
        geometry: {
          type: "Point",
          coordinates: [waypoints[0].lng, waypoints[0].lat]
        }
      },
      {
        type: "Feature",
        properties: { "marker-color": "#dc2626", "marker-size": "small", "marker-symbol": "circle" },
        geometry: {
          type: "Point",
          coordinates: [waypoints[waypoints.length - 1].lng, waypoints[waypoints.length - 1].lat]
        }
      }
    ]
  }

  // Encoder le GeoJSON en base64 pour l'URL
  const geojsonStr = encodeURIComponent(JSON.stringify(geojson))

  // Utiliser l'API MapBox Static Images (gratuit jusqu'à 50k requêtes/mois)
  // Format: https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/static/geojson({geojson})/auto/600x400@2x
  // Pour l'instant, utilisons une version simplifiée sans clé API

  // Alternative: Utiliser l'API geoapify (gratuite jusqu'à 3000/jour)
  // https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=600&height=400&center=lonlat:${centerLng},${centerLat}&zoom=${zoom}&marker=lonlat:${waypoints[0].lng},${waypoints[0].lat};color:%2316a34a;size:medium&marker=lonlat:${waypoints[waypoints.length - 1].lng},${waypoints[waypoints.length - 1].lat};color:%23dc2626;size:medium

  // Pour un affichage simple sans API key, utilisons une approche différente
  // On va générer une URL vers un service de génération de carte statique gratuit
  const markers = [
    `lonlat:${waypoints[0].lng},${waypoints[0].lat};color:%2316a34a;size:medium`,
    `lonlat:${waypoints[waypoints.length - 1].lng},${waypoints[waypoints.length - 1].lat};color:%23dc2626;size:medium`
  ]

  return `https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=${width}&height=${height}&center=lonlat:${centerLng},${centerLat}&zoom=${zoom}&marker=${markers[0]}&marker=${markers[1]}&apiKey=demo`
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
