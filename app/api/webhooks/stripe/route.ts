import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { getStripe, getCreditsForProduct } from '@/lib/stripe'

/**
 * Supabase admin client (bypass RLS)
 * Utilisé uniquement dans le webhook car pas de session utilisateur
 */
function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.error('[STRIPE WEBHOOK] Signature manquante')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const stripe = getStripe()
  let event: Stripe.Event

  // Vérifier la signature du webhook
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[STRIPE WEBHOOK] Signature invalide:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = getAdminSupabase()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(supabase, session)
        break
      }
      default:
        console.log(`[STRIPE WEBHOOK] Événement non géré: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[STRIPE WEBHOOK] Erreur traitement:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

/**
 * Gère l'événement checkout.session.completed
 * Ajoute les crédits à l'utilisateur
 */
async function handleCheckoutCompleted(
  supabase: ReturnType<typeof getAdminSupabase>,
  session: Stripe.Checkout.Session
) {
  const userEmail = session.metadata?.user_email
  const productType = session.metadata?.product_type
  const creditsAmount = parseInt(session.metadata?.credits_amount || '0')

  if (!userEmail || !creditsAmount || !productType) {
    console.error('[STRIPE WEBHOOK] Metadata manquante:', {
      sessionId: session.id,
      userEmail,
      productType,
      creditsAmount,
    })
    return
  }

  // Vérifier idempotence (session déjà traitée?)
  const { data: existingPurchase } = await supabase
    .from('stripe_purchases')
    .select('id')
    .eq('stripe_session_id', session.id)
    .eq('status', 'completed')
    .maybeSingle()

  if (existingPurchase) {
    console.log('[STRIPE WEBHOOK] Session déjà traitée:', session.id)
    return
  }

  // Enregistrer l'achat
  const { error: purchaseError } = await supabase.from('stripe_purchases').upsert(
    {
      user_email: userEmail,
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string,
      product_type: productType,
      credits_amount: creditsAmount,
      amount_paid: session.amount_total || 0,
      currency: session.currency || 'eur',
      status: 'completed',
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'stripe_session_id' }
  )

  if (purchaseError) {
    console.error('[STRIPE WEBHOOK] Erreur enregistrement achat:', purchaseError)
    throw purchaseError
  }

  // Ajouter les crédits à l'utilisateur
  await addCreditsToUser(supabase, userEmail, creditsAmount, productType, {
    session_id: session.id,
    payment_intent: session.payment_intent,
    amount_paid: session.amount_total,
    currency: session.currency,
  })

  console.log(
    `[STRIPE WEBHOOK] Checkout complété: ${session.id} - ${creditsAmount} crédits pour ${userEmail}`
  )
}

/**
 * Ajoute des crédits à un utilisateur
 */
async function addCreditsToUser(
  supabase: ReturnType<typeof getAdminSupabase>,
  userEmail: string,
  amount: number,
  productType: string,
  metadata: Record<string, unknown>
) {
  // Récupérer le solde actuel (depuis le premier client de l'utilisateur)
  const { data: client } = await supabase
    .from('clients')
    .select('credits_balance')
    .eq('email', userEmail)
    .limit(1)
    .single()

  const currentBalance = client?.credits_balance || 0
  const newBalance = currentBalance + amount

  // Mettre à jour tous les clients de l'utilisateur
  const { error: updateError } = await supabase
    .from('clients')
    .update({
      credits_balance: newBalance,
      account_status: 'active', // Réactiver si suspendu
      suspended_at: null,
    })
    .eq('email', userEmail)

  if (updateError) {
    console.error('[STRIPE WEBHOOK] Erreur mise à jour crédits:', updateError)
    throw updateError
  }

  // Incrémenter credits_lifetime_earned séparément (SQL raw pour éviter race condition)
  try {
    await supabase.rpc('increment_lifetime_credits', {
      p_email: userEmail,
      p_amount: amount,
    })
  } catch {
    // Si la fonction n'existe pas, on ignore (sera créé dans une migration future si nécessaire)
    console.log('[STRIPE WEBHOOK] increment_lifetime_credits non disponible, ignoré')
  }

  // Logger la transaction
  const { error: transactionError } = await supabase.from('credit_transactions').insert({
    user_email: userEmail,
    amount: amount,
    balance_after: newBalance,
    transaction_type: 'purchase',
    description: `Achat ${productType} - ${amount} crédits`,
    metadata,
  })

  if (transactionError) {
    console.error('[STRIPE WEBHOOK] Erreur log transaction:', transactionError)
    // Ne pas throw ici, les crédits ont été ajoutés
  }
}
