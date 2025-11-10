import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const runtime = 'edge'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; size: string }> }
) {
  const { slug, size } = await params
  const sizeNum = parseInt(size, 10)

  if (isNaN(sizeNum) || ![192, 512].includes(sizeNum)) {
    return new Response('Invalid size. Use 192 or 512', { status: 400 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Récupérer le client depuis Supabase
  const { data: client, error } = await (supabase
    .from('clients') as any)
    .select('name, background_image, header_color')
    .eq('slug', slug)
    .maybeSingle()

  if (error || !client) {
    return new Response('WelcomeApp not found', { status: 404 })
  }

  const backgroundColor = client.header_color || '#4F46E5'
  const backgroundImage = client.background_image

  // Générer l'icône avec l'image de fond ou une couleur unie
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
          background: backgroundColor,
        }}
      >
        {backgroundImage && (
          <img
            src={backgroundImage}
            alt=""
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}
      </div>
    ),
    {
      width: sizeNum,
      height: sizeNum,
    }
  )
}
