import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY

interface PlaceDetailsResponse {
  result?: {
    name?: string
    formatted_address?: string
    geometry?: {
      location?: {
        lat: number
        lng: number
      }
    }
    formatted_phone_number?: string
    international_phone_number?: string
    website?: string
    opening_hours?: {
      weekday_text?: string[]
      periods?: Array<{
        open: { day: number; time: string }
        close?: { day: number; time: string }
      }>
    }
    photos?: Array<{
      photo_reference: string
      height: number
      width: number
    }>
    types?: string[]
    url?: string
  }
  status: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const placeId = searchParams.get('place_id')

    if (!placeId) {
      return NextResponse.json({ error: 'Missing place_id parameter' }, { status: 400 })
    }

    if (!GOOGLE_PLACES_API_KEY) {
      return NextResponse.json({ error: 'Google Places API key not configured' }, { status: 500 })
    }

    // Appel à l'API Google Places Details
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,formatted_phone_number,international_phone_number,website,opening_hours,photos,types,url&key=${GOOGLE_PLACES_API_KEY}&language=fr`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch from Google Places API')
    }

    const data: PlaceDetailsResponse = await response.json()

    if (data.status !== 'OK') {
      return NextResponse.json({ error: `Google API error: ${data.status}` }, { status: 400 })
    }

    // Transformer les données en format exploitable
    const place = data.result
    if (!place) {
      return NextResponse.json({ error: 'No place data found' }, { status: 404 })
    }

    // Convertir les horaires au format attendu
    const openingHours: Record<string, string> = {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: '',
    }

    if (place.opening_hours?.weekday_text) {
      const dayMapping: Record<string, string> = {
        'lundi': 'monday',
        'mardi': 'tuesday',
        'mercredi': 'wednesday',
        'jeudi': 'thursday',
        'vendredi': 'friday',
        'samedi': 'saturday',
        'dimanche': 'sunday',
      }

      place.opening_hours.weekday_text.forEach((dayText: string) => {
        // Format: "lundi: 09:00 – 18:00"
        const match = dayText.match(/^(\w+):\s*(.+)$/)
        if (match) {
          const [, dayFr, hours] = match
          const dayEn = dayMapping[dayFr.toLowerCase()]
          if (dayEn) {
            openingHours[dayEn] = hours
          }
        }
      })
    }

    // Générer les URLs des photos
    const photos = place.photos?.slice(0, 5).map((photo) => ({
      url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${photo.photo_reference}&key=${GOOGLE_PLACES_API_KEY}`,
      reference: photo.photo_reference,
    })) || []

    // Détecter la catégorie en fonction des types Google
    const suggestedCategory = detectCategory(place.types || [])

    const result = {
      name: place.name || '',
      address: place.formatted_address || '',
      coordinates: place.geometry?.location
        ? {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
          }
        : null,
      phone: place.formatted_phone_number || place.international_phone_number || '',
      website: place.website || '',
      opening_hours: openingHours,
      photos,
      google_maps_url: place.url || '',
      suggested_category: suggestedCategory,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in place details API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch place details' },
      { status: 500 }
    )
  }
}

// Fonction pour détecter la catégorie en fonction des types Google
function detectCategory(types: string[]): string | null {
  const categoryMapping: Record<string, string> = {
    'restaurant': 'restaurants',
    'cafe': 'restaurants',
    'bar': 'restaurants',
    'food': 'restaurants',
    'museum': 'culture',
    'art_gallery': 'culture',
    'movie_theater': 'culture',
    'park': 'nature',
    'natural_feature': 'nature',
    'campground': 'nature',
    'tourist_attraction': 'activites',
    'amusement_park': 'activites',
    'aquarium': 'activites',
    'zoo': 'activites',
    'shopping_mall': 'shopping',
    'store': 'shopping',
  }

  for (const type of types) {
    if (categoryMapping[type]) {
      return categoryMapping[type]
    }
  }

  return null
}
