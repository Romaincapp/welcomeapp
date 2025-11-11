'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import {
  Users,
  FileText,
  Image,
  Eye,
  MousePointerClick,
  Share2,
  Smartphone,
  TrendingUp,
  Star,
  QrCode,
  ExternalLink,
  Mail,
  Bot
} from 'lucide-react'
import Link from 'next/link'
import type {
  PlatformOverviewStats,
  SignupEvolutionData,
  TopWelcomebook
} from '@/lib/actions/admin/stats'

interface AdminOverviewClientProps {
  stats: PlatformOverviewStats | null
  signupsEvolution: SignupEvolutionData[]
  topWelcomebooks: TopWelcomebook[]
}

export default function AdminOverviewClient({
  stats,
  signupsEvolution,
  topWelcomebooks
}: AdminOverviewClientProps) {
  // Formater les données pour le chart
  const chartData = signupsEvolution.map((item) => ({
    date: new Date(item.signup_date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short'
    }),
    signups: item.new_signups
  }))

  // Calculer le pourcentage de clients actifs
  const activePercentage = stats
    ? Math.round((stats.active_clients / stats.total_clients) * 100)
    : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Vue d&apos;ensemble de la plateforme
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Statistiques globales et métriques clés de WelcomeApp
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Link
            href="/admin/campaigns"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm whitespace-nowrap"
          >
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Campagnes Email</span>
            <span className="sm:hidden">Campagnes</span>
          </Link>
          <Link
            href="/admin/automations"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm whitespace-nowrap"
          >
            <Bot className="h-4 w-4" />
            Automations
          </Link>
        </div>
      </div>

      {/* Metrics Cards - Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Clients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_clients || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.active_clients || 0} actifs ({activePercentage}%)
            </p>
          </CardContent>
        </Card>

        {/* Total Tips */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conseils</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_tips || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.total_media || 0} médias associés
            </p>
          </CardContent>
        </Card>

        {/* Total Views */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vues</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.total_views.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.total_clicks || 0} clics
            </p>
          </CardContent>
        </Card>

        {/* Total Shares */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partages</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_shares || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.total_pwa_installs || 0} installations PWA
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Metrics secondaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4" />
              Rating Moyen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.average_rating ? stats.average_rating.toFixed(1) : 'N/A'}
              {stats?.average_rating && <span className="text-sm text-yellow-500">★</span>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              QR Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_qr_codes || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Sections Sécurisées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_secure_sections || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart - Évolution Signups */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution des inscriptions</CardTitle>
          <CardDescription>90 derniers jours</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ChartContainer
              config={{
                signups: {
                  label: 'Inscriptions',
                  color: 'hsl(var(--chart-1))'
                }
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="signups"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Pas de données disponibles
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Welcomebooks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Top Welcomebooks</CardTitle>
            <CardDescription>Classés par nombre de conseils et vues</CardDescription>
          </div>
          <Link href="/admin/managers">
            <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
              Voir tous
            </Badge>
          </Link>
        </CardHeader>
        <CardContent>
          {topWelcomebooks.length > 0 ? (
            <div className="space-y-4">
              {topWelcomebooks.map((welcomebook, index) => (
                <div
                  key={welcomebook.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 truncate">
                          {welcomebook.welcomebook_name || welcomebook.slug}
                        </p>
                        <Link
                          href={`/${welcomebook.slug}`}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-700 flex-shrink-0"
                        >
                          <ExternalLink size={14} />
                        </Link>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{welcomebook.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-gray-900">{welcomebook.total_tips}</p>
                      <p className="text-xs sm:text-sm text-gray-500">tips</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-900">{welcomebook.total_views}</p>
                      <p className="text-xs sm:text-sm text-gray-500">vues</p>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {welcomebook.has_shared && (
                        <Badge variant="outline" className="text-xs">
                          Partagé
                        </Badge>
                      )}
                      {welcomebook.has_qr_code && (
                        <Badge variant="outline" className="text-xs">
                          QR
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucun welcomebook trouvé
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
