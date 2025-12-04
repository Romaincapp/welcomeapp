'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts'
import { Eye, MousePointerClick, Share2, Smartphone, Clock, Users, TrendingDown, Activity, ArrowRight } from 'lucide-react'
import type { AdvancedAnalytics } from '@/lib/actions/admin/analytics'

interface AdminAnalyticsClientProps {
  analytics: AdvancedAnalytics
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))']

const SHARE_METHOD_LABELS: Record<string, string> = {
  'copy_link': 'Copie du lien',
  'download_qr': 'Téléchargement QR',
  'email': 'Email',
  'unknown': 'Autre',
}

function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (remainingSeconds === 0) {
    return `${minutes}min`
  }
  return `${minutes}min ${remainingSeconds}s`
}

function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, '0')}h`
}

export default function AdminAnalyticsClient({ analytics }: AdminAnalyticsClientProps) {
  // Préparer les données pour les charts
  const eventTypeData = Object.entries(analytics.eventsByType).map(([type, count]) => ({
    type,
    count
  }))

  const deviceData = Object.entries(analytics.eventsByDevice).map(([device, count]) => ({
    device,
    count
  }))

  const shareData = analytics.shareBreakdown.map(item => ({
    name: SHARE_METHOD_LABELS[item.method] || item.method,
    value: item.count,
    percentage: item.percentage,
  }))

  // Trouver l'heure de pointe
  const peakHour = analytics.peakHours.reduce((max, current) =>
    current.count > max.count ? current : max
  , { hour: 0, count: 0 })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Analytics Plateforme
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Analyse détaillée des {analytics.totalEvents.toLocaleString()} événements trackés
        </p>
      </div>

      {/* ========================================================================= */}
      {/* Session Stats Cards */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sessions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.sessionStats.total_sessions.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Taux de rebond</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.sessionStats.bounce_rate}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Durée moy.</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatDuration(analytics.sessionStats.avg_duration_seconds)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Actions/session</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.sessionStats.avg_events_per_session}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* Conversion Funnel */}
      {/* ========================================================================= */}
      <Card>
        <CardHeader>
          <CardTitle>Funnel de Conversion</CardTitle>
          <CardDescription>Parcours des visiteurs de la vue à l&apos;action</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Views */}
            <div className="flex-1 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-2">
                <Eye className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.conversionFunnel.views.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Vues</p>
            </div>

            {/* Arrow + Rate */}
            <div className="flex flex-col items-center">
              <ArrowRight className="w-6 h-6 text-gray-400 hidden sm:block" />
              <Badge variant="secondary" className="mt-1">
                {analytics.conversionFunnel.view_to_click_rate}%
              </Badge>
            </div>

            {/* Clicks */}
            <div className="flex-1 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full mb-2">
                <MousePointerClick className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.conversionFunnel.clicks.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Clics</p>
            </div>

            {/* Arrow + Rate */}
            <div className="flex flex-col items-center">
              <ArrowRight className="w-6 h-6 text-gray-400 hidden sm:block" />
              <Badge variant="secondary" className="mt-1">
                {analytics.conversionFunnel.click_to_share_rate}%
              </Badge>
            </div>

            {/* Shares */}
            <div className="flex-1 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full mb-2">
                <Share2 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.conversionFunnel.shares.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Partages</p>
            </div>

            {/* Arrow + Rate */}
            <div className="flex flex-col items-center">
              <ArrowRight className="w-6 h-6 text-gray-400 hidden sm:block" />
              <Badge variant="secondary" className="mt-1">
                {analytics.conversionFunnel.view_to_pwa_rate}%
              </Badge>
            </div>

            {/* PWA Installs */}
            <div className="flex-1 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-2">
                <Smartphone className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.conversionFunnel.pwa_installs.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">PWA Installs</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* Peak Hours + Share Breakdown */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Heures de Pointe</CardTitle>
            <CardDescription>
              Pic d&apos;activité : {formatHour(peakHour.hour)} ({peakHour.count} événements)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            <div className="overflow-x-auto">
              <ChartContainer
                config={{
                  count: {
                    label: 'Événements',
                    color: 'hsl(var(--chart-1))'
                  }
                }}
                className="h-[250px] w-full min-w-[500px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.peakHours}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: 10 }}
                      tickFormatter={formatHour}
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      labelFormatter={(value) => formatHour(value as number)}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.3}
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Share Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Méthodes de Partage</CardTitle>
            <CardDescription>Comment les visiteurs partagent</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            {shareData.length > 0 ? (
              <div className="flex flex-col lg:flex-row items-center gap-4">
                <div className="h-[200px] w-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={shareData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                      >
                        {shareData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {shareData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
                        <Badge variant="outline">{item.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                Pas de données de partage
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* Top Tips Cliqués */}
      {/* ========================================================================= */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Conseils Cliqués</CardTitle>
          <CardDescription>Les conseils les plus consultés sur la plateforme</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.topTips.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Conseil</TableHead>
                  <TableHead>Welcomebook</TableHead>
                  <TableHead className="text-right">Clics</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.topTips.map((tip, index) => (
                  <TableRow key={tip.tip_id}>
                    <TableCell>
                      <Badge variant={index < 3 ? 'default' : 'secondary'}>
                        {index + 1}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {tip.tip_title}
                    </TableCell>
                    <TableCell className="text-gray-500 dark:text-gray-400 max-w-[150px] truncate">
                      {tip.welcomebook_name}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {tip.clicks}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Pas encore de clics sur les conseils
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* Engagement par Pays */}
      {/* ========================================================================= */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement par Pays</CardTitle>
          <CardDescription>Taux d&apos;engagement (clics/vues) par pays</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.countryEngagement.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pays</TableHead>
                  <TableHead className="text-right">Vues</TableHead>
                  <TableHead className="text-right">Clics</TableHead>
                  <TableHead className="text-right">Engagement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.countryEngagement.map((country) => (
                  <TableRow key={country.country}>
                    <TableCell className="font-medium">
                      {country.country.toUpperCase()}
                    </TableCell>
                    <TableCell className="text-right">{country.views}</TableCell>
                    <TableCell className="text-right">{country.clicks}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={country.engagement_rate >= 50 ? 'default' : country.engagement_rate >= 20 ? 'secondary' : 'outline'}
                      >
                        {country.engagement_rate}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Pas de données pays disponibles
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* Charts existants */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Événements par Type</CardTitle>
            <CardDescription>Répartition des événements trackés</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            {eventTypeData.length > 0 ? (
              <div className="overflow-x-auto">
                <ChartContainer
                  config={{
                    count: {
                      label: 'Nombre',
                      color: 'hsl(var(--chart-1))'
                    }
                  }}
                  className="h-[300px] w-full min-w-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={eventTypeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="hsl(var(--chart-1))" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                Pas de données
              </div>
            )}
          </CardContent>
        </Card>

        {/* Events by Device */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par Device</CardTitle>
            <CardDescription>Mobile vs Desktop</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            {deviceData.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="h-[300px] w-full min-w-[400px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceData}
                        dataKey="count"
                        nameKey="device"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {deviceData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                Pas de données
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Languages */}
      <Card>
        <CardHeader>
          <CardTitle>Top Langues Visiteurs</CardTitle>
          <CardDescription>Les 10 langues les plus utilisées</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.topLanguages.length > 0 ? (
            <div className="space-y-2">
              {analytics.topLanguages.map((lang, index) => (
                <div
                  key={lang.language}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-blue-600 dark:text-blue-400">{index + 1}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{lang.language.toUpperCase()}</span>
                  </div>
                  <Badge>{lang.count} événements</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">Pas de données</div>
          )}
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Sessions Récentes</CardTitle>
          <CardDescription>20 dernières sessions visiteurs</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.recentSessions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session ID</TableHead>
                  <TableHead>Événements</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Langue</TableHead>
                  <TableHead>Pays</TableHead>
                  <TableHead>Première activité</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.recentSessions.map((session) => (
                  <TableRow key={session.session_id}>
                    <TableCell className="font-mono text-xs">
                      {session.session_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>{session.event_count}</TableCell>
                    <TableCell>{session.device_type || 'N/A'}</TableCell>
                    <TableCell>{session.user_language || 'N/A'}</TableCell>
                    <TableCell>{session.user_country || 'N/A'}</TableCell>
                    <TableCell>
                      {new Date(session.first_event).toLocaleString('fr-FR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">Aucune session</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
