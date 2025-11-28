'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Clock, CheckCircle, ExternalLink, UserCircle, Coins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { completePendingShare } from '@/lib/actions/share-social-post'
import type { SocialPostShare, OfficialSocialPost } from '@/types'
import type { User } from '@supabase/supabase-js'

interface PendingSharesClientProps {
  pendingShares: Array<SocialPostShare & { post?: OfficialSocialPost }>
  user: User
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

const platformPlaceholders: Record<string, string> = {
  linkedin: 'https://linkedin.com/in/votre-profil',
  instagram: 'https://instagram.com/votre_compte',
  facebook: 'https://facebook.com/votre.profil',
  twitter: 'https://twitter.com/votre_compte',
  blog: 'https://votre-blog.com',
  newsletter: 'https://votre-newsletter.com',
}

export default function PendingSharesClient({ pendingShares, user }: PendingSharesClientProps) {
  const router = useRouter()
  const [profileUrls, setProfileUrls] = useState<Record<string, string>>({})
  const [completing, setCompleting] = useState<string | null>(null)
  const [justCompleted, setJustCompleted] = useState<string | null>(null)
  const [creditsEarned, setCreditsEarned] = useState<number | null>(null)

  const handleComplete = async (shareId: string, platform: string) => {
    const profileUrl = profileUrls[shareId]?.trim()

    if (!profileUrl) {
      alert('Veuillez entrer le lien de votre profil social')
      return
    }

    setCompleting(shareId)

    const result = await completePendingShare(shareId, profileUrl)

    if (result.success && result.data) {
      setJustCompleted(shareId)
      setCreditsEarned(result.data.creditsAwarded)

      setTimeout(() => {
        setJustCompleted(null)
        setCreditsEarned(null)
        router.refresh()
      }, 3000)
    } else {
      alert(result.error || 'Erreur lors de la validation')
    }

    setCompleting(null)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/credits/earn">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux partages
            </Button>
          </Link>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Clock className="h-8 w-8 text-amber-500" />
              Partages en Attente
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Ajoutez votre profil social pour recevoir vos crédits
            </p>
          </div>

          {/* Info Box */}
          <Card className="p-4 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700">
            <p className="text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
              <span className="text-lg">💡</span>
              <span>
                Vous avez partagé des posts sans fournir votre profil social.
                Ajoutez-le maintenant pour recevoir vos crédits !
              </span>
            </p>
          </Card>
        </div>

        {/* Success Message */}
        {justCompleted && creditsEarned && (
          <Card className="p-6 mb-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-200 dark:border-green-700 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div>
                <h3 className="text-lg font-bold text-green-900 dark:text-green-100">
                  Crédits ajoutés ! 🎉
                </h3>
                <p className="text-green-700 dark:text-green-300 mt-1">
                  <strong>+{creditsEarned} crédits</strong> ont été ajoutés à votre compte
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Pending Shares List */}
        {pendingShares.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Aucun partage en attente
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Tous vos partages ont été validés. Continuez à partager pour gagner plus de crédits !
            </p>
            <Link href="/dashboard/credits/earn">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Coins className="h-4 w-4 mr-2" />
                Gagner des crédits
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingShares.map((share) => {
              const isCompleted = justCompleted === share.id
              const isCompleting = completing === share.id
              const platform = share.platform || 'unknown'

              return (
                <Card
                  key={share.id}
                  className={`overflow-hidden transition-all ${
                    isCompleted ? 'ring-2 ring-green-500 ring-offset-2' : ''
                  }`}
                >
                  {/* Header avec gradient plateforme */}
                  <div className={`p-3 bg-gradient-to-r ${platformColors[platform] || 'from-gray-500 to-gray-700'} text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{platformIcons[platform] || '📱'}</span>
                        <span className="font-medium capitalize">{platform}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-amber-500/80 text-white border-amber-400">
                          <Clock className="h-3 w-3 mr-1" />
                          En attente
                        </Badge>
                        <Badge className="bg-white/20 text-white border-white/30">
                          +{share.credits_awarded} crédits
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Post info */}
                    {share.post && (
                      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                          {share.post.caption}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <a
                            href={share.post.post_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                          >
                            Voir le post original
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          <span className="text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            Partagé le {formatDate(share.shared_at)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Profile URL Input */}
                    <div className="space-y-2">
                      <Label htmlFor={`profile-${share.id}`} className="flex items-center gap-2 text-sm font-medium">
                        <UserCircle className="h-4 w-4" />
                        Votre profil {platform} <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id={`profile-${share.id}`}
                          type="url"
                          placeholder={platformPlaceholders[platform] || 'https://...'}
                          value={profileUrls[share.id] || ''}
                          onChange={(e) =>
                            setProfileUrls((prev) => ({
                              ...prev,
                              [share.id]: e.target.value,
                            }))
                          }
                          disabled={isCompleting || isCompleted}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => handleComplete(share.id, platform)}
                          disabled={isCompleting || isCompleted || !profileUrls[share.id]?.trim()}
                          className={
                            isCompleted
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-indigo-600 hover:bg-indigo-700'
                          }
                        >
                          {isCompleting ? (
                            'Validation...'
                          ) : isCompleted ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Validé !
                            </>
                          ) : (
                            'Valider'
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Entrez le lien de votre profil pour que je puisse vérifier le partage et vous remercier !
                      </p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Besoin d'aide ?{' '}
            <Link href="/dashboard" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Retour au dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
