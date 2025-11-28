'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Coins, TrendingUp, Clock, AlertTriangle, Gift } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { CreditBalance } from '@/lib/actions/credits'
import {
  estimateDaysRemaining,
  getCreditStatusLevel,
  getCreditStatusColor,
  getCreditStatusBorderColor,
  getCreditStatusBgColor,
  getCreditWarningMessage,
  getAccelerationPercentage,
  formatInterval,
  getConsumptionIntervalHours
} from '@/lib/utils/credit-consumption'
import CreditSystemInfoModal from './CreditSystemInfoModal'

interface CreditBalanceCardProps {
  balance: CreditBalance
  pendingCredits?: number // Nombre de crédits en attente
  pendingSharesCount?: number // Nombre de partages en attente
}

export default function CreditBalanceCard({ balance, pendingCredits = 0, pendingSharesCount = 0 }: CreditBalanceCardProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </Card>
    )
  }

  const daysRemaining = estimateDaysRemaining(
    balance.credits_balance,
    balance.welcomebook_count
  )
  const statusLevel = getCreditStatusLevel(daysRemaining)
  const statusColor = getCreditStatusColor(statusLevel)
  const statusBgColor = getCreditStatusBgColor(statusLevel)
  const warningMessage = getCreditWarningMessage(daysRemaining)
  const accelerationPercent = getAccelerationPercentage(balance.welcomebook_count)
  const consumptionInterval = formatInterval(
    getConsumptionIntervalHours(balance.welcomebook_count)
  )

  // Calcul du pourcentage pour la barre de progression (max 150 jours pour une barre pleine)
  const maxCreditsForFullBar = 150
  const progressPercentage = Math.min(
    (balance.credits_balance / maxCreditsForFullBar) * 100,
    100
  )

  // Badge de statut de compte
  const getAccountStatusBadge = () => {
    switch (balance.account_status) {
      case 'active':
        return <Badge className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700">🟢 Actif</Badge>
      case 'grace_period':
        return <Badge className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700">🟡 Période de grâce</Badge>
      case 'suspended':
        return <Badge className="bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-700">🟠 Suspendu</Badge>
      case 'to_delete':
        return <Badge className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700">🔴 À supprimer</Badge>
      default:
        return null
    }
  }

  return (
    <Card className={`p-6 border-2 ${getCreditStatusBorderColor(statusLevel)} ${statusBgColor}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Coins className={`${statusColor} h-6 w-6`} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mes Crédits</h3>
          <CreditSystemInfoModal />
        </div>
        {getAccountStatusBadge()}
      </div>

      {/* Solde principal */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2 mb-2">
          <span className={`text-4xl font-bold ${statusColor}`}>
            {balance.credits_balance}
          </span>
          <span className="text-gray-600 dark:text-gray-400">crédits</span>
        </div>

        {/* Barre de progression */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              statusLevel === 'high'
                ? 'bg-green-500'
                : statusLevel === 'medium'
                ? 'bg-yellow-500'
                : statusLevel === 'low'
                ? 'bg-orange-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Estimation jours restants */}
        <div className="flex items-center gap-2 mt-3">
          <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {daysRemaining > 0 ? (
              <>
                Environ <strong>{daysRemaining} jours</strong> restants
              </>
            ) : (
              <strong className="text-red-600 dark:text-red-400">Crédit épuisé</strong>
            )}
          </span>
        </div>
      </div>

      {/* Infos consommation accélérée si plusieurs welcomebooks */}
      {balance.welcomebook_count > 1 && (
        <div className="mb-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>{balance.welcomebook_count} welcomebooks</strong>
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                Consommation accélérée : <strong>+{accelerationPercent}%</strong> (1 crédit toutes les {consumptionInterval})
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Message d'alerte si crédit bas */}
      {warningMessage && (
        <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-orange-300 dark:border-orange-700">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-orange-800 dark:text-orange-300">{warningMessage}</p>
          </div>
        </div>
      )}

      {/* Notification crédits en attente */}
      {pendingSharesCount > 0 && pendingCredits > 0 && (
        <Link href="/dashboard/credits/pending">
          <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-lg border-2 border-amber-300 dark:border-amber-600 cursor-pointer hover:border-amber-400 dark:hover:border-amber-500 transition-colors">
            <div className="flex items-start gap-2">
              <Gift className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0 animate-bounce" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                  +{pendingCredits} crédits en attente !
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  {pendingSharesCount} partage{pendingSharesCount > 1 ? 's' : ''} à compléter → Cliquez pour récupérer vos crédits
                </p>
              </div>
              <Badge className="bg-amber-500 text-white border-amber-600 text-xs">
                ⏳ {pendingSharesCount}
              </Badge>
            </div>
          </div>
        </Link>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Link href="/dashboard/credits/earn" className="flex-1">
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
            <Coins className="h-4 w-4 mr-2" />
            Gagner des crédits
          </Button>
        </Link>

        <Link href="/dashboard/credits/history">
          <Button variant="outline" className="whitespace-nowrap">
            Historique
          </Button>
        </Link>
      </div>

      {/* Stats lifetime */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Total gagné</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {balance.credits_lifetime_earned} crédits
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Total dépensé</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {balance.total_spent} crédits
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
