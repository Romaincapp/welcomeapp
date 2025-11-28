import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/admin'
import { getAllOfficialPosts, getSocialPostsStats } from '@/lib/actions/admin/social-posts'
import SocialPostsClient from './SocialPostsClient'

export default async function AdminSocialPostsPage() {
  // Vérifier que l'utilisateur est admin
  const admin = await requireAdmin()
  if (!admin) {
    redirect('/dashboard')
  }

  // Récupérer les posts avec stats
  const postsResult = await getAllOfficialPosts(true)
  const posts = postsResult.success ? postsResult.data || [] : []

  // Récupérer les stats globales
  const statsResult = await getSocialPostsStats()
  const stats = statsResult.success ? (statsResult.data || null) : null

  return <SocialPostsClient initialPosts={posts} stats={stats} />
}
