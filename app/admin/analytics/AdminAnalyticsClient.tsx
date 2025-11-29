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
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'
import type { AdvancedAnalytics } from '@/lib/actions/admin/analytics'

interface AdminAnalyticsClientProps {
  analytics: AdvancedAnalytics
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))','hsl(var(--chart-5))']

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

      {/* Total Events */}
      <Card>
        <CardHeader>
          <CardTitle>Total Événements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{analytics.totalEvents.toLocaleString()}</div>
        </CardContent>
      </Card>

      {/* Charts */}
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
                        {deviceData.map((entry, index) => (
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

      {/* Top Countries */}
      <Card>
        <CardHeader>
          <CardTitle>Top Pays Visiteurs</CardTitle>
          <CardDescription>Les 10 pays les plus actifs</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.topCountries.length > 0 ? (
            <div className="space-y-2">
              {analytics.topCountries.map((country, index) => (
                <div
                  key={country.country}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-blue-600 dark:text-blue-400">{index + 1}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{country.country.toUpperCase()}</span>
                  </div>
                  <Badge>{country.count} événements</Badge>
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
