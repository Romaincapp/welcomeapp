import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { shouldConsumeCredit } from '@/lib/utils/credit-consumption'

/**
 * Supabase client avec service role (bypass RLS)
 * Lazy loaded pour optimisation
 */
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

/**
 * Cron Job : Consommation Quotidienne des Crédits
 *
 * GET /api/cron/consume-credits
 *
 * Sécurité : Protégé par CRON_SECRET (défini dans Vercel)
 * Fréquence : Toutes les heures (configuré dans vercel.json : "0 * * * *")
 *
 * Responsabilités :
 * 1. Récupérer tous les utilisateurs actifs (credits_balance > 0)
 * 2. Pour chaque utilisateur :
 *    - Compter ses welcomebooks
 *    - Calculer intervalle de consommation (24h - accélération)
 *    - Vérifier si un crédit doit être consommé
 *    - Si OUI : -1 crédit + log transaction + update last_credit_consumption
 * 3. Vérifier seuils d'alerte :
 *    - Si balance = 30/7/1 jours → TODO: email warning (Phase 2)
 *    - Si balance = 0 → status 'grace_period' + email exhausted
 * 4. Vérifier grace period expiré (7j après balance=0) :
 *    - Status 'suspended' + email suspended
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    // 1. Vérifier l'authentification Cron Secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      console.error('[CRON CREDITS] CRON_SECRET not configured')
      return NextResponse.json(
        { error: 'Cron secret not configured' },
        { status: 500 }
      )
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('[CRON CREDITS] Unauthorized: Invalid cron secret')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[CRON CREDITS] ✅ Authorized - Starting credits consumption job')

    const supabase = getSupabase()

    // 2. Récupérer tous les utilisateurs avec balance > 0 OU en grace period
    const { data: users, error: usersError } = await supabase
      .from('user_credits_summary')
      .select('*')
      .or('credits_balance.gt.0,account_status.eq.grace_period')

    if (usersError) {
      console.error('[CRON CREDITS] Error fetching users:', usersError)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    if (!users || users.length === 0) {
      console.log('[CRON CREDITS] No users to process')
      return NextResponse.json({
        success: true,
        message: 'No users to process',
        creditsConsumed: 0,
        usersProcessed: 0
      })
    }

    console.log(`[CRON CREDITS] Found ${users.length} user(s) to process`)

    let creditsConsumed = 0
    let usersProcessed = 0
    let usersEnteredGracePeriod = 0
    let usersSuspended = 0
    const errors: string[] = []

    // 3. Traiter chaque utilisateur
    for (const user of users) {
      try {
        const userEmail = user.user_email
        const currentBalance = user.credits_balance
        const welcomebookCount = user.welcomebook_count || 1
        const lastConsumption = user.last_credit_consumption
        const accountStatus = user.account_status

        console.log(`[CRON CREDITS] Processing user: ${userEmail} (${currentBalance} crédits, ${welcomebookCount} welcomebooks)`)

        // Vérifier si en grace period depuis >7 jours → suspension
        if (accountStatus === 'grace_period') {
          const { data: clientData } = await supabase
            .from('clients')
            .select('suspended_at')
            .eq('email', userEmail)
            .limit(1)
            .single()

          if (clientData && clientData.suspended_at) {
            const suspendedDate = new Date(clientData.suspended_at)
            const now = new Date()
            const daysSinceSuspension = Math.floor(
              (now.getTime() - suspendedDate.getTime()) / (1000 * 60 * 60 * 24)
            )

            if (daysSinceSuspension >= 7) {
              // Passer en status 'suspended'
              await supabase
                .from('clients')
                .update({ account_status: 'suspended' })
                .eq('email', userEmail)

              console.log(`[CRON CREDITS] ⚠️ User ${userEmail} suspended (7d grace period expired)`)
              usersSuspended++
              // TODO Phase 2: Envoyer email "Account Suspended"
              continue
            }
          }
        }

        // Si balance > 0, vérifier si un crédit doit être consommé
        if (currentBalance > 0) {
          const shouldConsume = shouldConsumeCredit(lastConsumption, welcomebookCount)

          if (shouldConsume) {
            const newBalance = currentBalance - 1

            // Mettre à jour tous les clients de l'utilisateur
            await supabase
              .from('clients')
              .update({
                credits_balance: newBalance,
                last_credit_consumption: new Date().toISOString(),
                // Si balance tombe à 0, passer en grace_period
                account_status: newBalance === 0 ? 'grace_period' : 'active',
                suspended_at: newBalance === 0 ? new Date().toISOString() : null
              })
              .eq('email', userEmail)

            // Créer la transaction
            await supabase
              .from('credit_transactions')
              .insert({
                user_email: userEmail,
                amount: -1,
                balance_after: newBalance,
                transaction_type: 'spend_daily',
                description: 'Consommation quotidienne automatique',
                metadata: {
                  welcomebook_count: welcomebookCount,
                  previous_balance: currentBalance
                }
              })

            console.log(`[CRON CREDITS] ✅ Consumed 1 credit for ${userEmail} (${currentBalance} → ${newBalance})`)
            creditsConsumed++

            // Si passage à 0 → grace period
            if (newBalance === 0) {
              console.log(`[CRON CREDITS] 🟡 User ${userEmail} entered grace period (0 credits)`)
              usersEnteredGracePeriod++
              // TODO Phase 2: Envoyer email "Credit Exhausted"
            }

            // TODO Phase 2: Vérifier seuils d'alerte (30j, 7j, 1j)
          } else {
            console.log(`[CRON CREDITS] ⏭️ Skipping ${userEmail} (not yet time to consume)`)
          }
        }

        usersProcessed++
      } catch (userError) {
        const errorMsg = `Error processing user ${user.user_email}: ${userError instanceof Error ? userError.message : 'Unknown error'}`
        console.error(`[CRON CREDITS] ${errorMsg}`)
        errors.push(errorMsg)
        // Continuer avec les autres utilisateurs
      }
    }

    // 4. Résumé de l'exécution
    const executionTime = Date.now() - startTime
    const summary = {
      success: true,
      usersProcessed,
      creditsConsumed,
      usersEnteredGracePeriod,
      usersSuspended,
      executionTimeMs: executionTime,
      errors: errors.length > 0 ? errors : undefined
    }

    console.log('[CRON CREDITS] ✅ Job completed:', summary)

    return NextResponse.json(summary)
  } catch (error) {
    console.error('[CRON CREDITS] Fatal error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTimeMs: Date.now() - startTime
      },
      { status: 500 }
    )
  }
}
