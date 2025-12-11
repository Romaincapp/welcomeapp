import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY

interface PlaceResult {
  place_id: string
  name: string
  vicinity: string
  rating?: number
  user_ratings_total?: number
  types: string[]
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  photos?: Array<{
    photo_reference: string
    height: number
    width: number
  }>
}

interface NearbySearchResponse {
  results: PlaceResult[]
  status: string
  next_page_token?: string
}

// Mapping des catégories vers les types Google Places
const CATEGORY_TYPE_MAPPING: Record<string, { types: string[]; categorySlug: string }> = {
  restaurants: {
    types: ['restaurant', 'cafe', 'bakery'],
    categorySlug: 'restaurants'
  },
  activites: {
    types: ['tourist_attraction', 'amusement_park', 'aquarium', 'zoo', 'museum', 'art_gallery'],
    categorySlug: 'activites'
  },
  nature: {
    types: ['park', 'campground', 'hiking_area', 'tourist_attraction'],
    categorySlug: 'nature'
  },
  culture: {
    types: ['museum', 'art_gallery', 'movie_theater', 'library'],
    categorySlug: 'culture'
  },
  shopping: {
    types: ['shopping_mall', 'store', 'supermarket'],
    categorySlug: 'shopping'
  },
  bars: {
    types: ['bar', 'night_club'],
    categorySlug: 'bars'
  },
  sports: {
    types: ['gym', 'stadium', 'bowling_alley'],
    categorySlug: 'sports'
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = searchParams.get('radius') || '5000' // 5km par défaut
    const category = searchParams.get('category') // restaurants, activites, etc.

    if (!lat || !lng) {
      return NextResponse.json({ error: 'Missing lat or lng parameter' }, { status: 400 })
    }

    if (!GOOGLE_PLACES_API_KEY) {
      return NextResponse.json({ error: 'Google Places API key not configured' }, { status: 500 })
    }

    // Déterminer les types à rechercher
    let typesToSearch: string[] = []
    let suggestedCategory: string | null = null

    if (category && CATEGORY_TYPE_MAPPING[category]) {
      typesToSearch = CATEGORY_TYPE_MAPPING[category].types
      suggestedCategory = CATEGORY_TYPE_MAPPING[category].categorySlug
    } else {
      // Si pas de catégorie spécifiée, rechercher tous les types intéressants
      typesToSearch = Object.values(CATEGORY_TYPE_MAPPING).flatMap(c => c.types)
    }

    const allResults: Array<PlaceResult & { suggested_category: string }> = []

    // Faire une recherche pour chaque type
    for (const type of typesToSearch.slice(0, 3)) { // Limiter à 3 types pour éviter trop d'appels
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${GOOGLE_PLACES_API_KEY}&language=fr`
      )

      if (!response.ok) {
        console.error(`Failed to fetch for type ${type}`)
        continue
      }

      const data: NearbySearchResponse = await response.json()

      if (data.status === 'OK' && data.results) {
        // Déterminer la catégorie suggérée pour chaque lieu
        const resultsWithCategory = data.results.map(place => {
          const detectedCategory = detectCategoryFromTypes(place.types)
          return {
            ...place,
            suggested_category: detectedCategory || 'autres'
          }
        })

        allResults.push(...resultsWithCategory)
      }
    }

    // Fonction pour calculer la distance entre deux points (formule Haversine)
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
      const R = 6371 // Rayon de la Terre en km
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLng = (lng2 - lng1) * Math.PI / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
          Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return R * c
    }

    const centerLat = parseFloat(lat)
    const centerLng = parseFloat(lng)
    const radiusKm = parseFloat(radius) / 1000

    // Filtrer et trier avec pondération distance + qualité
    const sortedResults = allResults
      .filter(place =>
        place.rating &&
        // Filtre qualité assoupli : 3.5+ OU (3.0+ avec beaucoup d'avis)
        (place.rating >= 3.5 || (place.user_ratings_total && place.user_ratings_total >= 50 && place.rating >= 3.0))
      )
      .map(place => {
        // Calculer la distance
        const distanceKm = calculateDistance(
          centerLat,
          centerLng,
          place.geometry.location.lat,
          place.geometry.location.lng
        )

        // Score de distance (1.0 à proximité, 0.0 au rayon max)
        const distanceScore = Math.max(0, 1 - distanceKm / radiusKm)

        // Score de qualité (note × log des avis)
        const qualityScore = (place.rating || 0) * Math.log10((place.user_ratings_total || 1) + 1)

        // Score final : 70% qualité, 30% proximité
        const finalScore = qualityScore * 0.7 + distanceScore * 10 * 0.3

        return {
          ...place,
          distance_km: distanceKm,
          final_score: finalScore,
        }
      })
      .sort((a, b) => b.final_score - a.final_score)
      .slice(0, 10) // Top 10 par catégorie

    // Formater les résultats
    const formattedResults = sortedResults.map(place => ({
      place_id: place.place_id,
      name: place.name,
      address: place.vicinity,
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      coordinates: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      },
      photo_reference: place.photos?.[0]?.photo_reference || null,
      photo_url: place.photos?.[0]
        ? `/api/places/photo?photo_reference=${place.photos[0].photo_reference}&maxwidth=400`
        : null,
      suggested_category: place.suggested_category,
      types: place.types,
      distance_km: Math.round(place.distance_km * 10) / 10, // Arrondi à 1 décimale
    }))

    return NextResponse.json({
      results: formattedResults,
      total: formattedResults.length
    })
  } catch (error) {
    console.error('Error in nearby search API:', error)
    return NextResponse.json(
      { error: 'Failed to search nearby places' },
      { status: 500 }
    )
  }
}

// Fonction pour détecter la catégorie en fonction des types Google
function detectCategoryFromTypes(types: string[]): string | null {
  for (const [categoryKey, categoryData] of Object.entries(CATEGORY_TYPE_MAPPING)) {
    if (types.some(type => categoryData.types.includes(type))) {
      return categoryData.categorySlug
    }
  }
  return null
}
