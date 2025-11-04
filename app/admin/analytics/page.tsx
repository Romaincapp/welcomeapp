import { getAdvancedAnalytics } from '@/lib/actions/admin/analytics'
import AdminAnalyticsClient from './AdminAnalyticsClient'

export default async function AdminAnalyticsPage() {
  const analytics = await getAdvancedAnalytics()

  return <AdminAnalyticsClient analytics={analytics} />
}
