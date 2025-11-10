'use client'

import { useState, useEffect, useRef, useId } from 'react'
import { MapPin, Clock, Wifi, Car, Info, Home, LogOut, Image as ImageIcon } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { type Locale } from '@/i18n/request'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import Image from 'next/image'
import { SecurePhoto } from '@/types'

interface SecureSectionContentProps {
  data: {
    check_in_time?: string | null
    check_out_time?: string | null
    arrival_instructions?: string | null
    property_address?: string | null
    property_coordinates_parsed?: { lat: number; lng: number } | null
    wifi_ssid?: string | null
    wifi_password?: string | null
    parking_info?: string | null
    additional_info?: string | null
    photos_parsed?: SecurePhoto[] | null
  }
  onLogout: () => void
  locale?: Locale
}

export default function SecureSectionContent({ data, onLogout, locale = 'fr' }: SecureSectionContentProps) {
  // Protection SSR pour react-leaflet (pattern MapPicker)
  const [mounted, setMounted] = useState(false)
  const mapKey = useId()

  useEffect(() => {
    // Config Leaflet uniquement côté client
    if (typeof window !== 'undefined') {
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })
    }
    setMounted(true)
  }, [])

  // 🌍 Traduction des labels
  const { translated: tArrivalInfo } = useClientTranslation("Informations d'Arrivée", 'fr', locale)
  const { translated: tAccessGranted } = useClientTranslation('Accès sécurisé accordé', 'fr', locale)
  const { translated: tLock } = useClientTranslation('Verrouiller', 'fr', locale)
  const { translated: tSchedules } = useClientTranslation('Horaires', 'fr', locale)
  const { translated: tCheckIn } = useClientTranslation('Check-in', 'fr', locale)
  const { translated: tCheckOut } = useClientTranslation('Check-out', 'fr', locale)
  const { translated: tWifi } = useClientTranslation('WiFi', 'fr', locale)
  const { translated: tNetwork } = useClientTranslation('Réseau', 'fr', locale)
  const { translated: tPassword } = useClientTranslation('Mot de passe', 'fr', locale)
  const { translated: tParking } = useClientTranslation('Parking', 'fr', locale)
  const { translated: tArrivalInstructions } = useClientTranslation("Instructions d'arrivée", 'fr', locale)
  const { translated: tAdditionalInfo } = useClientTranslation('Informations complémentaires', 'fr', locale)
  const { translated: tPropertyLocation } = useClientTranslation('Localisation du logement', 'fr', locale)

  // ✅ TRADUIRE le contenu texte (sauf WiFi/adresse/email qui sont des données brutes)
  const { translated: translatedArrivalInstructions } = useClientTranslation(data.arrival_instructions || '', 'fr', locale)
  const { translated: translatedParkingInfo } = useClientTranslation(data.parking_info || '', 'fr', locale)
  const { translated: translatedAdditionalInfo } = useClientTranslation(data.additional_info || '', 'fr', locale)
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header avec bouton de déconnexion */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="bg-green-100 p-2 sm:p-3 rounded-full flex-shrink-0">
              <Home className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-xl font-bold text-gray-900 truncate">
                {tArrivalInfo}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">{tAccessGranted}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">{tLock}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {/* Check-in / Check-out */}
        {(data.check_in_time || data.check_out_time) && (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">{tSchedules}</h3>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {data.check_in_time && (
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">{tCheckIn}</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">{data.check_in_time}</p>
                </div>
              )}
              {data.check_out_time && (
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">{tCheckOut}</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">{data.check_out_time}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* WiFi */}
        {(data.wifi_ssid || data.wifi_password) && (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="bg-purple-100 p-1.5 sm:p-2 rounded-lg">
                <Wifi className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">{tWifi}</h3>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {data.wifi_ssid && (
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">{tNetwork}</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-900 font-mono break-all">
                    {data.wifi_ssid}
                  </p>
                </div>
              )}
              {data.wifi_password && (
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">{tPassword}</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-900 font-mono break-all">
                    {data.wifi_password}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Parking */}
        {data.parking_info && (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="bg-orange-100 p-1.5 sm:p-2 rounded-lg">
                <Car className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">{tParking}</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line">{translatedParkingInfo}</p>
          </div>
        )}

        {/* Instructions d'arrivée */}
        {data.arrival_instructions && (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="bg-green-100 p-1.5 sm:p-2 rounded-lg">
                <Info className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">{tArrivalInstructions}</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line">{translatedArrivalInstructions}</p>
          </div>
        )}

        {/* Informations additionnelles */}
        {data.additional_info && (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 lg:col-span-2">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="bg-indigo-100 p-1.5 sm:p-2 rounded-lg">
                <Info className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">{tAdditionalInfo}</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line">{translatedAdditionalInfo}</p>
          </div>
        )}
      </div>

      {/* Photos sécurisées */}
      {data.photos_parsed && data.photos_parsed.length > 0 && (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 mt-4 sm:mt-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="bg-pink-100 p-1.5 sm:p-2 rounded-lg">
              <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-pink-600" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Photos du logement</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {data.photos_parsed.map((photo, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={photo.url}
                  alt={photo.caption || `Photo ${index + 1}`}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Carte avec localisation */}
      {data.property_address && (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 mt-4 sm:mt-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="bg-red-100 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">{tPropertyLocation}</h3>
              <p className="text-xs sm:text-sm text-gray-600 truncate">{data.property_address}</p>
            </div>
          </div>

          {data.property_coordinates_parsed && (
            <div className="h-[250px] sm:h-[300px] md:h-[400px] rounded-lg overflow-hidden border border-gray-200">
              {mounted ? (
                <MapContainer
                  key={mapKey}
                  center={[
                    data.property_coordinates_parsed.lat,
                    data.property_coordinates_parsed.lng,
                  ]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker
                    position={[
                      data.property_coordinates_parsed.lat,
                      data.property_coordinates_parsed.lng,
                    ]}
                  >
                    <Popup>
                      <div className="text-center">
                        <p className="font-semibold">Votre logement</p>
                        <p className="text-sm text-gray-600">{data.property_address}</p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-500 text-sm">Chargement de la carte...</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-3 sm:mt-4">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                data.property_address
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium text-sm sm:text-base"
            >
              <MapPin className="h-4 w-4" />
              Ouvrir dans Google Maps
            </a>
          </div>
        </div>
      )}

      {/* Note de sécurité */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 mt-4 sm:mt-6">
        <p className="text-xs sm:text-sm text-amber-800">
          <strong>Note :</strong> Ces informations sont confidentielles et réservées aux
          personnes ayant une réservation confirmée. Ne les partagez pas publiquement.
        </p>
      </div>
    </div>
  )
}
