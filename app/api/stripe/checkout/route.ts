import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getStripe, getCreditsForProduct } from '@/lib/stripe'
import { getPackageById } from '@/lib/stripe/products'

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer les paramètres
    const body = await request.json()
    const { productType } = body as { productType: string }

    if (!productType) {
      return NextResponse.json({ error: 'productType requis' }, { status: 400 })
    }

    // Vérifier que le produit existe
    const pkg = getPackageById(productType)
    if (!pkg || !pkg.priceId) {
      return NextResponse.json({ error: 'Produit invalide ou non configuré' }, { status: 400 })
    }

    const stripe = getStripe()

    // Récupérer ou créer le customer Stripe
    let customerId: string | undefined

    const { data: existingCustomer } = await (supabase.from('stripe_customers') as unknown as {
      select: (columns: string) => {
        eq: (column: string, value: string) => {
          maybeSingle: () => Promise<{ data: { stripe_customer_id: string } | null; error: unknown }>
        }
      }
    })
      .select('stripe_customer_id')
      .eq('user_email', user.email)
      .maybeSingle()

    if (existingCustomer?.stripe_customer_id) {
      customerId = existingCustomer.stripe_customer_id
    } else {
      // Créer un nouveau customer Stripe
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_email: user.email },
      })
      customerId = customer.id

      // Sauvegarder en DB
      await (supabase.from('stripe_customers') as unknown as {
        insert: (data: { user_email: string; stripe_customer_id: string }) => Promise<{ error: unknown }>
      }).insert({
        user_email: user.email,
        stripe_customer_id: customerId,
      })
    }

    // Récupérer le nombre de crédits pour les metadata
    const creditsAmount = getCreditsForProduct(productType)

    // Créer la Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: pkg.priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://welcomeapp.be'}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://welcomeapp.be'}/dashboard/billing?canceled=true`,
      metadata: {
        user_email: user.email,
        product_type: productType,
        credits_amount: creditsAmount.toString(),
      },
      allow_promotion_codes: true,
    })

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('[STRIPE CHECKOUT] Erreur:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    )
  }
}
