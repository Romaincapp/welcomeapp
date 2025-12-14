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
  const [guidedMode, setGuidedMode] = useState(false)

  const difficultyConfig = {
    facile: { color: 'text-green-600', bg: 'bg-green-100', label: 'Facile', icon: '🟢' },
    moyen: { color: 'text-orange-600', bg: 'bg-orange-100', label: 'Moyen', icon: '🟠' },
    difficile: { color: 'text-red-600', bg: 'bg-red-100', label: 'Difficile', icon: '🔴' },
  }

  const difficulty = hikeData.difficulty ? difficultyConfig[hikeData.difficulty] : null

  return (
    <div className="space-y-4">
      {/* Affichage mode guidé */}
      {guidedMode ? (
        <HikeGuidedMode
          hikeData={hikeData}
          onComplete={() => setGuidedMode(false)}
        />
      ) : (
        <>
          {/* Carte interactive - Attraction principale */}
          {hikeData.waypoints && hikeData.waypoints.length > 0 && (
            <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-lg bg-white">
              {/* Carte */}
              <div className="h-[500px]">
                <MapWithRoute waypoints={hikeData.waypoints} />
              </div>

              {/* Footer de la carte avec contrôles style shadcn/ui */}
              <div className="border-t border-gray-200 bg-white/95 backdrop-blur-sm">
                {/* Stats compactes */}
                <div className="px-4 py-3 grid grid-cols-2 md:grid-cols-4 gap-2 border-b border-gray-100">
                  {hikeData.distance && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Distance</p>
                        <p className="text-sm font-bold text-gray-900">{hikeData.distance} km</p>
                      </div>
                    </div>
                  )}

                  {hikeData.duration && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Durée</p>
                        <p className="text-sm font-bold text-gray-900">
                          {Math.floor(hikeData.duration / 60)}h{hikeData.duration % 60 > 0 ? (hikeData.duration % 60).toString().padStart(2, '0') : ''}
                        </p>
                      </div>
                    </div>
                  )}

                  {hikeData.elevation_gain && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-orange-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Dénivelé</p>
                        <p className="text-sm font-bold text-gray-900">{hikeData.elevation_gain} m D+</p>
                      </div>
                    </div>
                  )}

                  {difficulty && (
                    <div className="flex items-center gap-2">
                      <span className="text-base">{difficulty.icon}</span>
                      <div>
                        <p className="text-xs text-gray-500">Difficulté</p>
                        <p className={`text-sm font-bold ${difficulty.color}`}>{difficulty.label}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-4 py-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => setGuidedMode(true)}
                    className="flex-1 min-w-[200px] bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg px-4 py-2.5 font-semibold hover:from-green-700 hover:to-blue-700 transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Play className="w-4 h-4" />
                    Lancer le guidage GPS
                  </button>

                  {hikeData.instructions && hikeData.instructions.length > 0 && (
                    <button
                      onClick={() => setShowInstructions(!showInstructions)}
                      className="flex-1 min-w-[160px] bg-white border border-gray-200 text-gray-700 rounded-lg px-4 py-2.5 font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
                    >
                      <Route className="w-4 h-4" />
                      {showInstructions ? 'Masquer' : 'Voir'} les étapes
                    </button>
                  )}

                  {hikeData.gpx_url && (
                    <a
                      href={hikeData.gpx_url}
                      download
                      className="bg-white border border-gray-200 text-gray-700 rounded-lg px-4 py-2.5 font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
                    >
                      <Route className="w-4 h-4" />
                      Télécharger GPX
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Profil d'élévation */}
          {hikeData.waypoints && hikeData.waypoints.length > 0 && (
            <div>
              <HikeElevationProfile waypoints={hikeData.waypoints} />
            </div>
          )}

          {/* Instructions détaillées (collapsible) */}
          {showInstructions && hikeData.instructions && hikeData.instructions.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Route className="w-5 h-5 text-green-600" />
                Instructions détaillées ({hikeData.instructions.length} étapes)
              </h4>
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
        </>
      )}
    </div>
  )
}
