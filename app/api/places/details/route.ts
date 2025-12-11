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
    rating?: number
    user_ratings_total?: number
    price_level?: number
    reviews?: Array<{
      author_name: string
      rating: number
      text: string
      relative_time_description: string
      profile_photo_url?: string
      time?: number
    }>
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
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,formatted_phone_number,international_phone_number,website,opening_hours,photos,types,url,rating,user_ratings_total,price_level,reviews&key=${GOOGLE_PLACES_API_KEY}&language=fr`
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

    // Retourner uniquement les photo_references (utiliser /api/places/photo pour les récupérer)
    const photos = place.photos?.slice(0, 5).map((photo) => ({
      url: `/api/places/photo?photo_reference=${photo.photo_reference}&maxwidth=1000`,
      reference: photo.photo_reference,
    })) || []

    // Détecter la catégorie en fonction des types Google avec score de confiance
    const categoryResult = detectCategoryWithConfidence(place.types || [])

    // Limiter à 5 avis maximum et garder les plus utiles
    const reviews = place.reviews?.slice(0, 5).map((review) => ({
      author_name: review.author_name,
      rating: review.rating,
      text: review.text,
      relative_time_description: review.relative_time_description,
      profile_photo_url: review.profile_photo_url,
      time: review.time,
    })) || []

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
      suggested_category: categoryResult.category,
      category_confidence: Math.round(categoryResult.confidence * 100), // Pourcentage (0-100)
      rating: place.rating || null,
      user_ratings_total: place.user_ratings_total || 0,
      price_level: place.price_level !== undefined ? place.price_level : null,
      reviews,
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

// Fonction pour détecter la catégorie en fonction des types Google avec confiance
function detectCategory(types: string[]): string | null {
  const result = detectCategoryWithConfidence(types)
  return result.category
}

function detectCategoryWithConfidence(types: string[]): { category: string | null; confidence: number } {
  // Mapping complet des types Google Places vers nos catégories
  const categoryMapping: Record<string, string> = {
    // Restaurants & Cafés
    'restaurant': 'restaurants',
    'cafe': 'restaurants',
    'bakery': 'restaurants',
    'meal_takeaway': 'restaurants',
    'meal_delivery': 'restaurants',
    'food': 'restaurants',

    // Bars & Vie nocturne
    'bar': 'bars',
    'night_club': 'bars',
    'liquor_store': 'bars',

    // Activités & Attractions
    'tourist_attraction': 'activites',
    'amusement_park': 'activites',
    'aquarium': 'activites',
    'zoo': 'activites',
    'bowling_alley': 'activites',
    'casino': 'activites',
    'spa': 'activites',
    'gym': 'activites',
    'stadium': 'activites',
    'movie_rental': 'activites',

    // Nature & Parcs
    'park': 'nature',
    'natural_feature': 'nature',
    'campground': 'nature',
    'rv_park': 'nature',

    // Culture & Musées
    'museum': 'culture',
    'art_gallery': 'culture',
    'movie_theater': 'culture',
    'library': 'culture',
    'performing_arts_theater': 'culture',

    // Shopping
    'shopping_mall': 'shopping',
    'store': 'shopping',
    'clothing_store': 'shopping',
    'book_store': 'shopping',
    'department_store': 'shopping',
    'electronics_store': 'shopping',
    'furniture_store': 'shopping',
    'home_goods_store': 'shopping',
    'jewelry_store': 'shopping',
    'shoe_store': 'shopping',
    'supermarket': 'shopping',
    'convenience_store': 'shopping',
  }

  // Types primaires = haute confiance (types très spécifiques)
  const primaryTypes = [
    'restaurant', 'cafe', 'bakery',
    'bar', 'night_club',
    'museum', 'art_gallery', 'library',
    'park', 'natural_feature',
    'shopping_mall', 'supermarket',
    'amusement_park', 'aquarium', 'zoo', 'stadium',
  ]

  // Priorité des catégories en cas de conflit
  const categoryPriority: Record<string, number> = {
    'bars': 10,
    'restaurants': 9,
    'activites': 8,
    'culture': 7,
    'shopping': 6,
    'nature': 5,
  }

  // Collecter toutes les catégories correspondantes avec leur position
  const matchedCategories: Array<{ category: string; position: number; isPrimary: boolean }> = []

  for (let i = 0; i < types.length; i++) {
    const type = types[i]
    if (categoryMapping[type]) {
      const category = categoryMapping[type]
      // Éviter les doublons
      if (!matchedCategories.find(m => m.category === category)) {
        matchedCategories.push({
          category,
          position: i,
          isPrimary: primaryTypes.includes(type),
        })
      }
    }
  }

  // Si aucun match, retourner null avec confiance 0
  if (matchedCategories.length === 0) {
    return { category: null, confidence: 0 }
  }

  // Si un seul match, calculer sa confiance
  if (matchedCategories.length === 1) {
    const match = matchedCategories[0]
    // Confiance basée sur :
    // - Position (premiers types = plus spécifiques) : 1.0 pour position 0, diminue de 0.15 par position
    // - Type primaire = boost de 0.2
    let confidence = Math.max(0.5, 1.0 - match.position * 0.15)
    if (match.isPrimary) {
      confidence = Math.min(1.0, confidence + 0.2)
    }
    return { category: match.category, confidence }
  }

  // Si plusieurs matchs, prendre celui avec la plus haute priorité
  const bestMatch = matchedCategories.sort((a, b) =>
    (categoryPriority[b.category] || 0) - (categoryPriority[a.category] || 0)
  )[0]

  // Confiance réduite en cas de conflit multi-catégories
  let confidence = Math.max(0.4, 0.8 - bestMatch.position * 0.1)
  if (bestMatch.isPrimary) {
    confidence = Math.min(0.9, confidence + 0.15)
  }

  return { category: bestMatch.category, confidence }
}
