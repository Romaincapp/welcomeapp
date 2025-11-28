'use client'

import { User } from '@supabase/supabase-js'
import { Client } from '@/types'
import type { ManagerAnalyticsSummary, AnalyticsBreakdown, ViewsOverTime } from '@/lib/actions/manager-analytics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Star, Image, Layers, Calendar, Eye, MousePointer, Share2, Download, Smartphone, Tablet, Laptop } from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { useMemo } from 'react'

interface AnalyticsData {
  stats: {
    totalTips: number
    totalCategories: number
    totalMedia: number
    averageRating: number
    tipsThisMonth: number
    tipsWithRating: number
  }
  tipsByCategory: Array<{
    categoryId: string
    categoryName: string
    count: number
  }>
  timelineData: Array<{
    date: string
    tipId: string
    title: string
  }>
  tips: Array<{
    id: string
    created_at: string | null
    updated_at: string | null
    category_id: string | null
    rating: number | null
    user_ratings_total: number | null
    title: string
  }>
  categories: Array<{
    id: string
    name: string
  }>
  visitorAnalytics: {
    summary: ManagerAnalyticsSummary | null
    breakdown: AnalyticsBreakdown | null
    viewsOverTime: ViewsOverTime[]
  }
}

interface AnalyticsClientProps {
  client: Client
  user: User
  data: AnalyticsData
}

export default function AnalyticsClient({ client, user, data }: AnalyticsClientProps) {
  const { stats, tipsByCategory, timelineData, tips, visitorAnalytics } = data

  // Calculer l'évolution vs mois dernier (placeholder pour MVP)
  const growthPercentage = stats.tipsThisMonth > 0 ? 100 : 0 // Simplifié pour MVP

  // Préparer les données pour le graphique d'évolution (cumulative)
  const evolutionChartData = useMemo(() => {
    if (!timelineData || timelineData.length === 0) return []

    // Grouper par mois et calculer le cumul
    const monthlyData: Record<string, number> = {}
    let cumulative = 0

    timelineData.forEach((tip) => {
      const date = new Date(tip.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      cumulative++
      monthlyData[monthKey] = cumulative
    })

    return Object.entries(monthlyData).map(([month, count]) => ({
      month,
      count,
      label: new Date(month + '-01').toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' })
    }))
  }, [timelineData])

  // Préparer les données pour le graphique par catégorie
  const categoryChartData = useMemo(() => {
    return tipsByCategory
      .filter((cat) => cat.count > 0)
      .map((cat) => ({
        name: cat.categoryName,
        count: cat.count
      }))
      .slice(0, 8) // Limiter à 8 catégories pour la lisibilité
  }, [tipsByCategory])

  // Configuration des couleurs pour les graphiques
  const chartConfig = {
    count: {
      label: "Conseils",
      color: "hsl(var(--chart-1))",
    },
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{client.name}</p>
          </div>
          <Badge variant="outline" className="hidden sm:flex">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </Badge>
        </div>
        {/* Metrics Cards - Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Card 1: Total Tips */}
          <Card className="col-span-1 md:col-span-2 lg:col-span-2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-indigo-100">Total Conseils</CardDescription>
                  <CardTitle className="text-4xl font-bold mt-2">{stats.totalTips}</CardTitle>
                </div>
                <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Layers className="h-8 w-8" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {growthPercentage >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-200" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-200" />
                )}
                <span className="text-sm text-indigo-100">
                  +{stats.tipsThisMonth} ce mois
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Categories */}
          <Card>
            <CardHeader>
              <CardDescription>Catégories Utilisées</CardDescription>
              <CardTitle className="text-3xl font-bold text-indigo-600">{stats.totalCategories}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">sur 9 disponibles</p>
            </CardContent>
          </Card>

          {/* Card 3: Average Rating */}
          <Card>
            <CardHeader>
              <CardDescription>Note Moyenne</CardDescription>
              <CardTitle className="text-3xl font-bold text-yellow-600 flex items-center gap-2">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
                {stats.averageRating > 0 && <Star className="h-5 w-5 fill-yellow-600" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                {stats.tipsWithRating} conseil{stats.tipsWithRating > 1 ? 's' : ''} noté{stats.tipsWithRating > 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          {/* Card 4: Media */}
          <Card className="col-span-1 md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardDescription>Photos & Médias</CardDescription>
              <CardTitle className="text-3xl font-bold text-pink-600">{stats.totalMedia}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4 text-pink-600" />
                <span className="text-sm text-gray-500">
                  {(stats.totalMedia / Math.max(stats.totalTips, 1)).toFixed(1)} par conseil
                </span>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Graphiques Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Line Chart - Évolution des tips */}
          <Card>
            <CardHeader>
              <CardTitle>Évolution des Conseils</CardTitle>
              <CardDescription>Nombre cumulé de conseils ajoutés dans le temps</CardDescription>
            </CardHeader>
            <CardContent>
              {evolutionChartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <LineChart data={evolutionChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={{ fill: '#6366f1', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                  Aucune donnée disponible
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bar Chart - Tips par catégorie */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition par Catégorie</CardTitle>
              <CardDescription>Nombre de conseils par catégorie</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryChartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={categoryChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                  Aucune donnée disponible
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Analytics Visiteurs */}
        {visitorAnalytics.summary && visitorAnalytics.summary.views > 0 && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Eye className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                Analytics Visiteurs
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Découvrez comment les visiteurs interagissent avec votre welcomebook
              </p>
            </div>

            {/* Graphique Évolution Vues/Clics */}
            {visitorAnalytics.viewsOverTime && visitorAnalytics.viewsOverTime.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Évolution des Vues et Clics</CardTitle>
                  <CardDescription>30 derniers jours</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{ views: { label: "Vues", color: "hsl(var(--chart-1))" }, clicks: { label: "Clics", color: "hsl(var(--chart-2))" } }} className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={visitorAnalytics.viewsOverTime}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="views" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} />
                        <Area type="monotone" dataKey="clicks" stackId="2" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Breakdowns Grid */}
            {visitorAnalytics.breakdown && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Device Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5 text-blue-600" />
                      Répartition par Appareil
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-blue-500" />
                          Mobile
                        </span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{visitorAnalytics.breakdown.device.mobile}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Tablet className="h-4 w-4 text-purple-500" />
                          Tablette
                        </span>
                        <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{visitorAnalytics.breakdown.device.tablet}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Laptop className="h-4 w-4 text-green-500" />
                          Desktop
                        </span>
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">{visitorAnalytics.breakdown.device.desktop}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Language/Country Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Langues & Pays</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {visitorAnalytics.breakdown.language.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Langues</p>
                          <div className="space-y-1">
                            {visitorAnalytics.breakdown.language.slice(0, 3).map((lang) => (
                              <div key={lang.language} className="flex justify-between text-sm">
                                <span className="text-gray-700 dark:text-gray-300 uppercase">{lang.language}</span>
                                <span className="font-semibold text-indigo-600 dark:text-indigo-400">{lang.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {visitorAnalytics.breakdown.country.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Pays</p>
                          <div className="space-y-1">
                            {visitorAnalytics.breakdown.country.slice(0, 3).map((country) => (
                              <div key={country.country} className="flex justify-between text-sm">
                                <span className="text-gray-700 dark:text-gray-300 uppercase">{country.country}</span>
                                <span className="font-semibold text-indigo-600 dark:text-indigo-400">{country.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {visitorAnalytics.breakdown.country.length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">Données pays non disponibles</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}

        {/* Suggestions Intelligentes */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
              <TrendingUp className="h-5 w-5" />
              Suggestions pour Optimiser votre Welcomebook
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Benchmark fixe pour MVP */}
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                📊 Moyenne recommandée : <strong>15-25 conseils</strong>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.totalTips < 15 && `Ajoutez encore ${15 - stats.totalTips} conseils pour atteindre la moyenne`}
                {stats.totalTips >= 15 && stats.totalTips <= 25 && '✓ Vous êtes dans la moyenne recommandée !'}
                {stats.totalTips > 25 && '🌟 Excellent ! Votre welcomebook est très complet'}
              </p>
            </div>

            {stats.totalCategories < 5 && (
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  🎯 Diversifiez vos catégories
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Vous utilisez {stats.totalCategories} catégories. Essayez d'en utiliser au moins 5 pour un welcomebook équilibré.
                </p>
              </div>
            )}

            {stats.averageRating > 0 && stats.averageRating >= 4.5 && (
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  ⭐ Excellente sélection !
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Vos conseils ont une note moyenne de {stats.averageRating.toFixed(1)}/5. Continuez comme ça !
                </p>
              </div>
            )}

            {stats.totalMedia === 0 && (
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  📸 Ajoutez des photos
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Les welcomebooks avec photos sont 3x plus engageants. Ajoutez des images à vos conseils !
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
