import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import ArticleTemplateClient from './ArticleTemplateClient'

export default async function ArticleTemplatePage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    redirect('/login')
  }

  // Récupérer les infos du client pour personnaliser le template
  const { data: client } = await (supabase
    .from('clients') as any)
    .select('name, slug')
    .eq('email', user.email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const clientData = client as { name?: string; slug?: string } | null

  return (
    <ArticleTemplateClient
      user={user}
      clientName={clientData?.name || 'Ma Location'}
      clientSlug={clientData?.slug || 'demo'}
    />
  )
}
