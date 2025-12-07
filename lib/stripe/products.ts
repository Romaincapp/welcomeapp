import type { CreditPackage } from '@/types/stripe'

/**
 * Configuration des packages de crédits
 * Les priceId sont chargés depuis les variables d'environnement
 */

// Plans standards (1 welcomebook)
export const STANDARD_PACKAGES: CreditPackage[] = [
  {
    id: 'credits_bronze',
    name: 'Bronze',
    credits: 90,
    price: 9.90,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BRONZE || '',
    duration: '~3 mois',
  },
  {
    id: 'credits_silver',
    name: 'Silver',
    credits: 180,
    price: 17.90,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_SILVER || '',
    duration: '~6 mois',
    savings: '-10%',
  },
  {
    id: 'credits_gold',
    name: 'Gold',
    credits: 365,
    price: 32.90,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_GOLD || '',
    duration: '~1 an',
    savings: '-18%',
    popular: true,
  },
  {
    id: 'credits_platinum',
    name: 'Platinum',
    credits: 730,
    price: 54.90,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PLATINUM || '',
    duration: '~2 ans',
    savings: '-32%',
  },
]

// Plans multi-welcomebooks (2+ propriétés)
export const MULTI_PACKAGES: CreditPackage[] = [
  {
    id: 'multi_pro',
    name: 'Multi Pro',
    credits: 500,
    price: 39.90,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MULTI_PRO || '',
    duration: '~1 an',
    savings: '-27%',
    isMulti: true,
    recommendedFor: '2-3 welcomebooks',
  },
  {
    id: 'multi_business',
    name: 'Multi Business',
    credits: 800,
    price: 54.90,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MULTI_BUSINESS || '',
    duration: '~1 an',
    savings: '-37%',
    isMulti: true,
    recommendedFor: '3-4 welcomebooks',
  },
  {
    id: 'multi_agency',
    name: 'Multi Agency',
    credits: 1500,
    price: 89.90,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MULTI_AGENCY || '',
    duration: '~1 an',
    savings: '-45%',
    isMulti: true,
    recommendedFor: '5+ welcomebooks',
  },
]

// Tous les packages
export const ALL_PACKAGES: CreditPackage[] = [...STANDARD_PACKAGES, ...MULTI_PACKAGES]

/**
 * Récupère un package par son ID
 */
export function getPackageById(id: string): CreditPackage | undefined {
  return ALL_PACKAGES.find((pkg) => pkg.id === id)
}

/**
 * Recommande un package multi basé sur le nombre de welcomebooks
 */
export function getRecommendedMultiPackage(welcomebookCount: number): CreditPackage | undefined {
  if (welcomebookCount >= 5) {
    return MULTI_PACKAGES.find((p) => p.id === 'multi_agency')
  }
  if (welcomebookCount >= 3) {
    return MULTI_PACKAGES.find((p) => p.id === 'multi_business')
  }
  if (welcomebookCount >= 2) {
    return MULTI_PACKAGES.find((p) => p.id === 'multi_pro')
  }
  return undefined
}

/**
 * Calcule l'économie en pourcentage par rapport au prix Bronze
 */
export function calculateSavingsPercent(pkg: CreditPackage): number {
  const bronzePrice = 9.90
  const bronzeCredits = 90
  const pricePerCreditBronze = bronzePrice / bronzeCredits
  const pricePerCreditPkg = pkg.price / pkg.credits
  const savings = ((pricePerCreditBronze - pricePerCreditPkg) / pricePerCreditBronze) * 100
  return Math.round(savings)
}
