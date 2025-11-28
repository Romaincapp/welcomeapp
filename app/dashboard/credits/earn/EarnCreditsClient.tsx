'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ExternalLink, CheckCircle, Coins, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { shareSocialPost } from '@/lib/actions/share-social-post'
import type { OfficialSocialPost } from '@/types'
import type { User } from '@supabase/supabase-js'

interface EarnCreditsClientProps {
  client: { id: string; slug: string; name: string }
  user: User
  posts: OfficialSocialPost[]
}

const platformIcons: Record<string, string> = {
  instagram: '📸',
  linkedin: '🔵',
  facebook: '📘',
  twitter: '🐦',
  blog: '✍️',
  newsletter: '📧',
}

const platformColors: Record<string, string> = {
  instagram: 'from-purple-500 to-pink-500',
  linkedin: 'from-blue-600 to-blue-700',
  facebook: 'from-blue-600 to-blue-800',
  twitter: 'from-sky-400 to-sky-600',
  blog: 'from-gray-600 to-gray-800',
  newsletter: 'from-green-500 to-green-700',
}

// Clé localStorage pour les profils sociaux sauvegardés
const SOCIAL_PROFILES_KEY = 'welcomeapp_social_profiles'

type SavedProfiles = Record<string, string>

export default function EarnCreditsClient({ client, user, posts }: EarnCreditsClientProps) {
  const router = useRouter()
  const [sharingPostId, setSharingPostId] = useState<string | null>(null)
  const [justShared, setJustShared] = useState<string | null>(null) // ID du post qui vient d'être partagé
  const [creditsEarned, setCreditsEarned] = useState<number | null>(null)
  const [confirmSharePost, setConfirmSharePost] = useState<OfficialSocialPost | null>(null)
  const [socialProfileUrl, setSocialProfileUrl] = useState<string>('')
  const [savedProfiles, setSavedProfiles] = useState<SavedProfiles>({})

  const [pendingMessage, setPendingMessage] = useState<string | null>(null)

  // Charger les profils sauvegardés au mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SOCIAL_PROFILES_KEY)
      if (saved) {
        setSavedProfiles(JSON.parse(saved))
      }
    } catch (e) {
      console.error('Erreur chargement profils:', e)
    }
  }, [])

  // Pré-remplir le champ quand on sélectionne un post
  useEffect(() => {
    if (confirmSharePost) {
      const platform = confirmSharePost.platform
      const savedUrl = savedProfiles[platform]
      if (savedUrl) {
        setSocialProfileUrl(savedUrl)
      } else {
        setSocialProfileUrl('')
      }
    }
  }, [confirmSharePost, savedProfiles])

  // Sauvegarder le profil après un partage réussi
  const saveProfile = (platform: string, url: string) => {
    if (!url.trim()) return
    const updated = { ...savedProfiles, [platform]: url.trim() }
    setSavedProfiles(updated)
    try {
      localStorage.setItem(SOCIAL_PROFILES_KEY, JSON.stringify(updated))
    } catch (e) {
      console.error('Erreur sauvegarde profil:', e)
    }
  }

  const handleConfirmShare = async (addLater: boolean = false) => {
    if (!confirmSharePost) return

    const postToShare = confirmSharePost
    const profileUrl = addLater ? undefined : socialProfileUrl.trim() || undefined

    setSharingPostId(postToShare.id)
    setConfirmSharePost(null) // Fermer le dialog
    setSocialProfileUrl('') // Réinitialiser le champ

    // Ouvrir le post dans un nouvel onglet AVANT de créditer
    window.open(postToShare.post_url, '_blank', 'noopener,noreferrer')

    // Créditer immédiatement si profil fourni, sinon pending
    const result = await shareSocialPost(postToShare.id, profileUrl)

    if (result.success && result.data) {
      setJustShared(postToShare.id)

      // Sauvegarder le profil pour la prochaine fois (si fourni)
      if (profileUrl) {
        saveProfile(postToShare.platform, profileUrl)
      }

      if (result.data.status === 'pending') {
        // Crédits en attente
        setPendingMessage(`Partage enregistré ! Vos +${result.data.creditsAwarded} crédits seront accordés une fois votre profil ajouté.`)
        setCreditsEarned(null)
      } else {
        // Crédits accordés immédiatement
        setCreditsEarned(result.data.creditsAwarded)
        setPendingMessage(null)
      }

      // Animation de succès pendant 5 secondes
      setTimeout(() => {
        setJustShared(null)
        setCreditsEarned(null)
        setPendingMessage(null)
      }, 5000)

      // Refresh pour mettre à jour le solde de crédits dans le header
      router.refresh()
    } else {
      alert(result.error || 'Erreur lors du partage')
    }

    setSharingPostId(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au dashboard
            </Button>
          </Link>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Coins className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              Gagner des Crédits
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Partagez nos posts officiels WelcomeApp sur vos réseaux sociaux pour gagner des crédits
            </p>
          </div>

          {/* Instructions */}
          <Card className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 border-indigo-200 dark:border-indigo-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              🚀 Comment ça marche ?
            </h2>
            <ol className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">1.</span>
                <span>
                  <strong>Cliquez sur "📤 Partager ce post"</strong> → le post s'ouvre dans un nouvel onglet
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">2.</span>
                <span>
                  <strong>Utilisez le bouton natif "Partager"</strong> de la plateforme (Instagram/LinkedIn/Facebook/Twitter)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">3.</span>
                <span>
                  <strong>C'est tout !</strong> Vos crédits sont ajoutés immédiatement 🎉
                </span>
              </li>
            </ol>

            <div className="mt-4 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-indigo-200 dark:border-indigo-700">
              <p className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                <span className="text-lg">💡</span>
                <span>
                  <strong>Astuce :</strong> Tous nos posts mentionnent <strong>welcomeapp.be</strong> et mettent en avant
                  l'avantage du <strong>lien envoyé AVANT l'arrivée</strong> pour que les voyageurs préparent leur séjour.
                  Cela aide à faire connaître WelcomeApp tout en montrant votre professionnalisme !
                </span>
              </p>
            </div>
          </Card>

          {/* Article Blog Banner */}
          <Link href="/dashboard/credits/article">
            <Card className="p-4 mt-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-200 dark:border-purple-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📝</span>
                  <div>
                    <p className="font-semibold text-purple-900 dark:text-purple-100">
                      Vous avez un site ou blog ?
                    </p>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Publiez notre article template et gagnez <strong>+150 crédits</strong> + améliorez votre SEO !
                    </p>
                  </div>
                </div>
                <Badge className="bg-purple-500 text-white border-purple-600">
                  +150
                </Badge>
              </div>
            </Card>
          </Link>

          {/* Success Message */}
          {justShared && creditsEarned && (
            <Card className="p-6 mt-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-200 dark:border-green-700 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                <div>
                  <h3 className="text-lg font-bold text-green-900 dark:text-green-100">
                    Merci pour le partage ! 🎉
                  </h3>
                  <p className="text-green-700 dark:text-green-300 mt-1">
                    <strong>+{creditsEarned} crédits</strong> ont été ajoutés à votre compte
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Pending Message */}
          {justShared && pendingMessage && (
            <Card className="p-6 mt-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 border-amber-200 dark:border-amber-700 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="flex items-center gap-3">
                <Coins className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                <div>
                  <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100">
                    Partage enregistré ! ⏳
                  </h3>
                  <p className="text-amber-700 dark:text-amber-300 mt-1">
                    {pendingMessage}
                  </p>
                  <Link
                    href="/dashboard/credits/pending"
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-block"
                  >
                    Ajouter mon profil maintenant →
                  </Link>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Posts Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.length === 0 ? (
            <Card className="p-12 text-center col-span-full">
              <p className="text-gray-500 dark:text-gray-400 text-lg">Aucun post disponible pour le moment</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Revenez bientôt ! Nous ajouterons régulièrement de nouveaux posts à partager.
              </p>
            </Card>
          ) : (
            posts.map((post) => (
              <Card
                key={post.id}
                className={`p-0 overflow-hidden hover:shadow-lg transition-shadow ${
                  justShared === post.id ? 'ring-2 ring-green-500 ring-offset-2' : ''
                }`}
              >
                {/* Header avec gradient plateforme */}
                <div className={`p-4 bg-gradient-to-r ${platformColors[post.platform]} text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{platformIcons[post.platform]}</span>
                      <span className="font-semibold capitalize">{post.platform}</span>
                    </div>
                    <Badge className="bg-white/20 text-white border-white/30">
                      +{post.credits_reward} crédits
                    </Badge>
                  </div>
                </div>

                {/* Thumbnail */}
                {post.thumbnail_url && (
                  <div className="relative w-full h-48">
                    <Image
                      src={post.thumbnail_url}
                      alt={post.caption}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-5">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-4">{post.caption}</p>

                  {post.category && (
                    <Badge variant="outline" className="mb-4 text-xs">
                      {post.category}
                    </Badge>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setConfirmSharePost(post)}
                      disabled={sharingPostId === post.id || justShared === post.id}
                      className={`flex-1 ${
                        justShared === post.id
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      {sharingPostId === post.id ? (
                        'Partage...'
                      ) : justShared === post.id ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Partagé !
                        </>
                      ) : (
                        <>
                          📤 Partager ce post
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(post.post_url, '_blank', 'noopener,noreferrer')}
                      title="Voir le post original"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Vous avez partagé un post ? Consultez votre{' '}
            <Link href="/dashboard/credits/history" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              historique de crédits
            </Link>
          </p>
        </div>

        {/* Confirmation Dialog */}
        <AlertDialog open={!!confirmSharePost} onOpenChange={(open) => {
          if (!open) {
            setConfirmSharePost(null)
            setSocialProfileUrl('')
          }
        }}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Prêt à partager ?</AlertDialogTitle>
              <AlertDialogDescription className="text-base leading-relaxed">
                Merci de jouer le jeu, cela m'aide à faire grandir WelcomeApp ! 🚀
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <p className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span><strong>Avec profil :</strong> crédits immédiats + je peux vous remercier !</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-amber-500">⏳</span>
                <span><strong>Sans profil :</strong> crédits en attente jusqu'à ajout du lien</span>
              </p>
            </div>

            {/* Input profil social */}
            <div className="my-4 space-y-2">
              <Label htmlFor="social-profile" className="flex items-center gap-2 text-sm font-medium">
                <UserCircle className="h-4 w-4" />
                Votre profil {confirmSharePost?.platform} <span className="text-red-500">*</span>
                {confirmSharePost && savedProfiles[confirmSharePost.platform] && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 text-xs ml-auto">
                    ✓ Pré-rempli
                  </Badge>
                )}
              </Label>
              <Input
                id="social-profile"
                type="url"
                placeholder={
                  confirmSharePost?.platform === 'linkedin'
                    ? 'https://linkedin.com/in/votre-profil'
                    : confirmSharePost?.platform === 'instagram'
                    ? 'https://instagram.com/votre_compte'
                    : confirmSharePost?.platform === 'facebook'
                    ? 'https://facebook.com/votre.profil'
                    : confirmSharePost?.platform === 'twitter'
                    ? 'https://twitter.com/votre_compte'
                    : 'Lien vers votre profil'
                }
                value={socialProfileUrl}
                onChange={(e) => setSocialProfileUrl(e.target.value)}
                className={`text-sm ${confirmSharePost && savedProfiles[confirmSharePost.platform] ? 'border-green-300 dark:border-green-700' : ''}`}
              />
              {confirmSharePost && savedProfiles[confirmSharePost.platform] ? (
                <p className="text-xs text-green-600 dark:text-green-400">
                  ✓ Profil mémorisé depuis votre dernier partage - Cliquez directement sur le bouton !
                </p>
              ) : (
                <p className="text-xs text-gray-500">
                  Votre profil sera mémorisé pour les prochains partages 🙏
                </p>
              )}
            </div>

            <p className="text-sm text-gray-600">
              <strong>Important :</strong> Partagez bien à partir de la publication qui va s'ouvrir dans un nouvel onglet.
            </p>

            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <Button
                variant="outline"
                onClick={() => handleConfirmShare(true)}
                disabled={sharingPostId !== null}
                className="text-gray-600"
              >
                Ajouter plus tard
              </Button>
              <AlertDialogAction
                onClick={() => handleConfirmShare(false)}
                disabled={!socialProfileUrl.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                Compris, ouvrir le post
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
