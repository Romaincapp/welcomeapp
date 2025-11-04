'use client'

import { useState } from 'react'
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  ArrowLeft,
  Mail,
  ExternalLink,
  Trash2,
  Eye,
  MousePointerClick,
  Share2,
  Smartphone
} from 'lucide-react'
import Link from 'next/link'
import { deleteManager, deleteTip } from '@/lib/actions/admin/moderation'

interface ManagerDetailsClientProps {
  details: {
    client: any
    tips: any[]
    analytics: {
      views: number
      clicks: number
      shares: number
      pwa_installs: number
    }
  }
}

export default function ManagerDetailsClient({ details }: ManagerDetailsClientProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletingTipId, setDeletingTipId] = useState<string | null>(null)

  const { client, tips, analytics } = details

  const handleDeleteManager = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteManager(client.id)
      if (result.success) {
        alert('Gestionnaire supprimé avec succès')
        router.push('/admin/managers')
        router.refresh()
      } else {
        alert(`Erreur : ${result.error}`)
      }
    } catch (error) {
      alert('Erreur lors de la suppression')
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteTip = async (tipId: string) => {
    setDeletingTipId(tipId)
    try {
      const result = await deleteTip(tipId)
      if (result.success) {
        alert('Conseil supprimé avec succès')
        router.refresh()
      } else {
        alert(`Erreur : ${result.error}`)
      }
    } catch (error) {
      alert('Erreur lors de la suppression')
      console.error(error)
    } finally {
      setDeletingTipId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/managers">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {client.name || client.slug}
            </h1>
            <p className="text-gray-600">{client.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href={`mailto:${client.email}`}>
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Contacter
            </Button>
          </a>
          <Link href={`/${client.slug}`} target="_blank">
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Voir welcomebook
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vues</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.views}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clics</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.clicks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partages</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.shares}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Install. PWA</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.pwa_installs}</div>
          </CardContent>
        </Card>
      </div>

      {/* Infos Client */}
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Slug</dt>
              <dd className="mt-1 text-sm text-gray-900">{client.slug}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Date d'inscription</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(client.created_at).toLocaleDateString('fr-FR')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Total conseils</dt>
              <dd className="mt-1 text-sm text-gray-900">{tips.length}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">A partagé</dt>
              <dd className="mt-1">
                <Badge variant={client.has_shared ? 'default' : 'secondary'}>
                  {client.has_shared ? 'Oui' : 'Non'}
                </Badge>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Liste des Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Conseils ({tips.length})</CardTitle>
          <CardDescription>Tous les conseils publiés par ce gestionnaire</CardDescription>
        </CardHeader>
        <CardContent>
          {tips.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tips.map((tip: any) => (
                  <TableRow key={tip.id}>
                    <TableCell className="font-medium">
                      {tip.title_en || tip.title_es || tip.title_nl || 'Sans titre'}
                    </TableCell>
                    <TableCell>
                      {tip.category?.name || 'Non catégorisé'}
                    </TableCell>
                    <TableCell>
                      {new Date(tip.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={deletingTipId === tip.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer ce conseil ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. Le conseil et ses médias seront
                              définitivement supprimés.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteTip(tip.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-gray-500">Aucun conseil</div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Zone de danger</CardTitle>
          <CardDescription>
            Actions irréversibles de modération
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Suppression...' : 'Supprimer ce gestionnaire'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Cela supprimera définitivement le compte de{' '}
                  <strong>{client.email}</strong>, ainsi que tous ses conseils, médias, et
                  données associées.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteManager}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Oui, supprimer définitivement
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
