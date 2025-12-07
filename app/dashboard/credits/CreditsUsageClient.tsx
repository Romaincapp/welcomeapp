'use client'

import Link from 'next/link'
import { ArrowLeft, Gift, History, Clock, Coins, TrendingUp, Zap, CreditCard } from 'lucide-react'
import CreditBalanceCard from '@/components/credits/CreditBalanceCard'
import type { CreditBalance } from '@/lib/actions/credits'

interface CreditsUsageClientProps {
  creditBalance: CreditBalance | null
  pendingCredits: number
  pendingSharesCount: number
}

export default function CreditsUsageClient({
  creditBalance,
  pendingCredits,
  pendingSharesCount,
}: CreditsUsageClientProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition mb-4"
          >
            <ArrowLeft size={20} />
            <span>Retour au dashboard</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Mes Crédits
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Suivez votre consommation et gagnez des crédits gratuits
          </p>
        </div>

        {/* Credit Balance Card */}
        {creditBalance ? (
          <div className="mb-8">
            <CreditBalanceCard
              balance={creditBalance}
              pendingCredits={pendingCredits}
              pendingSharesCount={pendingSharesCount}
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center mb-8 border border-gray-200 dark:border-gray-700">
            <Coins className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Impossible de charger vos crédits. Veuillez réessayer.
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/dashboard/billing"
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-2 border-indigo-200 dark:border-indigo-800 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-md transition group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/70 transition">
                <CreditCard className="text-indigo-600 dark:text-indigo-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Acheter des crédits</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Recharger mon compte</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/credits/earn"
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-2 border-transparent hover:border-green-500 dark:hover:border-green-400 hover:shadow-md transition group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-900/70 transition">
                <Gift className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Gagner des crédits</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Partager sur les réseaux</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/credits/history"
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/70 transition">
                <History className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Historique</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Voir les transactions</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/credits/pending"
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-2 border-transparent hover:border-amber-500 dark:hover:border-amber-400 hover:shadow-md transition group relative"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-lg group-hover:bg-amber-200 dark:group-hover:bg-amber-900/70 transition">
                <Clock className="text-amber-600 dark:text-amber-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">En attente</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Partages en validation</p>
              </div>
            </div>
            {pendingSharesCount > 0 && (
              <span className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {pendingSharesCount}
              </span>
            )}
          </Link>
        </div>

        {/* Info Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Zap className="text-indigo-500" size={20} />
            Comment fonctionne le système de crédits ?
          </h2>

          <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex-shrink-0">
                <TrendingUp className="text-indigo-600 dark:text-indigo-400" size={16} />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Consommation automatique</p>
                <p>1 crédit est déduit périodiquement selon le nombre de welcomebooks que vous gérez. Plus vous avez de welcomebooks, plus la consommation est rapide.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
                <Gift className="text-green-600 dark:text-green-400" size={16} />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Gagnez des crédits gratuitement</p>
                <p>Partagez WelcomeApp sur vos réseaux sociaux pour gagner entre 30 et 135 crédits selon la plateforme et votre personnalisation du message.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex-shrink-0">
                <Clock className="text-amber-600 dark:text-amber-400" size={16} />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Période de grâce</p>
                <p>Si votre solde atteint 0, vous bénéficiez de 7 jours pour recharger vos crédits avant la suspension de votre welcomebook.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
