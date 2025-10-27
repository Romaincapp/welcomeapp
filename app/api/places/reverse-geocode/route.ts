import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')

    if (!lat || !lng) {
      return NextResponse.json({ error: 'Missing lat or lng parameter' }, { status: 400 })
    }

    if (!GOOGLE_PLACES_API_KEY) {
      return NextResponse.json({ error: 'Google Places API key not configured' }, { status: 500 })
    }

    // Appel à l'API Google Geocoding pour reverse geocoding
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_PLACES_API_KEY}&language=fr`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch from Google Geocoding API')
    }

    const data = await response.json()

    if (data.status !== 'OK') {
      return NextResponse.json({ error: `Google API error: ${data.status}` }, { status: 400 })
    }

    // Retourner les résultats
    return NextResponse.json({
      address: data.results[0]?.formatted_address || '',
      results: data.results
    })
  } catch (error) {
    console.error('Error in reverse geocode API:', error)
    return NextResponse.json(
      { error: 'Failed to reverse geocode coordinates' },
      { status: 500 }
    )
  }
}
