'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CreditTransaction, CreditRequest } from '@/types'

interface HistoryClientProps {
  transactions: CreditTransaction[]
  requests: CreditRequest[]
  userEmail: string
}

type FilterType = 'all' | 'earn' | 'spend' | 'pending' | 'approved' | 'rejected'

const transactionTypeLabels: Record<string, string> = {
  earn_social: '📱 Partage social',
  spend_daily: '⏱️ Consommation quotidienne',
  manual_add: '➕ Ajout manuel (admin)',
  manual_remove: '➖ Retrait manuel (admin)',
  initial_bonus: '🎁 Bonus initial',
  purchase: '💳 Achat de crédits',
}

// Descriptions simplifiées pour l'utilisateur (masque les détails techniques)
const getSimplifiedDescription = (transaction: CreditTransaction): string | null => {
  // Masquer les descriptions techniques pour les consommations quotidiennes
  if (transaction.transaction_type === 'spend_daily') {
    return null // Pas besoin de description, le label suffit
  }

  // Pour les achats, afficher le nom du pack si disponible
  if (transaction.transaction_type === 'purchase') {
    const packMatch = transaction.description?.match(/Achat (\w+)/)
    if (packMatch) {
      return `Pack ${packMatch[1]}`
    }
    return null
  }

  // Pour les autres, garder la description si elle ne contient pas de termes techniques
  const technicalTerms = ['pg_cron', 'pg-cron', 'cron', 'interval', 'trigger', 'function']
  if (transaction.description && technicalTerms.some(term => transaction.description?.toLowerCase().includes(term))) {
    return null
  }

  return transaction.description || null
}

const platformIcons: Record<string, string> = {
  linkedin: '🔵',
  facebook: '📘',
  instagram: '📸',
  twitter: '🐦',
  blog: '✍️',
  newsletter: '📧',
}

export default function HistoryClient({ transactions, requests, userEmail }: HistoryClientProps) {
  const [filter, setFilter] = useState<FilterType>('all')

  // Fusion transactions + requests pour affichage chronologique
  const combinedItems = useMemo(() => {
    const items: Array<{ type: 'transaction' | 'request'; data: any; date: string }> = []

    // Ajouter transactions
    transactions.forEach((t) => {
      items.push({
        type: 'transaction',
        data: t,
        date: t.created_at,
      })
    })

    // Ajouter requests
    requests.forEach((r) => {
      items.push({
        type: 'request',
        data: r,
        date: r.created_at,
      })
    })

    // Trier par date décroissante
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Filtrer
    if (filter === 'all') return items
    if (filter === 'earn') return items.filter((i) => i.type === 'transaction' && i.data.transaction_type === 'earn_social')
    if (filter === 'spend') return items.filter((i) => i.type === 'transaction' && i.data.transaction_type === 'spend_daily')
    if (filter === 'pending') return items.filter((i) => i.type === 'request' && i.data.status === 'pending')
    if (filter === 'approved') return items.filter((i) => i.type === 'request' && (i.data.status === 'approved' || i.data.status === 'auto_approved'))
    if (filter === 'rejected') return items.filter((i) => i.type === 'request' && i.data.status === 'rejected')

    return items
  }, [transactions, requests, filter])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Aujourd\'hui'
    if (days === 1) return 'Hier'
    if (days < 7) return `Il y a ${days} jours`
    if (days < 30) return `Il y a ${Math.floor(days / 7)} semaines`
    return date.toLocaleDateString('fr-FR')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au dashboard
            </Button>
          </Link>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Clock className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                Historique des Crédits
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Consultez toutes vos transactions et demandes de crédits
              </p>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex items-center gap-3">
            <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">📊 Tout afficher</SelectItem>
                <SelectItem value="earn">📱 Gains (partages)</SelectItem>
                <SelectItem value="spend">⏱️ Dépenses (quotidiennes)</SelectItem>
                <SelectItem value="pending">⏳ En attente</SelectItem>
                <SelectItem value="approved">✅ Approuvées</SelectItem>
                <SelectItem value="rejected">❌ Refusées</SelectItem>
              </SelectContent>
            </Select>

            <span className="text-sm text-gray-600 dark:text-gray-400">
              {combinedItems.length} {combinedItems.length > 1 ? 'éléments' : 'élément'}
            </span>
          </div>
        </div>

        {/* Liste */}
        <div className="space-y-3">
          {combinedItems.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">Aucun élément trouvé</p>
            </Card>
          ) : (
            combinedItems.map((item, index) => (
              <Card key={index} className="p-5 hover:shadow-md transition-shadow">
                {item.type === 'transaction' ? (
                  // Transaction
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-3 rounded-full ${item.data.amount > 0 ? 'bg-green-100 dark:bg-green-900/50' : 'bg-gray-100 dark:bg-gray-700'}`}>
                        {item.data.amount > 0 ? (
                          <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {transactionTypeLabels[item.data.transaction_type] || item.data.transaction_type}
                          </p>
                          {item.data.metadata?.platform && (
                            <span className="text-lg" title={item.data.metadata.platform}>
                              {platformIcons[item.data.metadata.platform as string]}
                            </span>
                          )}
                        </div>
                        {getSimplifiedDescription(item.data) && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{getSimplifiedDescription(item.data)}</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{formatDate(item.data.created_at)}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-2xl font-bold ${item.data.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        {item.data.amount > 0 ? '+' : ''}{item.data.amount}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Solde: {item.data.balance_after}</p>
                    </div>
                  </div>
                ) : (
                  // Request
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-3 rounded-full ${
                        item.data.status === 'approved' || item.data.status === 'auto_approved'
                          ? 'bg-green-100 dark:bg-green-900/50'
                          : item.data.status === 'rejected'
                          ? 'bg-red-100 dark:bg-red-900/50'
                          : 'bg-yellow-100 dark:bg-yellow-900/50'
                      }`}>
                        {item.data.status === 'approved' || item.data.status === 'auto_approved' ? (
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : item.data.status === 'rejected' ? (
                          <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            Demande de crédits
                          </p>
                          {item.data.platform && (
                            <span className="text-lg" title={item.data.platform}>
                              {platformIcons[item.data.platform]}
                            </span>
                          )}
                          <Badge
                            variant={
                              item.data.status === 'approved' || item.data.status === 'auto_approved'
                                ? 'default'
                                : item.data.status === 'rejected'
                                ? 'destructive'
                                : 'secondary'
                            }
                            className="ml-2"
                          >
                            {item.data.status === 'pending' && '⏳ En attente'}
                            {item.data.status === 'approved' && '✅ Approuvée'}
                            {item.data.status === 'auto_approved' && '⚡ Auto-approuvée'}
                            {item.data.status === 'rejected' && '❌ Refusée'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.data.platform} · {item.data.post_type} · Score: {item.data.personalization_score}%
                        </p>
                        {item.data.rejection_reason && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            Raison du refus : {item.data.rejection_reason}
                          </p>
                        )}
                        {item.data.proof_url && (
                          <a
                            href={item.data.proof_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-1 inline-block"
                          >
                            Voir le post →
                          </a>
                        )}
                        <p className="text-xs text-gray-500 mt-1">{formatDate(item.data.created_at)}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-2xl font-bold ${
                        item.data.status === 'approved' || item.data.status === 'auto_approved'
                          ? 'text-green-600 dark:text-green-400'
                          : item.data.status === 'rejected'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-yellow-600 dark:text-yellow-400'
                      }`}>
                        +{item.data.credits_requested}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">crédits</p>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
