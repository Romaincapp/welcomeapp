'use client'

import { MapPin, Clock, Wifi, Car, Info, Home, LogOut } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix pour les icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

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
  }
  onLogout: () => void
}

export default function SecureSectionContent({ data, onLogout }: SecureSectionContentProps) {
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
                Informations d'Arrivée
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">Accès sécurisé accordé</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">Verrouiller</span>
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
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Horaires</h3>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {data.check_in_time && (
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Check-in</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">{data.check_in_time}</p>
                </div>
              )}
              {data.check_out_time && (
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Check-out</p>
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
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">WiFi</h3>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {data.wifi_ssid && (
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Réseau</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-900 font-mono break-all">
                    {data.wifi_ssid}
                  </p>
                </div>
              )}
              {data.wifi_password && (
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Mot de passe</p>
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
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Parking</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line">{data.parking_info}</p>
          </div>
        )}

        {/* Instructions d'arrivée */}
        {data.arrival_instructions && (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="bg-green-100 p-1.5 sm:p-2 rounded-lg">
                <Info className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Instructions d'arrivée</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line">{data.arrival_instructions}</p>
          </div>
        )}

        {/* Informations additionnelles */}
        {data.additional_info && (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 lg:col-span-2">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="bg-indigo-100 p-1.5 sm:p-2 rounded-lg">
                <Info className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Informations complémentaires</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line">{data.additional_info}</p>
          </div>
        )}
      </div>

      {/* Carte avec localisation */}
      {data.property_address && (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 mt-4 sm:mt-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="bg-red-100 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Localisation du logement</h3>
              <p className="text-xs sm:text-sm text-gray-600 truncate">{data.property_address}</p>
            </div>
          </div>

          {data.property_coordinates_parsed && (
            <div className="h-[250px] sm:h-[300px] md:h-[400px] rounded-lg overflow-hidden border border-gray-200">
              <MapContainer
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
