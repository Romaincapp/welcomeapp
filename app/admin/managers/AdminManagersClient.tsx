'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Download, ExternalLink, Mail, Coins } from 'lucide-react'
import Link from 'next/link'
import type { Manager } from '@/lib/actions/admin/managers'
import { generateGmailComposeUrl, generateManagerContactTemplate } from '@/lib/utils/email-helpers'

interface AdminManagersClientProps {
  initialManagers: Manager[]
}

export default function AdminManagersClient({ initialManagers }: AdminManagersClientProps) {
  const [managers, setManagers] = useState(initialManagers)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [isExporting, setIsExporting] = useState(false)

  // Filtrer les managers côté client pour réactivité instantanée
  const filteredManagers = managers.filter((manager) => {
    const matchesSearch =
      manager.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (manager.name && manager.name.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory =
      categoryFilter === 'all' || manager.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  // Fonction d'export CSV
  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      // Importer dynamiquement la fonction
      const { exportManagerEmails } = await import('@/lib/actions/admin/managers')
      const data = await exportManagerEmails()

      // Générer le CSV
      const csvHeaders = 'Email,Nom,Slug,Date inscription,Nombre de tips\n'
      const csvRows = data
        .map(
          (row) =>
            `"${row.email}","${row.name || ''}","${row.slug}","${new Date(
              row.created_at
            ).toLocaleDateString('fr-FR')}","${row.total_tips}"`
        )
        .join('\n')

      const csvContent = csvHeaders + csvRows

      // Télécharger le fichier
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `welcomeapp-managers-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting CSV:', error)
      alert('Erreur lors de l\'export CSV')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestionnaires</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Liste complète des {managers.length} gestionnaires inscrits
        </p>
      </div>

      {/* Filtres et Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
          <CardDescription>Rechercher et filtrer les gestionnaires</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher par email, slug ou nom..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtre catégorie */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                <SelectItem value="Inactif">Inactif</SelectItem>
                <SelectItem value="Débutant">Débutant</SelectItem>
                <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                <SelectItem value="Avancé">Avancé</SelectItem>
                <SelectItem value="Expert">Expert</SelectItem>
              </SelectContent>
            </Select>

            {/* Bouton Export */}
            <Button
              onClick={handleExportCSV}
              disabled={isExporting}
              variant="outline"
              className="w-full md:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Export en cours...' : 'Exporter CSV'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Résultats */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredManagers.length} gestionnaire{filteredManagers.length > 1 ? 's' : ''}
          </CardTitle>
          <CardDescription>
            {searchTerm || categoryFilter !== 'all'
              ? 'Résultats filtrés'
              : 'Tous les gestionnaires'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredManagers.length > 0 ? (
            <div className="overflow-x-auto -mx-6 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Email</TableHead>
                      <TableHead className="min-w-[120px]">Slug</TableHead>
                      <TableHead className="min-w-[100px]">Catégorie</TableHead>
                      <TableHead className="min-w-[60px]">Tips</TableHead>
                      <TableHead className="min-w-[60px]">Vues</TableHead>
                      <TableHead className="min-w-[80px]">
                        <span className="flex items-center gap-1">
                          <Coins className="h-3 w-3" />
                          Crédits
                        </span>
                      </TableHead>
                      <TableHead className="min-w-[120px]">Date inscription</TableHead>
                      <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredManagers.map((manager) => (
                      <TableRow key={manager.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-[180px]">{manager.email}</span>
                            <a
                              href={(() => {
                                const { subject, body } = generateManagerContactTemplate(manager.name, manager.slug);
                                return generateGmailComposeUrl(manager.email, subject, body);
                              })()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 flex-shrink-0"
                              title="Contacter via Gmail"
                            >
                              <Mail size={14} />
                            </a>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/${manager.slug}`}
                            target="_blank"
                            className="flex items-center gap-2 text-blue-600 hover:underline"
                          >
                            <span className="truncate max-w-[100px]">{manager.slug}</span>
                            <ExternalLink size={14} className="flex-shrink-0" />
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              manager.category === 'Expert'
                                ? 'default'
                                : manager.category === 'Inactif'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {manager.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{manager.total_tips || 0}</TableCell>
                        <TableCell>{manager.total_views || 0}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${
                            (manager.credits_balance || 0) > 50
                              ? 'text-green-600'
                              : (manager.credits_balance || 0) > 0
                                ? 'text-amber-600'
                                : 'text-gray-400'
                          }`}>
                            {manager.credits_balance || 0}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(manager.created_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/managers/${manager.id}`}>
                            <Button variant="outline" size="sm">
                              Détails
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Aucun gestionnaire trouvé
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
