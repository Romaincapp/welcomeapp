'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  CreditCard,
  Coins,
  Sparkles,
  Building2,
  CheckCircle,
  Loader2,
  Crown,
  Star,
  BadgePercent,
  Home,
} from 'lucide-react'
import type { CreditBalance } from '@/lib/actions/credits'
import type { StripePurchase, CreditPackage } from '@/types/stripe'
import { STANDARD_PACKAGES, MULTI_PACKAGES, getRecommendedMultiPackage } from '@/lib/stripe/products'

interface BillingClientProps {
  userEmail: string
  creditBalance: CreditBalance | null
  purchases: StripePurchase[]
  welcomebookCount: number
}

export default function BillingClient({
  userEmail,
  creditBalance,
  purchases,
  welcomebookCount,
}: BillingClientProps) {
  const searchParams = useSearchParams()
  const success = searchParams.get('success') === 'true'
  const canceled = searchParams.get('canceled') === 'true'

  const [loadingPackage, setLoadingPackage] = useState<string | null>(null)

  const recommendedMultiPkg = getRecommendedMultiPackage(welcomebookCount)

  const handlePurchase = async (pkg: CreditPackage) => {
    if (!pkg.priceId) {
      alert('Ce pack n\'est pas encore configuré. Contactez le support.')
      return
    }

    setLoadingPackage(pkg.id)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productType: pkg.id }),
      })

      const data = await response.json()

      if (data.success && data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Erreur lors de la création du paiement')
        setLoadingPackage(null)
      }
    } catch (error) {
      console.error('Erreur checkout:', error)
      alert('Erreur de connexion. Veuillez réessayer.')
      setLoadingPackage(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/credits"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition mb-4"
          >
            <ArrowLeft size={20} />
            <span>Retour aux crédits</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <CreditCard className="text-indigo-500" />
            Acheter des crédits
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Rechargez votre compte en quelques clics
          </p>
        </div>

        {/* Success/Cancel Messages */}
        {success && (
          <div className="mb-8 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
                <CheckCircle className="text-green-600 dark:text-green-400" size={32} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                  Paiement réussi !
                </h3>
                <p className="text-green-700 dark:text-green-300">
                  Vos crédits ont été ajoutés à votre compte. Merci pour votre achat !
                </p>
              </div>
            </div>
          </div>
        )}

        {canceled && (
          <div className="mb-8 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
            <p className="text-amber-800 dark:text-amber-200">
              Paiement annulé. Vous pouvez réessayer quand vous le souhaitez.
            </p>
          </div>
        )}

        {/* Current Balance */}
        {creditBalance && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                  <Coins className="text-indigo-600 dark:text-indigo-400" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Solde actuel</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {creditBalance.credits_balance} crédits
                  </p>
                </div>
              </div>
              {welcomebookCount > 1 && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Home size={16} />
                  <span>{welcomebookCount} welcomebooks</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Standard Plans */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="text-yellow-500" size={24} />
            Packs Standard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Idéal pour 1 welcomebook
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STANDARD_PACKAGES.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                loading={loadingPackage === pkg.id}
                onPurchase={() => handlePurchase(pkg)}
              />
            ))}
          </div>
        </div>

        {/* Multi Plans */}
        {welcomebookCount >= 2 || true /* Always show for awareness */ ? (
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Building2 className="text-purple-500" size={24} />
              Packs Multi-Welcomebooks
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Pour les gestionnaires de plusieurs propriétés - Économies jusqu&apos;à 45%
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {MULTI_PACKAGES.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  loading={loadingPackage === pkg.id}
                  onPurchase={() => handlePurchase(pkg)}
                  isRecommended={recommendedMultiPkg?.id === pkg.id}
                />
              ))}
            </div>
          </div>
        ) : null}

        {/* Purchase History */}
        {purchases.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Historique des achats
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Pack</th>
                    <th className="pb-3">Crédits</th>
                    <th className="pb-3">Montant</th>
                    <th className="pb-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {purchases.map((purchase) => (
                    <tr key={purchase.id}>
                      <td className="py-3 text-gray-900 dark:text-white">
                        {new Date(purchase.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 text-gray-900 dark:text-white capitalize">
                        {purchase.product_type.replace('credits_', '').replace('multi_', 'Multi ')}
                      </td>
                      <td className="py-3 text-gray-900 dark:text-white">
                        +{purchase.credits_amount}
                      </td>
                      <td className="py-3 text-gray-900 dark:text-white">
                        {(purchase.amount_paid / 100).toFixed(2)}€
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            purchase.status === 'completed'
                              ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                              : purchase.status === 'pending'
                                ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {purchase.status === 'completed' ? 'Complété' : purchase.status === 'pending' ? 'En cours' : purchase.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Composant Card pour un package
function PackageCard({
  pkg,
  loading,
  onPurchase,
  isRecommended,
}: {
  pkg: CreditPackage
  loading: boolean
  onPurchase: () => void
  isRecommended?: boolean
}) {
  return (
    <div
      className={`relative bg-white dark:bg-gray-800 rounded-xl p-6 border-2 transition-all ${
        pkg.popular
          ? 'border-indigo-500 shadow-lg shadow-indigo-500/20'
          : isRecommended
            ? 'border-purple-500 shadow-lg shadow-purple-500/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
      }`}
    >
      {/* Badges */}
      <div className="absolute -top-3 left-4 flex gap-2">
        {pkg.popular && (
          <span className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Star size={12} fill="currentColor" />
            Populaire
          </span>
        )}
        {isRecommended && (
          <span className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Crown size={12} />
            Recommandé
          </span>
        )}
        {pkg.savings && (
          <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <BadgePercent size={12} />
            {pkg.savings}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="pt-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{pkg.name}</h3>

        <div className="mt-4">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            {pkg.price.toFixed(2).replace('.', ',')}€
          </span>
        </div>

        <div className="mt-2 flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Coins size={16} />
          <span className="font-semibold">{pkg.credits} crédits</span>
        </div>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">{pkg.duration}</p>

        {pkg.recommendedFor && (
          <p className="mt-2 text-xs text-purple-600 dark:text-purple-400 font-medium">
            {pkg.recommendedFor}
          </p>
        )}

        <button
          onClick={onPurchase}
          disabled={loading || !pkg.priceId}
          className={`mt-6 w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
            pkg.popular || isRecommended
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Redirection...
            </>
          ) : !pkg.priceId ? (
            'Bientôt disponible'
          ) : (
            <>
              <CreditCard size={18} />
              Acheter
            </>
          )}
        </button>
      </div>
    </div>
  )
}
