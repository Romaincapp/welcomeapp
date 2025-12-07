import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { getStripe } from '@/lib/stripe'
import { getPackageById } from '@/lib/stripe/products'
import PurchaseConfirmation from '@/emails/templates/PurchaseConfirmation'

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

  // Envoyer l'email de confirmation au client
  await sendPurchaseConfirmationEmail(userEmail, productType, creditsAmount, session)

  // Notifier l'admin
  await sendAdminPurchaseNotification(userEmail, productType, creditsAmount, session)

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

  return newBalance
}

/**
 * Envoie l'email de confirmation d'achat
 */
async function sendPurchaseConfirmationEmail(
  userEmail: string,
  productType: string,
  creditsAmount: number,
  session: Stripe.Checkout.Session
) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const pkg = getPackageById(productType)
    const packageName = pkg?.name || productType.replace('credits_', '').replace('multi_', 'Multi ')

    // Récupérer le nouveau solde
    const supabase = getAdminSupabase()
    const { data: client } = await supabase
      .from('clients')
      .select('credits_balance, name')
      .eq('email', userEmail)
      .limit(1)
      .maybeSingle()

    const newBalance = client?.credits_balance || creditsAmount
    const userName = client?.name || userEmail.split('@')[0]

    const amountPaid = session.amount_total
      ? `${(session.amount_total / 100).toFixed(2).replace('.', ',')}€`
      : 'N/A'

    await resend.emails.send({
      from: 'WelcomeApp <noreply@welcomeapp.be>',
      to: userEmail,
      subject: `Confirmation d'achat - ${creditsAmount} crédits ajoutés`,
      react: PurchaseConfirmation({
        userName,
        packageName,
        creditsAmount,
        amountPaid,
        newBalance,
        purchaseDate: new Date().toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      }),
    })

    console.log(`[STRIPE WEBHOOK] Email confirmation envoyé à ${userEmail}`)
  } catch (error) {
    console.error('[STRIPE WEBHOOK] Erreur envoi email confirmation:', error)
    // Ne pas throw - l'achat a réussi, l'email n'est pas critique
  }
}

/**
 * Notifie l'admin d'un nouvel achat
 */
async function sendAdminPurchaseNotification(
  userEmail: string,
  productType: string,
  creditsAmount: number,
  session: Stripe.Checkout.Session
) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const pkg = getPackageById(productType)
    const packageName = pkg?.name || productType

    const amountPaid = session.amount_total
      ? `${(session.amount_total / 100).toFixed(2).replace('.', ',')}€`
      : 'N/A'

    await resend.emails.send({
      from: 'WelcomeApp <noreply@welcomeapp.be>',
      to: 'contact@welcomeapp.be',
      subject: `💰 Nouvel achat: ${packageName} (${amountPaid})`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #16a34a;">💰 Nouvel achat de crédits!</h2>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Client</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${userEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Pack</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${packageName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Crédits</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; color: #16a34a;">+${creditsAmount}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Montant</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; color: #4f46e5;">${amountPaid}</td>
            </tr>
            <tr>
              <td style="padding: 8px; color: #666;">Date</td>
              <td style="padding: 8px; font-weight: bold;">${new Date().toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}</td>
            </tr>
          </table>

          <p style="color: #666; font-size: 14px;">
            <a href="https://dashboard.stripe.com/payments/${session.payment_intent}" style="color: #4f46e5;">
              Voir dans Stripe Dashboard →
            </a>
          </p>
        </div>
      `,
    })

    console.log('[STRIPE WEBHOOK] Notification admin envoyée')
  } catch (error) {
    console.error('[STRIPE WEBHOOK] Erreur notification admin:', error)
    // Ne pas throw - non critique
  }
}
