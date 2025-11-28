import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getActiveOfficialPosts } from '@/lib/actions/share-social-post'
import EarnCreditsClient from './EarnCreditsClient'

export default async function EarnCreditsPage() {
  const supabase = await createServerSupabaseClient()

  // Vérifier authentification
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    redirect('/login')
  }

  // Récupérer le welcomebook actif (pour clientId)
  const { data: client } = await (supabase
    .from('clients') as any)
    .select('id, slug, name')
    .eq('email', user.email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!client) {
    redirect('/dashboard/welcome')
  }

  // Récupérer les posts officiels actifs
  const postsResult = await getActiveOfficialPosts()
  const posts = postsResult.success ? postsResult.data || [] : []

  return <EarnCreditsClient client={client} user={user} posts={posts} />
}
