'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Square, Navigation, Trophy, Zap, Volume2, VolumeX } from 'lucide-react'
import { HikeData, HikeWaypoint } from '@/types'
import dynamic from 'next/dynamic'

const MapWithLiveTracking = dynamic(() => import('./MapWithLiveTracking'), { ssr: false })

interface HikeGuidedModeProps {
  hikeData: HikeData
  onComplete?: () => void
}

interface UserPosition {
  lat: number
  lng: number
  accuracy: number
  speed: number | null
}

export default function HikeGuidedMode({ hikeData, onComplete }: HikeGuidedModeProps) {
  const [isTracking, setIsTracking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [distanceCovered, setDistanceCovered] = useState(0)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [achievements, setAchievements] = useState<string[]>([])

  const watchIdRef = useRef<number | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastAnnouncementRef = useRef<number>(0)

  // Calcul de la distance entre 2 points
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

  // Trouver le waypoint le plus proche
  const findNearestWaypoint = (pos: UserPosition): number => {
    if (!hikeData.waypoints) return 0

    let minDist = Infinity
    let nearestIndex = 0

    hikeData.waypoints.forEach((wp, index) => {
      const dist = haversineDistance(pos.lat, pos.lng, wp.lat, wp.lng)
      if (dist < minDist) {
        minDist = dist
        nearestIndex = index
      }
    })

    return nearestIndex
  }

  // Annonce vocale
  const speak = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'fr-FR'
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
  }

  // Démarrer le suivi
  const startTracking = () => {
    if (!navigator.geolocation) {
      alert('Géolocalisation non supportée par votre navigateur')
      return
    }

    setIsTracking(true)
    setIsPaused(false)
    setStartTime(Date.now())
    speak('Guidage démarré. Bonne randonnée !')

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newPos: UserPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed
        }
        setUserPosition(newPos)

        // Calculer distance parcourue
        if (userPosition) {
          const dist = haversineDistance(
            userPosition.lat,
            userPosition.lng,
            newPos.lat,
            newPos.lng
          )
          setDistanceCovered(prev => prev + dist)
        }

        // Annonces vocales périodiques
        const now = Date.now()

        if (now - lastAnnouncementRef.current > 60000) { // Toutes les minutes
          // Calculer le pourcentage basé sur la distance réelle parcourue
          const totalDistance = hikeData.distance || 1 // en km
          const distanceKm = distanceCovered // déjà en km
          const progressPercent = Math.min(Math.round((distanceKm / totalDistance) * 100), 100)
          speak(`Vous avez parcouru ${progressPercent} pourcent du parcours, soit ${distanceKm.toFixed(1)} kilomètres`)
          lastAnnouncementRef.current = now
        }
      },
      (error) => {
        console.error('Erreur géolocalisation:', error)
        speak('Erreur de localisation GPS')
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    )

    // Chrono
    intervalRef.current = setInterval(() => {
      if (!isPaused) {
        setElapsedTime(Date.now() - (startTime || Date.now()))
      }
    }, 1000)
  }

  // Pause
  const pauseTracking = () => {
    setIsPaused(true)
    speak('Guidage en pause')
  }

  // Reprendre
  const resumeTracking = () => {
    setIsPaused(false)
    speak('Guidage repris')
  }

  // Arrêter
  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    setIsTracking(false)
    setIsPaused(false)
    speak('Guidage terminé. Félicitations !')

    // Stats finales
    if (onComplete) onComplete()
  }

  // Nettoyage
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Format temps
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  // Calcul progression
  const progress = userPosition && hikeData.waypoints
    ? (findNearestWaypoint(userPosition) / hikeData.waypoints.length) * 100
    : 0

  // Vitesse moyenne
  const avgSpeed = elapsedTime > 0 ? (distanceCovered / (elapsedTime / 3600000)) : 0

  return (
    <div className="bg-gradient-to-br from-green-600 to-blue-600 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-blue-700 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            Mode Guidage GPS
          </h3>
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="p-2 hover:bg-white/20 rounded-full transition"
          >
            {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats en temps réel */}
        {isTracking && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/95 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600 font-medium mb-1">Temps</p>
              <p className="text-xl font-bold text-green-700">{formatTime(elapsedTime)}</p>
            </div>
            <div className="bg-white/95 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600 font-medium mb-1">Distance</p>
              <p className="text-xl font-bold text-blue-700">{distanceCovered.toFixed(2)} km</p>
            </div>
            <div className="bg-white/95 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600 font-medium mb-1">Vitesse</p>
              <p className="text-xl font-bold text-orange-700">{avgSpeed.toFixed(1)} km/h</p>
            </div>
          </div>
        )}

        {/* Barre de progression */}
        {isTracking && (
          <div className="bg-white/95 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progression</span>
              <span className="text-sm font-bold text-green-700">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Carte avec suivi en temps réel */}
        {isTracking && userPosition && hikeData.waypoints && (
          <div className="rounded-lg overflow-hidden border-2 border-white/30">
            <MapWithLiveTracking
              waypoints={hikeData.waypoints}
              userPosition={userPosition}
            />
          </div>
        )}

        {/* Contrôles */}
        <div className="flex gap-2">
          {!isTracking ? (
            <button
              onClick={startTracking}
              className="flex-1 bg-white text-green-700 px-6 py-3 rounded-lg font-bold hover:bg-green-50 transition flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Démarrer le guidage
            </button>
          ) : (
            <>
              {!isPaused ? (
                <button
                  onClick={pauseTracking}
                  className="flex-1 bg-yellow-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-yellow-600 transition flex items-center justify-center gap-2"
                >
                  <Pause className="w-5 h-5" />
                  Pause
                </button>
              ) : (
                <button
                  onClick={resumeTracking}
                  className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-600 transition flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Reprendre
                </button>
              )}
              <button
                onClick={stopTracking}
                className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-600 transition flex items-center justify-center gap-2"
              >
                <Square className="w-5 h-5" />
                Terminer
              </button>
            </>
          )}
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <h4 className="font-bold text-yellow-900">Badges débloqués</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {achievements.map((badge, index) => (
                <span key={index} className="bg-yellow-200 text-yellow-900 px-2 py-1 rounded text-xs font-medium">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
