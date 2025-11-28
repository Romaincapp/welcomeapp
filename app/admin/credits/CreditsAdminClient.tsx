'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Coins,
  ExternalLink,
  Trash2,
  TrendingUp,
  Calendar,
  Share2,
  UserCircle,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react'
import type { SocialShareRecord, SocialSharesStats } from '@/lib/actions/admin/credits'
import { revokeShareCredits } from '@/lib/actions/admin/credits'

interface CreditsAdminClientProps {
  initialShares: SocialShareRecord[]
  initialStats: SocialSharesStats
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
  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
  linkedin: 'bg-blue-600',
  facebook: 'bg-blue-700',
  twitter: 'bg-sky-500',
  blog: 'bg-gray-600',
  newsletter: 'bg-green-600',
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'À l\'instant'
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays < 7) return `Il y a ${diffDays}j`
  return date.toLocaleDateString('fr-FR')
}

export default function CreditsAdminClient({ initialShares, initialStats }: CreditsAdminClientProps) {
  const router = useRouter()
  const [shares, setShares] = useState(initialShares)
  const [stats] = useState(initialStats)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [revokeDialog, setRevokeDialog] = useState<SocialShareRecord | null>(null)
  const [revokeReason, setRevokeReason] = useState('')
  const [isRevoking, setIsRevoking] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const handleRevoke = async () => {
    if (!revokeDialog || !revokeReason.trim()) return

    setIsRevoking(true)
    try {
      const result = await revokeShareCredits(revokeDialog.id, revokeReason)
      if (result.success) {
        // Retirer de la liste locale
        setShares((prev) => prev.filter((s) => s.id !== revokeDialog.id))
        setRevokeDialog(null)
        setRevokeReason('')
        router.refresh()
      } else {
        alert(result.error || 'Erreur lors de la révocation')
      }
    } catch (error) {
      console.error('Error revoking credits:', error)
      alert('Erreur lors de la révocation')
    } finally {
      setIsRevoking(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Admin
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Coins className="h-8 w-8 text-indigo-600" />
            Modération Crédits
          </h1>
          <p className="mt-2 text-gray-600">
            Visualisez et modérez les partages sociaux (système trust-based)
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aujourd'hui</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
            <p className="text-xs text-muted-foreground">partages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cette semaine</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.this_week}</div>
            <p className="text-xs text-muted-foreground">partages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ce mois</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.this_month}</div>
            <p className="text-xs text-muted-foreground">partages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crédits Distribués</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{stats.total_credits_distributed}</div>
            <p className="text-xs text-muted-foreground">total</p>
          </CardContent>
        </Card>
      </div>

      {/* Table des partages */}
      <Card>
        <CardHeader>
          <CardTitle>Partages Récents</CardTitle>
          <CardDescription>
            {shares.length} partages • Système trust-based (crédits immédiats)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {shares.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Share2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Aucun partage pour le moment</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Plateforme</TableHead>
                  <TableHead>Profil Social</TableHead>
                  <TableHead className="text-right">Crédits</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shares.map((share) => (
                  <TableRow key={share.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-sm">{share.user_email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${platformColors[share.platform]} text-white`}>
                        {platformIcons[share.platform]} {share.platform}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {share.social_profile_url ? (
                        <a
                          href={share.social_profile_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-indigo-600 hover:underline text-sm"
                        >
                          <UserCircle className="h-4 w-4" />
                          Voir profil
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">Non renseigné</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="font-mono">
                        +{share.credits_awarded}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {formatRelativeTime(share.shared_at)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {share.post_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(share.post_url, '_blank')}
                            title="Voir le post original"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setRevokeDialog(share)}
                          title="Révoquer les crédits"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Revoke Dialog */}
      <AlertDialog open={!!revokeDialog} onOpenChange={(open) => !open && setRevokeDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Révoquer les crédits ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action va retirer <strong>{revokeDialog?.credits_awarded} crédits</strong> du compte de{' '}
              <strong>{revokeDialog?.user_email}</strong>.
              <br /><br />
              Le partage sera supprimé de l'historique et une transaction négative sera créée.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="my-4 space-y-2">
            <Label htmlFor="revoke-reason">Raison de la révocation *</Label>
            <Input
              id="revoke-reason"
              placeholder="Ex: Partage non effectué, abus détecté..."
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              disabled={!revokeReason.trim() || isRevoking}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRevoking ? 'Révocation...' : 'Révoquer les crédits'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
