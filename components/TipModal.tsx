'use client'

import { useState } from 'react'
import Image from 'next/image'
import { TipWithDetails, OpeningHours } from '@/types'
import { X, ChevronLeft, ChevronRight, MapPin, Phone, Mail, Globe, Clock, Tag } from 'lucide-react'

interface TipModalProps {
  tip: TipWithDetails | null
  isOpen: boolean
  onClose: () => void
}

export default function TipModal({ tip, isOpen, onClose }: TipModalProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)

  if (!isOpen || !tip) return null

  const sortedMedia = tip.media.sort((a, b) => a.order - b.order)
  const openingHours = tip.opening_hours_parsed

  const nextMedia = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % sortedMedia.length)
  }

  const prevMedia = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + sortedMedia.length) % sortedMedia.length)
  }

  const daysOfWeek = [
    { key: 'monday', label: 'Lundi' },
    { key: 'tuesday', label: 'Mardi' },
    { key: 'wednesday', label: 'Mercredi' },
    { key: 'thursday', label: 'Jeudi' },
    { key: 'friday', label: 'Vendredi' },
    { key: 'saturday', label: 'Samedi' },
    { key: 'sunday', label: 'Dimanche' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Carrousel de médias */}
          {sortedMedia.length > 0 ? (
            <div className="relative h-96 bg-gray-200">
              {sortedMedia[currentMediaIndex].type === 'image' ? (
                <Image
                  src={sortedMedia[currentMediaIndex].url}
                  alt={tip.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <video
                  src={sortedMedia[currentMediaIndex].url}
                  controls
                  className="w-full h-full object-cover"
                />
              )}

              {sortedMedia.length > 1 && (
                <>
                  <button
                    onClick={prevMedia}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextMedia}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {sortedMedia.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentMediaIndex(index)}
                        className={`w-2 h-2 rounded-full transition ${
                          index === currentMediaIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="h-96 bg-gray-200 flex items-center justify-center text-gray-400">
              Aucun média disponible
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-384px)]">
          {/* Titre et catégorie */}
          <div className="mb-6">
            {tip.category && (
              <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm font-semibold mb-3">
                {tip.category.icon && <span>{tip.category.icon}</span>}
                <span>{tip.category.name}</span>
              </div>
            )}
            <h2 className="text-3xl font-bold mb-3">{tip.title}</h2>
            {tip.comment && <p className="text-gray-600 text-lg">{tip.comment}</p>}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Informations de contact */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Contact</h3>
              <div className="space-y-3">
                {tip.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Adresse</p>
                      <p className="text-gray-600">{tip.location}</p>
                    </div>
                  </div>
                )}
                {tip.contact_phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Téléphone</p>
                      <a
                        href={`tel:${tip.contact_phone}`}
                        className="text-indigo-600 hover:underline"
                      >
                        {tip.contact_phone}
                      </a>
                    </div>
                  </div>
                )}
                {tip.contact_email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a
                        href={`mailto:${tip.contact_email}`}
                        className="text-indigo-600 hover:underline"
                      >
                        {tip.contact_email}
                      </a>
                    </div>
                  </div>
                )}
                {tip.route_url && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Site web</p>
                      <a
                        href={tip.route_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        Visiter le site
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Horaires d'ouverture */}
            {openingHours && (
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Horaires
                </h3>
                <div className="space-y-2">
                  {daysOfWeek.map(({ key, label }) => {
                    const hours = openingHours[key as keyof OpeningHours]
                    return (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium">{label}</span>
                        <span className="text-gray-600">{hours || 'Fermé'}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Code promo */}
          {tip.promo_code && (
            <div className="mt-6 p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Code promo exclusif !</h3>
              </div>
              <p className="text-2xl font-bold font-mono">{tip.promo_code}</p>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="mt-6 flex flex-wrap gap-3">
            {tip.coordinates_parsed && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${tip.coordinates_parsed.lat},${tip.coordinates_parsed.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
              >
                <MapPin className="w-5 h-5" />
                Itinéraire
              </a>
            )}
            {tip.route_url && (
              <a
                href={tip.route_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
              >
                <Globe className="w-5 h-5" />
                Site web
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
