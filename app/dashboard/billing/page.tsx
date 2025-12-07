import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCreditBalance } from '@/lib/actions/credits'
import { getPurchaseHistory, getWelcomebookCount } from '@/lib/actions/billing'
import BillingClient from './BillingClient'

export default async function BillingPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    redirect('/login')
  }

  // Charger les données en parallèle
  const [creditResult, purchasesResult, welcomebookCount] = await Promise.all([
    getCreditBalance(user.email),
    getPurchaseHistory(user.email),
    getWelcomebookCount(user.email),
  ])

  return (
    <BillingClient
      userEmail={user.email}
      creditBalance={creditResult.data || null}
      purchases={purchasesResult.data || []}
      welcomebookCount={welcomebookCount}
    />
  )
}
