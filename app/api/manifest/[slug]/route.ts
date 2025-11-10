import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Récupérer le client depuis Supabase
  const { data: client, error } = await (supabase
    .from('clients') as any)
    .select('name, background_image, header_color')
    .eq('slug', slug)
    .single()

  if (error || !client) {
    return NextResponse.json({ error: 'WelcomeApp not found' }, { status: 404 })
  }

  // Générer le manifest.json dynamique
  const manifest = {
    name: client.name,
    short_name: client.name.length > 12 ? client.name.substring(0, 12) : client.name,
    description: `Guide personnalisé pour ${client.name}`,
    start_url: `/${slug}`,
    display: 'standalone',
    background_color: client.header_color || '#4F46E5',
    theme_color: client.header_color || '#4F46E5',
    orientation: 'portrait',
    scope: `/${slug}`,
    icons: [
      {
        src: `/api/icon/${slug}/192`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: `/api/icon/${slug}/512`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: `/api/icon/${slug}/192`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: `/api/icon/${slug}/512`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ],
    categories: ['travel', 'lifestyle'],
    lang: 'fr-FR'
  }

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=3600' // Cache 1h
    }
  })
}
