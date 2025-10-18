import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const input = searchParams.get('input')

    if (!input) {
      return NextResponse.json({ error: 'Missing input parameter' }, { status: 400 })
    }

    if (!GOOGLE_PLACES_API_KEY) {
      return NextResponse.json({ error: 'Google Places API key not configured' }, { status: 500 })
    }

    // Appel à l'API Google Places Autocomplete
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_PLACES_API_KEY}&language=fr`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch from Google Places API')
    }

    const data: unknown = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in autocomplete API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch autocomplete suggestions' },
      { status: 500 }
    )
  }
}
