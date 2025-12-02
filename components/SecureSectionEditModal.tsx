'use client'

import { useState, useEffect } from 'react'
import { X, Lock, Eye, EyeOff, MapPin, AlertTriangle, Image as ImageIcon, Trash2, Save, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ClientWithDetails, Coordinates, SecurePhoto } from '@/types'
import { getSecureSection, upsertSecureSection, deleteSecureSection } from '@/lib/actions/secure-section'
import dynamic from 'next/dynamic'
import Image from 'next/image'

const MapPicker = dynamic(
  () => import('./MapPicker'),
  { ssr: false }
)

const AddressAutocomplete = dynamic(
  () => import('./AddressAutocomplete'),
  { ssr: false }
)

interface SecureSectionEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  client: ClientWithDetails
}

export default function SecureSectionEditModal({
  isOpen,
  onClose,
  onSuccess,
  client,
}: SecureSectionEditModalProps) {
  const [loading, setLoading] = useState(false)

  // Secure section state
  const [secureAccessCode, setSecureAccessCode] = useState('')
  const [showSecureCode, setShowSecureCode] = useState(false)
  const [secureCheckIn, setSecureCheckIn] = useState('')
  const [secureCheckOut, setSecureCheckOut] = useState('')
  const [secureArrivalInstructions, setSecureArrivalInstructions] = useState('')
  const [securePropertyAddress, setSecurePropertyAddress] = useState('')
  const [securePropertyCoordinates, setSecurePropertyCoordinates] = useState<Coordinates | null>(null)
  const [secureWifiSsid, setSecureWifiSsid] = useState('')
  const [secureWifiPassword, setSecureWifiPassword] = useState('')
  const [secureParkingInfo, setSecureParkingInfo] = useState('')
  const [secureAdditionalInfo, setSecureAdditionalInfo] = useState('')
  const [securePhotos, setSecurePhotos] = useState<SecurePhoto[]>([])
  const [hasExistingSecureSection, setHasExistingSecureSection] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [uploadingSecurePhoto, setUploadingSecurePhoto] = useState(false)

  const supabase = createClient()

  // Load secure section data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSecureSection()
    }
  }, [isOpen])

  const loadSecureSection = async () => {
    try {
      const data = await getSecureSection(client.id)
      if (data) {
        setHasExistingSecureSection(true)
        setSecureCheckIn(data.check_in_time || '')
        setSecureCheckOut(data.check_out_time || '')
        setSecureArrivalInstructions(data.arrival_instructions || '')
        setSecurePropertyAddress(data.property_address || '')
        setSecureWifiSsid(data.wifi_ssid || '')
        setSecureWifiPassword(data.wifi_password || '')
        setSecureParkingInfo(data.parking_info || '')
        setSecureAdditionalInfo(data.additional_info || '')

        // Parse coordinates
        if (data.property_coordinates) {
          try {
            const coords = typeof data.property_coordinates === 'string'
              ? JSON.parse(data.property_coordinates)
              : data.property_coordinates
            setSecurePropertyCoordinates(coords)
          } catch (e) {
            console.error('Error parsing coordinates:', e)
          }
        }

        // Parse photos
        if (data.photos) {
          try {
            const photos = typeof data.photos === 'string'
              ? JSON.parse(data.photos)
              : data.photos
            setSecurePhotos(Array.isArray(photos) ? photos : [])
          } catch (e) {
            console.error('Error parsing photos:', e)
            setSecurePhotos([])
          }
        }
      }
    } catch (error) {
      console.error('Error loading secure section:', error)
    }
  }

  const handleUseCurrentLocation = async () => {
    setIsLoadingLocation(true)

    try {
      console.log('[GEOLOCATION] Demande de permission...')

      // 1. Obtenir la position GPS
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        })
      })

      const lat = position.coords.latitude
      const lng = position.coords.longitude

      console.log('[GEOLOCATION] Position obtenue:', { lat, lng })

      // 2. Reverse geocoding via notre API
      const response = await fetch(`/api/places/reverse-geocode?lat=${lat}&lng=${lng}`)
      if (!response.ok) {
        throw new Error('Erreur lors du reverse geocoding')
      }

      const data = await response.json()
      console.log('[GEOLOCATION] Adresse trouvée:', data.address)

      // 3. Remplir les champs
      setSecurePropertyAddress(data.address)
      setSecurePropertyCoordinates({ lat, lng })

      alert('✅ Adresse détectée avec succès !')
    } catch (error: unknown) {
      console.error('[GEOLOCATION] Erreur:', error)

      let errorMessage = 'Erreur de géolocalisation'

      if (error && typeof error === 'object' && 'code' in error) {
        const geoError = error as GeolocationPositionError
        if (geoError.code === 1) {
          errorMessage = 'Permission de géolocalisation refusée. Veuillez autoriser l\'accès à votre position dans les paramètres de votre navigateur.'
        } else if (geoError.code === 2) {
          errorMessage = 'Position indisponible. Vérifiez que le GPS est activé.'
        } else if (geoError.code === 3) {
          errorMessage = 'Délai dépassé. Réessayez.'
        }
      } else if (error instanceof Error && error.message) {
        errorMessage = error.message
      }

      alert(`❌ ${errorMessage}`)
    } finally {
      setIsLoadingLocation(false)
    }
  }

  const handleSecurePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingSecurePhoto(true)

    try {
      const uploadedPhotos: SecurePhoto[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${client.slug}/secure/${Date.now()}-${i}.${fileExt}`

        const { error } = await supabase.storage
          .from('media')
          .upload(fileName, file)

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(fileName)

        uploadedPhotos.push({ url: publicUrl, caption: '' })
      }

      setSecurePhotos([...securePhotos, ...uploadedPhotos])
    } catch (error) {
      console.error('Error uploading secure photos:', error)
      alert('Erreur lors de l\'upload des photos')
    } finally {
      setUploadingSecurePhoto(false)
    }
  }

  const handleSecurePhotoDelete = async (index: number) => {
    const photo = securePhotos[index]

    try {
      // Supprimer du storage
      const filePath = photo.url.split('/storage/v1/object/public/media/')[1]
      if (filePath) {
        await supabase.storage.from('media').remove([filePath])
      }

      // Supprimer du state
      setSecurePhotos(securePhotos.filter((_, i) => i !== index))
    } catch (error) {
      console.error('Error deleting secure photo:', error)
      alert('Erreur lors de la suppression de la photo')
    }
  }

  const handleAddPhotoFromUrl = () => {
    const url = prompt('Entrez l\'URL de la photo :')
    if (!url) return

    const caption = prompt('Légende (optionnel) :') || ''
    setSecurePhotos([...securePhotos, { url, caption }])
  }

  const handleSaveSecureSection = async () => {
    try {
      setLoading(true)

      if (!secureAccessCode && !hasExistingSecureSection) {
        alert('Veuillez définir un code d\'accès')
        setLoading(false)
        return
      }

      const result = await upsertSecureSection(
        client.id,
        secureAccessCode || 'UNCHANGED', // Si pas de nouveau code et section existe, on ne change pas le hash
        {
          checkInTime: secureCheckIn,
          checkOutTime: secureCheckOut,
          arrivalInstructions: secureArrivalInstructions,
          propertyAddress: securePropertyAddress,
          propertyCoordinates: securePropertyCoordinates || undefined,
          wifiSsid: secureWifiSsid,
          wifiPassword: secureWifiPassword,
          parkingInfo: secureParkingInfo,
          additionalInfo: secureAdditionalInfo,
          photos: securePhotos,
        }
      )

      if (result.success) {
        onSuccess()
        onClose()
        setSecureAccessCode('') // Reset code input
      } else {
        alert(result.message || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Error saving secure section:', error)
      alert('Erreur lors de la sauvegarde de la section sécurisée')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSecureSection = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer la section sécurisée ? Cette action est irréversible.')) {
      return
    }

    try {
      setLoading(true)
      const result = await deleteSecureSection(client.id)

      if (result.success) {
        // Reset all fields
        setSecureAccessCode('')
        setSecureCheckIn('')
        setSecureCheckOut('')
        setSecureArrivalInstructions('')
        setSecurePropertyAddress('')
        setSecurePropertyCoordinates(null)
        setSecureWifiSsid('')
        setSecureWifiPassword('')
        setSecureParkingInfo('')
        setSecureAdditionalInfo('')
        setSecurePhotos([])
        setHasExistingSecureSection(false)
        onSuccess()
        onClose()
      } else {
        alert(result.message || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting secure section:', error)
      alert('Erreur lors de la suppression de la section sécurisée')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Lock className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Zone sensible</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-6">
            {/* Warning simplifié */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">Informations sensibles</p>
                <p className="text-sm text-amber-800 mt-1">
                  Partagez le code d'accès uniquement avec vos voyageurs confirmés.
                </p>
              </div>
            </div>

            {/* Access Code */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h4 className="font-semibold text-indigo-900 mb-3">Code d'accès</h4>
              <p className="text-sm text-indigo-800 mb-3">
                Définissez un code que vos voyageurs devront entrer pour accéder aux informations sensibles.
              </p>
              <div className="relative">
                <input
                  type={showSecureCode ? 'text' : 'password'}
                  value={secureAccessCode}
                  onChange={(e) => setSecureAccessCode(e.target.value)}
                  className="w-full px-4 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900"
                  placeholder={hasExistingSecureSection ? "Nouveau code (laissez vide pour ne pas changer)" : "Définissez un code d'accès"}
                />
                <button
                  type="button"
                  onClick={() => setShowSecureCode(!showSecureCode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-800"
                >
                  {showSecureCode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {hasExistingSecureSection && (
                <p className="text-xs text-indigo-700 mt-2">
                  Un code existe déjà. Laissez ce champ vide pour conserver le code actuel.
                </p>
              )}
            </div>

            {/* Check-in / Check-out */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-in
                </label>
                <input
                  type="text"
                  value={secureCheckIn}
                  onChange={(e) => setSecureCheckIn(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                  placeholder="15:00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-out
                </label>
                <input
                  type="text"
                  value={secureCheckOut}
                  onChange={(e) => setSecureCheckOut(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                  placeholder="11:00"
                />
              </div>
            </div>

            {/* Localisation unifiée avec MapPicker + bouton GPS */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-indigo-600" />
                  Adresse du logement
                </label>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isLoadingLocation}
                  className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <MapPin size={16} />
                  {isLoadingLocation ? 'GPS...' : 'Ma position'}
                </button>
              </div>
              <AddressAutocomplete
                value={securePropertyAddress}
                onChange={(address) => setSecurePropertyAddress(address)}
                onLocationSelected={(lat, lng, address) => {
                  setSecurePropertyAddress(address)
                  setSecurePropertyCoordinates({ lat, lng })
                }}
                placeholder="Recherchez une adresse (ex: carrer pintor sorolla 24 calp)..."
              />

              {/* Séparateur visuel */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-gray-500">ou ajustez sur la carte</span>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <MapPicker
                  initialLat={securePropertyCoordinates?.lat}
                  initialLng={securePropertyCoordinates?.lng}
                  showSearch={false}
                  onLocationSelect={(lat, lng) => {
                    if (lat === 0 && lng === 0) {
                      setSecurePropertyCoordinates(null)
                    } else {
                      setSecurePropertyCoordinates({ lat, lng })
                    }
                  }}
                  onAddressFound={(address) => {
                    setSecurePropertyAddress(address)
                  }}
                />
              </div>
            </div>

            {/* WiFi */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Informations WiFi</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du réseau (SSID)
                </label>
                <input
                  type="text"
                  value={secureWifiSsid}
                  onChange={(e) => setSecureWifiSsid(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                  placeholder="MonWiFi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe WiFi
                </label>
                <input
                  type="text"
                  value={secureWifiPassword}
                  onChange={(e) => setSecureWifiPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Parking Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Informations parking
              </label>
              <textarea
                value={secureParkingInfo}
                onChange={(e) => setSecureParkingInfo(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                placeholder="Place de parking n°5 dans le garage souterrain, code d'accès: 1234"
              />
            </div>

            {/* Arrival Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructions d'arrivée
              </label>
              <textarea
                value={secureArrivalInstructions}
                onChange={(e) => setSecureArrivalInstructions(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                placeholder="À votre arrivée, prenez l'escalier à droite. La clé se trouve dans la boîte à clés (code: 5678)"
              />
            </div>

            {/* Additional Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Informations complémentaires
              </label>
              <textarea
                value={secureAdditionalInfo}
                onChange={(e) => setSecureAdditionalInfo(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                placeholder="Toute autre information utile..."
              />
            </div>

            {/* Photos sécurisées */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-indigo-600" />
                Photos sécurisées
              </label>
              <p className="text-xs text-gray-600 mb-3">
                Ces photos ne seront visibles qu'après saisie du code d'accès
              </p>

              {/* Galerie de photos en mode compact */}
              {securePhotos.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                  {securePhotos.map((photo, index) => (
                    <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={photo.url}
                        alt={photo.caption || `Photo ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 33vw, 25vw"
                      />
                      <button
                        type="button"
                        onClick={() => handleSecurePhotoDelete(index)}
                        className="absolute top-1 right-1 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Boutons d'ajout compacts */}
              <div className="flex gap-2">
                <label className="flex-1">
                  <div className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg cursor-pointer transition text-center">
                    {uploadingSecurePhoto ? 'Upload...' : '📁 Fichiers'}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleSecurePhotoUpload}
                    className="hidden"
                    disabled={uploadingSecurePhoto}
                  />
                </label>
                <button
                  type="button"
                  onClick={handleAddPhotoFromUrl}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition"
                >
                  🔗 Lien
                </button>
              </div>
            </div>

            {/* Delete button if exists */}
            {hasExistingSecureSection && (
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleDeleteSecureSection}
                  disabled={loading}
                  className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  Supprimer la section sécurisée
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 sm:p-6 border-t border-gray-200 flex items-center justify-end gap-2 sm:gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-semibold transition disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSaveSecureSection}
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
