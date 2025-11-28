import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCreditHistory, getUserCreditRequests } from '@/lib/actions/credits'
import HistoryClient from './HistoryClient'

export default async function HistoryPage() {
  const supabase = await createServerSupabaseClient()

  // Vérifier authentification
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    redirect('/login')
  }

  // Récupérer historique transactions
  const historyResult = await getCreditHistory(user.email, 100)
  const transactions = historyResult.success ? historyResult.data || [] : []

  // Récupérer demandes
  const requestsResult = await getUserCreditRequests(user.email, 50)
  const requests = requestsResult.success ? requestsResult.data || [] : []

  return <HistoryClient transactions={transactions} requests={requests} userEmail={user.email} />
}
