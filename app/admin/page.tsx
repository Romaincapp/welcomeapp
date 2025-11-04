import {
  getAdminPlatformStats,
  getSignupsEvolution,
  getTopWelcomebooks
} from '@/lib/actions/admin/stats'
import AdminOverviewClient from './AdminOverviewClient'

export default async function AdminOverviewPage() {
  // Récupérer toutes les stats en parallèle
  const [stats, signupsEvolution, topWelcomebooks] = await Promise.all([
    getAdminPlatformStats(),
    getSignupsEvolution(),
    getTopWelcomebooks(10)
  ])

  return (
    <AdminOverviewClient
      stats={stats}
      signupsEvolution={signupsEvolution}
      topWelcomebooks={topWelcomebooks}
    />
  )
}
