import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getUserPendingShares } from '@/lib/actions/share-social-post'
import PendingSharesClient from './PendingSharesClient'

export default async function PendingSharesPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const result = await getUserPendingShares()

  return (
    <PendingSharesClient
      pendingShares={result.data || []}
      user={user}
    />
  )
}
