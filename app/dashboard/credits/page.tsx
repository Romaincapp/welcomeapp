import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCreditBalance } from '@/lib/actions/credits'
import { getUserPendingShares } from '@/lib/actions/share-social-post'
import CreditsUsageClient from './CreditsUsageClient'

export default async function CreditsPage() {
  const supabase = await createServerSupabaseClient()

  // Vérifier authentification
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    redirect('/login')
  }

  // Récupérer le solde de crédits
  const creditBalanceResult = await getCreditBalance(user.email)
  const creditBalance = creditBalanceResult.success && creditBalanceResult.data
    ? creditBalanceResult.data
    : null

  // Récupérer les partages en attente
  const pendingSharesResult = await getUserPendingShares()
  const pendingShares = pendingSharesResult.success && pendingSharesResult.data
    ? pendingSharesResult.data
    : []
  const pendingSharesCount = pendingShares.length
  const pendingCredits = pendingShares.reduce((sum, share) => sum + (share.credits_awarded || 0), 0)

  return (
    <CreditsUsageClient
      creditBalance={creditBalance}
      pendingCredits={pendingCredits}
      pendingSharesCount={pendingSharesCount}
    />
  )
}
