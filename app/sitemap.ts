import { MetadataRoute } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createServerSupabaseClient()

  // Récupérer tous les clients pour leurs pages dynamiques
  const { data: clients } = await (supabase
    .from('clients') as any)
    .select('slug, updated_at')

  const clientUrls: MetadataRoute.Sitemap = (clients || []).map((client: { slug: string; updated_at: string }) => ({
    url: `https://welcomeapp.be/${client.slug}`,
    lastModified: new Date(client.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: 'https://welcomeapp.be',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://welcomeapp.be/demo',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: 'https://welcomeapp.be/login',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: 'https://welcomeapp.be/signup',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    ...clientUrls,
  ]
}
