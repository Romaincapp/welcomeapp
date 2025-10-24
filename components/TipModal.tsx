'use client'

import { useState } from 'react'
import Image from 'next/image'
import { TipWithDetails, OpeningHours } from '@/types'
import { X, ChevronLeft, ChevronRight, MapPin, Phone, Mail, Globe, Clock, Tag, Star, User } from 'lucide-react'
import { type Locale } from '@/i18n/request'
import { getTranslatedField } from '@/lib/i18n-helpers'

interface TipModalProps {
  tip: TipWithDetails | null
  isOpen: boolean
  onClose: () => void
  themeColor?: string
  locale?: Locale
}

export default function TipModal({ tip, isOpen, onClose, themeColor = '#4F46E5', locale = 'fr' }: TipModalProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)

  if (!isOpen || !tip) return null

  const sortedMedia = tip.media.sort((a, b) => a.order - b.order)
  const openingHours = tip.opening_hours_parsed

  // Récupérer les textes traduits
  const title = getTranslatedField(tip, 'title', locale)
  const comment = getTranslatedField(tip, 'comment', locale)

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black bg-opacity-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition active:scale-95"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: themeColor }} />
          </button>

          {/* Carrousel de médias */}
          {sortedMedia.length > 0 ? (
            <div className="relative h-56 sm:h-80 md:h-96 bg-gray-200">
              {sortedMedia[currentMediaIndex].type === 'image' ? (
                <Image
                  src={sortedMedia[currentMediaIndex].url}
                  alt={title}
                  fill
                  className="object-cover"
                  quality={75}
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 640px, (max-width: 1024px) 768px, 896px"
                  priority={currentMediaIndex === 0}
                />
              ) : (
                <video
                  src={sortedMedia[currentMediaIndex].url}
                  controls
                  className="w-full h-full object-cover"
                  preload="metadata"
                />
              )}

              {sortedMedia.length > 1 && (
                <>
                  <button
                    onClick={prevMedia}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white p-1.5 sm:p-2 rounded-full shadow-lg hover:bg-gray-100 transition active:scale-95"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: themeColor }} />
                  </button>
                  <button
                    onClick={nextMedia}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white p-1.5 sm:p-2 rounded-full shadow-lg hover:bg-gray-100 transition active:scale-95"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: themeColor }} />
                  </button>
                  <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
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
            <div className="h-56 sm:h-80 md:h-96 bg-gray-200 flex items-center justify-center text-gray-400">
              Aucun média disponible
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-224px)] sm:max-h-[calc(90vh-320px)] md:max-h-[calc(90vh-384px)]">
          {/* Titre et catégorie */}
          <div className="mb-4 sm:mb-6">
            {tip.category && (
              <div
                className="inline-flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold mb-2 sm:mb-3"
                style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
              >
                {tip.category.icon && <span>{tip.category.icon}</span>}
                <span>{tip.category ? getTranslatedField(tip.category, 'name', locale) : ''}</span>
              </div>
            )}
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3" style={{ color: themeColor }}>{title}</h2>
            {comment && <p className="text-gray-600 text-base sm:text-lg">{comment}</p>}
          </div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            {/* Informations de contact */}
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4" style={{ color: themeColor }}>Contact</h3>
              <div className="space-y-2.5 sm:space-y-3">
                {tip.location && (
                  <div className="flex items-start gap-2 sm:gap-3">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" style={{ color: themeColor }} />
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base">Adresse</p>
                      <p className="text-gray-600 text-sm sm:text-base break-words">{tip.location}</p>
                    </div>
                  </div>
                )}
                {tip.contact_phone && (
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" style={{ color: themeColor }} />
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base">Téléphone</p>
                      <a
                        href={`tel:${tip.contact_phone}`}
                        className="hover:underline text-sm sm:text-base break-all"
                        style={{ color: themeColor }}
                      >
                        {tip.contact_phone}
                      </a>
                    </div>
                  </div>
                )}
                {tip.contact_email && (
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" style={{ color: themeColor }} />
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base">Email</p>
                      <a
                        href={`mailto:${tip.contact_email}`}
                        className="hover:underline text-sm sm:text-base break-all"
                        style={{ color: themeColor }}
                      >
                        {tip.contact_email}
                      </a>
                    </div>
                  </div>
                )}
                {tip.contact_social_parsed?.website && (
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Globe className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" style={{ color: themeColor }} />
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base">Site web</p>
                      <a
                        href={tip.contact_social_parsed.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-sm sm:text-base break-all"
                        style={{ color: themeColor }}
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
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2" style={{ color: themeColor }}>
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: themeColor }} />
                  Horaires
                </h3>
                <div className="space-y-1.5 sm:space-y-2">
                  {daysOfWeek.map(({ key, label }) => {
                    const hours = openingHours[key as keyof OpeningHours]
                    return (
                      <div key={key} className="flex justify-between gap-2 text-sm sm:text-base">
                        <span className="font-medium">{label}</span>
                        <span className="text-gray-600 text-right">{hours || 'Fermé'}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Note Google et Avis */}
          {(tip.rating || (tip.reviews_parsed && tip.reviews_parsed.length > 0)) && (
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
              {/* Note globale */}
              {tip.rating && (
                <div className="flex items-center gap-2 mb-3 sm:mb-4 pb-3 border-b border-gray-200">
                  <div className="flex items-center gap-1.5 bg-yellow-50 px-2.5 py-1.5 rounded-lg">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xl font-bold text-gray-800">{tip.rating.toFixed(1)}</span>
                  </div>
                  {tip.user_ratings_total > 0 && (
                    <span className="text-sm text-gray-600">
                      Basé sur {tip.user_ratings_total} avis Google
                    </span>
                  )}
                  {tip.price_level !== null && tip.price_level !== undefined && tip.price_level > 0 && (
                    <span className="ml-auto text-lg font-semibold text-gray-600">
                      {'€'.repeat(tip.price_level)}
                    </span>
                  )}
                </div>
              )}

              {/* Avis détaillés (max 3 les plus pertinents) */}
              {tip.reviews_parsed && tip.reviews_parsed.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Avis récents</h4>
                  {tip.reviews_parsed.slice(0, 3).map((review, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border border-gray-100">
                      <div className="flex items-start gap-2 mb-2">
                        {/* Photo de profil ou icône par défaut */}
                        {review.profile_photo_url ? (
                          <img
                            src={review.profile_photo_url}
                            alt={review.author_name}
                            className="w-8 h-8 rounded-full flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-sm font-semibold text-gray-800 truncate">{review.author_name}</p>
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'fill-gray-200 text-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mb-1.5">{review.relative_time_description}</p>
                          <p className="text-sm text-gray-700 line-clamp-3">{review.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {tip.route_url && (
                    <a
                      href={tip.route_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-center block hover:underline"
                      style={{ color: themeColor }}
                    >
                      Voir tous les avis sur Google Maps →
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Code promo */}
          {tip.promo_code && (
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg text-white" style={{ backgroundColor: themeColor }}>
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <Tag className="w-4 h-4 sm:w-5 sm:h-5" />
                <h3 className="text-base sm:text-lg font-semibold">Code promo exclusif !</h3>
              </div>
              <p className="text-xl sm:text-2xl font-bold font-mono">{tip.promo_code}</p>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
            {tip.coordinates_parsed && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${tip.coordinates_parsed.lat},${tip.coordinates_parsed.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg transition active:scale-95 text-sm sm:text-base hover:opacity-90"
                style={{ backgroundColor: themeColor }}
              >
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                Itinéraire
              </a>
            )}
            {tip.contact_social_parsed?.website && (
              <a
                href={tip.contact_social_parsed.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg hover:bg-gray-300 transition active:scale-95 text-sm sm:text-base"
              >
                <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                Site web
              </a>
            )}
            {tip.route_url && (
              <a
                href={tip.route_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg hover:bg-gray-300 transition active:scale-95 text-sm sm:text-base"
              >
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                Voir sur Google Maps
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
