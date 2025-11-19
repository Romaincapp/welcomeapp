import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import CreateWelcomebookClient from './CreateWelcomebookClient'

export default async function CreateWelcomebookPage() {
  const supabase = await createServerSupabaseClient()

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) {
    redirect('/login')
  }

  return <CreateWelcomebookClient userEmail={user.email} userId={user.id} />
}
