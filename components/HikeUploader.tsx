'use client'

import { useState } from 'react'
import { Upload, Loader2, MapPin, TrendingUp, Clock, Route } from 'lucide-react'
import { HikeData, HikeWaypoint } from '@/types'

interface HikeUploaderProps {
  onHikeDataChange: (data: HikeData | null) => void
  disabled?: boolean
}

export default function HikeUploader({ onHikeDataChange, disabled }: HikeUploaderProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hikeData, setHikeData] = useState<HikeData | null>(null)

  const parseGPX = async (file: File): Promise<HikeData> => {
    const text = await file.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(text, 'text/xml')

    const waypoints: HikeWaypoint[] = []

    // Détecter le format (GPX ou KML)
    const isKML = doc.querySelector('kml') !== null

    let points: NodeListOf<Element>
    if (isKML) {
      // KML: extraire les coordonnées depuis <coordinates>
      const coordElements = doc.querySelectorAll('coordinates')
      coordElements.forEach((coordEl) => {
        const coordText = coordEl.textContent?.trim()
        if (!coordText) return

        // Format KML: "lng,lat,elevation lng,lat,elevation ..."
        const coords = coordText.split(/\s+/).filter(c => c)
        coords.forEach((coord) => {
          const [lng, lat, ele] = coord.split(',').map(parseFloat)
          if (!isNaN(lat) && !isNaN(lng)) {
            waypoints.push({
              lat,
              lng,
              elevation: !isNaN(ele) ? ele : undefined
            })
          }
        })
      })
    } else {
      // GPX: extraire les points depuis <trkpt> ou <rtept>
      points = doc.querySelectorAll('trkpt, rtept')
      points.forEach((pt) => {
        const lat = parseFloat(pt.getAttribute('lat') || '0')
        const lng = parseFloat(pt.getAttribute('lon') || '0')
        const eleNode = pt.querySelector('ele')
        const elevation = eleNode ? parseFloat(eleNode.textContent || '0') : undefined

        waypoints.push({ lat, lng, elevation })
      })
    }

    // Calculer stats
    let minEle = Infinity
    let maxEle = -Infinity
    let totalDistance = 0
    let prevPoint: { lat: number; lng: number } | null = null

    waypoints.forEach((point) => {
      if (point.elevation !== undefined) {
        minEle = Math.min(minEle, point.elevation)
        maxEle = Math.max(maxEle, point.elevation)
      }

      if (prevPoint) {
        totalDistance += haversineDistance(prevPoint.lat, prevPoint.lng, point.lat, point.lng)
      }

      prevPoint = { lat: point.lat, lng: point.lng }
    })

    const elevationGain = maxEle !== -Infinity ? maxEle - minEle : 0

    return {
      distance: Math.round(totalDistance * 100) / 100,
      elevation_gain: Math.round(elevationGain),
      elevation_loss: Math.round(elevationGain),
      waypoints,
    }
  }

  const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const data = await parseGPX(file)
      setHikeData(data)
      onHikeDataChange(data)
    } catch (err: any) {
      console.error('Erreur parsing:', err)
      setError('Fichier invalide (GPX ou KML requis)')
      setHikeData(null)
      onHikeDataChange(null)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = () => {
    setHikeData(null)
    onHikeDataChange(null)
    setError(null)
  }

  return (
    <div className="space-y-3">
      {!hikeData ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-500 transition">
          <input
            id="gpx-file"
            type="file"
            accept=".gpx,.kml"
            onChange={handleFileUpload}
            disabled={disabled || loading}
            className="hidden"
          />
          <label htmlFor="gpx-file" className="cursor-pointer">
            {loading ? (
              <Loader2 className="w-10 h-10 mx-auto mb-2 text-indigo-600 animate-spin" />
            ) : (
              <Route className="w-10 h-10 mx-auto mb-2 text-gray-400" />
            )}
            <p className="text-sm text-gray-900 font-medium">
              Ajouter un itinéraire GPX/KML
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Formats: GPX, KML (Google Earth)
            </p>
          </label>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Route className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Itinéraire chargé</h3>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Retirer
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {hikeData.distance && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">
                  <span className="font-semibold">{hikeData.distance}</span> km
                </span>
              </div>
            )}
            {hikeData.elevation_gain && (
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                <span className="text-gray-700">
                  <span className="font-semibold">{hikeData.elevation_gain}</span> m D+
                </span>
              </div>
            )}
            {hikeData.waypoints && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-600" />
                <span className="text-gray-700">
                  <span className="font-semibold">{hikeData.waypoints.length}</span> points
                </span>
              </div>
            )}
          </div>

          {/* Champs additionnels */}
          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Durée estimée (min)
                </label>
                <input
                  type="number"
                  value={hikeData.duration || ''}
                  onChange={(e) => {
                    const newData = { ...hikeData, duration: parseInt(e.target.value) || undefined }
                    setHikeData(newData)
                    onHikeDataChange(newData)
                  }}
                  disabled={disabled}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                  placeholder="90"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Difficulté
                </label>
                <select
                  value={hikeData.difficulty || ''}
                  onChange={(e) => {
                    const newData = { ...hikeData, difficulty: e.target.value as any }
                    setHikeData(newData)
                    onHikeDataChange(newData)
                  }}
                  disabled={disabled}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Sélectionner</option>
                  <option value="facile">Facile</option>
                  <option value="moyen">Moyen</option>
                  <option value="difficile">Difficile</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded text-red-600 text-xs">
          {error}
        </div>
      )}
    </div>
  )
}
