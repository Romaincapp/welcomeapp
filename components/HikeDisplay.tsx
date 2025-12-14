'use client'

import { useState } from 'react'
import { MapPin, TrendingUp, Clock, Route, Navigation, ChevronDown, ChevronUp, Play } from 'lucide-react'
import { HikeData } from '@/types'
import HikeElevationProfile from './HikeElevationProfile'
import dynamic from 'next/dynamic'

const MapWithRoute = dynamic(() => import('./MapWithRoute'), { ssr: false })
const HikeGuidedMode = dynamic(() => import('./HikeGuidedMode'), { ssr: false })

interface HikeDisplayProps {
  hikeData: HikeData
}

export default function HikeDisplay({ hikeData }: HikeDisplayProps) {
  const [showInstructions, setShowInstructions] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [guidedMode, setGuidedMode] = useState(false)

  const difficultyConfig = {
    facile: { color: 'text-green-600', bg: 'bg-green-100', label: 'Facile', icon: '🟢' },
    moyen: { color: 'text-orange-600', bg: 'bg-orange-100', label: 'Moyen', icon: '🟠' },
    difficile: { color: 'text-red-600', bg: 'bg-red-100', label: 'Difficile', icon: '🔴' },
  }

  const difficulty = hikeData.difficulty ? difficultyConfig[hikeData.difficulty] : null

  return (
    <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-xl overflow-hidden border border-green-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-3">
        <div className="flex items-center gap-2">
          <Route className="w-5 h-5" />
          <h3 className="font-bold text-lg">Randonnée guidée</h3>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {hikeData.distance && (
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">Distance</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{hikeData.distance} <span className="text-sm font-normal text-gray-600">km</span></p>
            </div>
          )}

          {hikeData.duration && (
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 text-purple-600 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">Durée</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {Math.floor(hikeData.duration / 60)}h{hikeData.duration % 60 > 0 ? (hikeData.duration % 60).toString().padStart(2, '0') : ''}
                <span className="text-sm font-normal text-gray-600 ml-1">
                  {hikeData.duration < 60 ? 'min' : ''}
                </span>
              </p>
            </div>
          )}

          {hikeData.elevation_gain && (
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 text-orange-600 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">Dénivelé</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{hikeData.elevation_gain} <span className="text-sm font-normal text-gray-600">m D+</span></p>
            </div>
          )}

          {difficulty && (
            <div className={`${difficulty.bg} rounded-lg p-3 shadow-sm`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{difficulty.icon}</span>
                <span className="text-xs font-medium uppercase text-gray-700">Difficulté</span>
              </div>
              <p className={`text-xl font-bold ${difficulty.color}`}>{difficulty.label}</p>
            </div>
          )}
        </div>

        {/* Mode guidage GPS */}
        {!guidedMode && hikeData.waypoints && hikeData.waypoints.length > 0 && (
          <button
            onClick={() => setGuidedMode(true)}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg px-4 py-4 font-bold hover:from-green-700 hover:to-blue-700 transition flex items-center justify-center gap-2 shadow-lg"
          >
            <Play className="w-6 h-6" />
            Lancer le guidage GPS en temps réel
          </button>
        )}

        {/* Affichage mode guidé */}
        {guidedMode && hikeData.waypoints && hikeData.waypoints.length > 0 && (
          <div>
            <HikeGuidedMode
              hikeData={hikeData}
              onComplete={() => setGuidedMode(false)}
            />
          </div>
        )}

        {/* Profil d'élévation */}
        {!guidedMode && hikeData.waypoints && hikeData.waypoints.length > 0 && (
          <div>
            <HikeElevationProfile waypoints={hikeData.waypoints} />
          </div>
        )}

        {/* Carte interactive */}
        {!guidedMode && hikeData.waypoints && hikeData.waypoints.length > 0 && (
          <div>
            <button
              onClick={() => setShowMap(!showMap)}
              className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-2 text-gray-900 font-semibold">
                <Navigation className="w-5 h-5 text-blue-600" />
                Carte interactive de l'itinéraire
              </div>
              {showMap ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {showMap && (
              <div className="mt-3 rounded-lg overflow-hidden border border-gray-300">
                <MapWithRoute waypoints={hikeData.waypoints} />
              </div>
            )}
          </div>
        )}

        {/* Instructions turn-by-turn */}
        {hikeData.instructions && hikeData.instructions.length > 0 && (
          <div>
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-2 text-gray-900 font-semibold">
                <Route className="w-5 h-5 text-green-600" />
                Instructions détaillées ({hikeData.instructions.length} étapes)
              </div>
              {showInstructions ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {showInstructions && (
              <div className="mt-3 bg-white rounded-lg border border-gray-200 p-4">
                <ol className="space-y-3">
                  {hikeData.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 text-sm flex-1 pt-0.5">{instruction}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Bouton de téléchargement GPX si disponible */}
        {hikeData.gpx_url && (
          <div>
            <a
              href={hikeData.gpx_url}
              download
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg px-4 py-3 font-semibold hover:from-green-700 hover:to-blue-700 transition"
            >
              <Route className="w-5 h-5" />
              Télécharger l'itinéraire GPX
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
