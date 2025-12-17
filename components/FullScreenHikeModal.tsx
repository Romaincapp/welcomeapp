'use client'

import { useState, useEffect, useRef } from 'react'
import { X, ChevronUp, MapPin, Clock, TrendingUp, Play, Pause, Square, Route, Volume2, VolumeX, Download } from 'lucide-react'
import { TipWithDetails } from '@/types'
import { HikeData } from '@/types'
import dynamic from 'next/dynamic'
import Image from 'next/image'

const MapWithRoute = dynamic(() => import('./MapWithRoute'), { ssr: false })
const MapWithLiveTracking = dynamic(() => import('./MapWithLiveTracking'), { ssr: false })

interface FullScreenHikeModalProps {
  tip: TipWithDetails
  isOpen: boolean
  onClose: () => void
  themeColor?: string
}

interface UserPosition {
  lat: number
  lng: number
  accuracy: number
  speed: number | null
}

export default function FullScreenHikeModal({
  tip,
  isOpen,
  onClose,
  themeColor = '#4F46E5'
}: FullScreenHikeModalProps) {
  const [sheetHeight, setSheetHeight] = useState<'collapsed' | 'half' | 'full'>('collapsed')
  const [guidedMode, setGuidedMode] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [currentY, setCurrentY] = useState(0)

  // États pour le guidage GPS
  const [isTracking, setIsTracking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [distanceCovered, setDistanceCovered] = useState(0)
  const [voiceEnabled, setVoiceEnabled] = useState(false)

  const watchIdRef = useRef<number | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastAnnouncementRef = useRef<number>(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset quand le tip change
  useEffect(() => {
    setSheetHeight('collapsed')
    setGuidedMode(false)
    stopTracking()
  }, [tip?.id])

  // Calcul de la distance entre 2 points (Haversine)
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

  // Annonce vocale
  const speak = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'fr-FR'
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
  }

  // Démarrer le guidage
  const startTracking = () => {
    if (!navigator.geolocation) {
      alert('Géolocalisation non supportée par votre navigateur')
      return
    }

    const now = Date.now()
    setIsTracking(true)
    setIsPaused(false)
    setStartTime(now)
    setDistanceCovered(0)
    setElapsedTime(0)
    setSheetHeight('collapsed') // Auto-collapse quand on démarre
    speak('Guidage démarré. Bonne randonnée !')

    // Ref pour stocker la dernière position
    let lastPosition: UserPosition | null = null

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newPos: UserPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed
        }

        // Calculer distance parcourue depuis la dernière position
        if (lastPosition) {
          const dist = haversineDistance(
            lastPosition.lat,
            lastPosition.lng,
            newPos.lat,
            newPos.lng
          )
          // Ignorer les très petits déplacements (bruit GPS)
          if (dist > 0.005) { // 5 mètres minimum
            setDistanceCovered(prev => {
              const newDistance = prev + dist

              // Annonces vocales périodiques
              const currentTime = Date.now()
              if (currentTime - lastAnnouncementRef.current > 60000) {
                const hikeData = tip.hike_data as HikeData | null
                const totalDistance = hikeData?.distance || 1
                const progressPercent = Math.min(Math.round((newDistance / totalDistance) * 100), 100)
                speak(`Vous avez parcouru ${progressPercent} pourcent du parcours, soit ${newDistance.toFixed(1)} kilomètres`)
                lastAnnouncementRef.current = currentTime
              }

              return newDistance
            })
          }
        }

        lastPosition = newPos
        setUserPosition(newPos)
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

    // Chrono - utilise une ref pour avoir toujours la bonne valeur de startTime
    intervalRef.current = setInterval(() => {
      setElapsedTime(Date.now() - now)
    }, 1000)
  }

  // Pause
  const pauseTracking = () => {
    setIsPaused(true)
    // Arrêter le chrono
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    speak('Guidage en pause')
  }

  // Reprendre
  const resumeTracking = () => {
    setIsPaused(false)
    // Redémarrer le chrono en tenant compte du temps déjà écoulé
    if (startTime) {
      const pauseTime = elapsedTime
      const resumeTime = Date.now()
      intervalRef.current = setInterval(() => {
        setElapsedTime(pauseTime + (Date.now() - resumeTime))
      }, 1000)
    }
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
    setUserPosition(null)
    setDistanceCovered(0)
    setElapsedTime(0)
    speak('Guidage terminé. Félicitations !')
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

  // Gestion du drag
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartY(e.touches[0].clientY)
    setCurrentY(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    setCurrentY(e.touches[0].clientY)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    const deltaY = currentY - startY
    const threshold = 50

    if (Math.abs(deltaY) < threshold) return

    // Swipe down = collapse
    if (deltaY > 0) {
      if (sheetHeight === 'full') setSheetHeight('half')
      else if (sheetHeight === 'half') setSheetHeight('collapsed')
    }
    // Swipe up = expand
    else {
      if (sheetHeight === 'collapsed') setSheetHeight('half')
      else if (sheetHeight === 'half') setSheetHeight('full')
    }
  }

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

  // Vitesse moyenne
  const avgSpeed = elapsedTime > 0 ? (distanceCovered / (elapsedTime / 3600000)) : 0

  // Télécharger le GPX
  const downloadGPX = () => {
    if (!hikeData?.waypoints || hikeData.waypoints.length === 0) {
      alert('Aucune donnée GPS disponible')
      return
    }

    // Générer le contenu GPX
    const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="WelcomeApp" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${tip.title}</name>
    <desc>${tip.comment || ''}</desc>
  </metadata>
  <trk>
    <name>${tip.title}</name>
    <trkseg>
${hikeData.waypoints.map(wp => `      <trkpt lat="${wp.lat}" lon="${wp.lng}">
        ${wp.elevation !== undefined ? `<ele>${wp.elevation}</ele>` : ''}
        ${wp.name ? `<name>${wp.name}</name>` : ''}
      </trkpt>`).join('\n')}
    </trkseg>
  </trk>
</gpx>`

    // Créer un blob et déclencher le téléchargement
    const blob = new Blob([gpxContent], { type: 'application/gpx+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${tip.title.replace(/[^a-z0-9]/gi, '_')}.gpx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!isOpen || !tip) return null

  const hikeData = tip.hike_data as HikeData | null
  const hasWaypoints = hikeData?.waypoints && hikeData.waypoints.length > 0

  const difficultyConfig = {
    facile: { color: 'text-green-600', bg: 'bg-green-100', label: 'Facile', icon: '🟢' },
    moyen: { color: 'text-orange-600', bg: 'bg-orange-100', label: 'Moyen', icon: '🟠' },
    difficile: { color: 'text-red-600', bg: 'bg-red-100', label: 'Difficile', icon: '🔴' },
  }

  const difficulty = hikeData?.difficulty ? difficultyConfig[hikeData.difficulty] : null

  // Hauteur du bottom sheet selon l'état
  const getSheetHeight = () => {
    if (sheetHeight === 'collapsed') return '120px' // Ultra compact pour voir la carte
    if (sheetHeight === 'half') return '50vh'
    return '90vh'
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-900">
      {/* Bouton fermer fixe */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-30 p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Bouton audio flottant en haut à droite (mode guidage uniquement) */}
      {isTracking && (
        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className="absolute top-4 left-4 z-30 p-2 bg-white/95 backdrop-blur-sm hover:bg-white rounded-full transition shadow-lg"
        >
          {voiceEnabled ? <Volume2 className="w-5 h-5 text-gray-700" /> : <VolumeX className="w-5 h-5 text-gray-700" />}
        </button>
      )}

      {/* Carte plein écran en arrière-plan */}
      <div className="absolute inset-0">
        {hasWaypoints && hikeData.waypoints ? (
          isTracking && userPosition ? (
            <MapWithLiveTracking
              waypoints={hikeData.waypoints}
              userPosition={userPosition}
            />
          ) : (
            <MapWithRoute waypoints={hikeData.waypoints} />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
            <p className="text-white/60">Aucune carte disponible</p>
          </div>
        )}
      </div>

      {/* Bottom Sheet draggable - toujours visible */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-all duration-300 ease-out overflow-hidden z-20"
        style={{
          height: getSheetHeight(),
          maxHeight: '90vh'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle de drag */}
        <div className="w-full flex justify-center py-2 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Contenu scrollable */}
        <div className="h-full overflow-y-auto pb-6">
          {/* Header avec titre et bouton expand */}
          <div className={`px-4 ${sheetHeight === 'collapsed' ? 'pb-2' : 'pb-4'}`}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h2 className={`font-bold text-gray-900 line-clamp-1 ${sheetHeight === 'collapsed' ? 'text-base' : 'text-xl'}`}>{tip.title}</h2>
                {tip.category && sheetHeight !== 'collapsed' && (
                  <p className="text-sm text-gray-500 mt-1">{tip.category.name}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                {/* Bouton télécharger GPX */}
                {hasWaypoints && sheetHeight !== 'collapsed' && (
                  <button
                    onClick={downloadGPX}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition flex-shrink-0"
                    title="Télécharger le parcours GPX"
                  >
                    <Download className="w-4 h-4 text-gray-600" />
                  </button>
                )}
                <button
                  onClick={() => setSheetHeight(sheetHeight === 'full' ? 'collapsed' : 'full')}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition flex-shrink-0"
                >
                  <ChevronUp className={`w-4 h-4 text-gray-600 transition-transform ${sheetHeight === 'full' ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Carrousel de photos - style Google Maps */}
            {tip.media && tip.media.length > 0 && sheetHeight !== 'collapsed' && (
              <div className="mb-3 -mx-4">
                <div
                  className="flex gap-2 overflow-x-auto px-4 pb-2 snap-x snap-mandatory"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  {tip.media.map((media, index) => (
                    <div
                      key={media.id || index}
                      className="flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden snap-start"
                    >
                      {media.type === 'image' ? (
                        <Image
                          src={media.url}
                          alt={`Photo ${index + 1}`}
                          width={128}
                          height={96}
                          className="w-full h-full object-cover"
                          unoptimized={media.url.includes('googleapis.com') || media.url.includes('googleusercontent.com')}
                        />
                      ) : (
                        <video
                          src={media.url}
                          className="w-full h-full object-cover"
                          muted
                          preload="none"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats GPS en temps réel si en mode guidage */}
            {isTracking ? (
              <div className={sheetHeight === 'collapsed' ? 'space-y-1.5' : 'space-y-3'}>
                <div className="grid grid-cols-3 gap-2">
                  <div className={`bg-green-50 rounded-lg text-center ${sheetHeight === 'collapsed' ? 'p-1.5' : 'p-2'}`}>
                    <p className={`text-gray-600 font-medium ${sheetHeight === 'collapsed' ? 'text-[10px] mb-0' : 'text-xs mb-1'}`}>Temps</p>
                    <p className={`font-bold text-green-700 ${sheetHeight === 'collapsed' ? 'text-sm' : 'text-base'}`}>{formatTime(elapsedTime)}</p>
                  </div>
                  <div className={`bg-blue-50 rounded-lg text-center ${sheetHeight === 'collapsed' ? 'p-1.5' : 'p-2'}`}>
                    <p className={`text-gray-600 font-medium ${sheetHeight === 'collapsed' ? 'text-[10px] mb-0' : 'text-xs mb-1'}`}>Distance</p>
                    <p className={`font-bold text-blue-700 ${sheetHeight === 'collapsed' ? 'text-sm' : 'text-base'}`}>{distanceCovered.toFixed(2)} km</p>
                  </div>
                  <div className={`bg-orange-50 rounded-lg text-center ${sheetHeight === 'collapsed' ? 'p-1.5' : 'p-2'}`}>
                    <p className={`text-gray-600 font-medium ${sheetHeight === 'collapsed' ? 'text-[10px] mb-0' : 'text-xs mb-1'}`}>Vitesse</p>
                    <p className={`font-bold text-orange-700 ${sheetHeight === 'collapsed' ? 'text-sm' : 'text-base'}`}>{avgSpeed.toFixed(1)} km/h</p>
                  </div>
                </div>

                {/* Contrôles du guidage - cachés en mode collapsed */}
                {sheetHeight !== 'collapsed' && (
                  <div className="flex gap-2">
                    {!isPaused ? (
                      <button
                        onClick={pauseTracking}
                        className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2"
                      >
                        <Pause className="w-4 h-4" />
                        Pause
                      </button>
                    ) : (
                      <button
                        onClick={resumeTracking}
                        className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Reprendre
                      </button>
                    )}
                    <button
                      onClick={stopTracking}
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2"
                    >
                      <Square className="w-4 h-4" />
                      Terminer
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Stats compactes en mode visualisation */}
                {hikeData && sheetHeight !== 'collapsed' && (
                  <div className="flex items-center gap-4 text-sm flex-wrap">
                    {hikeData.distance && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-gray-900">{hikeData.distance} km</span>
                      </div>
                    )}
                    {hikeData.duration && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span className="font-semibold text-gray-900">
                          {Math.floor(hikeData.duration / 60)}h{hikeData.duration % 60 > 0 ? (hikeData.duration % 60).toString().padStart(2, '0') : ''}
                        </span>
                      </div>
                    )}
                    {hikeData.elevation_gain && (
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-orange-600" />
                        <span className="font-semibold text-gray-900">{hikeData.elevation_gain} m D+</span>
                      </div>
                    )}
                    {difficulty && (
                      <div className="flex items-center gap-1.5">
                        <span>{difficulty.icon}</span>
                        <span className={`font-semibold ${difficulty.color}`}>{difficulty.label}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Bouton Lancer le guidage GPS - caché en mode collapsed */}
                {sheetHeight !== 'collapsed' && (
                  <button
                    onClick={startTracking}
                    className="w-full mt-4 bg-gray-900 text-white rounded-lg px-6 py-3 font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Lancer le guidage GPS
                  </button>
                )}
              </>
            )}
          </div>

          {/* Description */}
          {tip.comment && (
            <div className="px-4 pb-4">
              <h3 className="font-bold text-lg mb-2" style={{ color: themeColor }}>
                Description
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">{tip.comment}</p>
            </div>
          )}

          {/* Instructions */}
          {hikeData?.instructions && hikeData.instructions.length > 0 && (
            <div className="px-4 pb-4">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2" style={{ color: themeColor }}>
                <Route className="w-5 h-5" />
                Instructions ({hikeData.instructions.length} étapes)
              </h3>
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

          {/* Informations pratiques */}
          {(tip.location || tip.contact_phone || tip.contact_email) && (
            <div className="px-4 pb-4">
              <h3 className="font-bold text-lg mb-3" style={{ color: themeColor }}>
                Informations pratiques
              </h3>
              <div className="space-y-2 text-sm">
                {tip.location && (
                  <p className="text-gray-700">📍 {tip.location}</p>
                )}
                {tip.contact_phone && (
                  <p className="text-gray-700">📞 {tip.contact_phone}</p>
                )}
                {tip.contact_email && (
                  <p className="text-gray-700">✉️ {tip.contact_email}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
