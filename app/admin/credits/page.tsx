import { getRecentSocialShares, getSocialSharesStats } from '@/lib/actions/admin/credits'
import CreditsAdminClient from './CreditsAdminClient'

export default async function AdminCreditsPage() {
  // Récupérer les partages récents et les stats
  const [sharesResult, statsResult] = await Promise.all([
    getRecentSocialShares(100),
    getSocialSharesStats(),
  ])

  return (
    <CreditsAdminClient
      initialShares={sharesResult.data || []}
      initialStats={statsResult.data || {
        today: 0,
        this_week: 0,
        this_month: 0,
        total_credits_distributed: 0,
        new_shares_since_last_visit: 0,
        pending_count: 0,
      }}
    />
  )
}
