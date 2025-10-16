import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json()

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'userId et email requis' },
        { status: 400 }
      )
    }

    // Utiliser le service_role pour bypasser les RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Vérifier si un client existe déjà pour cet utilisateur
    const { data: existing } = await supabaseAdmin
      .from('clients')
      .select('id, slug')
      .eq('user_id', userId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({
        success: true,
        client: existing,
        message: 'Welcomebook déjà existant'
      })
    }

    // Générer le slug à partir de l'email
    const baseName = email.split('@')[0]
    let slug = baseName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Vérifier l'unicité du slug
    let counter = 0
    let uniqueSlug = slug

    while (true) {
      const { data: existingSlug } = await supabaseAdmin
        .from('clients')
        .select('id')
        .or(`slug.eq.${uniqueSlug},subdomain.eq.${uniqueSlug}`)
        .maybeSingle()

      if (!existingSlug) break

      counter++
      uniqueSlug = `${slug}-${counter}`
    }

    // Créer le welcomebook avec service_role (bypass RLS)
    const { data, error } = await supabaseAdmin
      .from('clients')
      .insert({
        user_id: userId,
        name: 'Mon WelcomeBook',
        slug: uniqueSlug,
        subdomain: uniqueSlug,
        email: email,
        header_color: '#4F46E5',
        footer_color: '#1E1B4B',
      })
      .select()
      .single()

    if (error) {
      console.error('Erreur création welcomebook:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      client: data
    })

  } catch (error: any) {
    console.error('Erreur API:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
