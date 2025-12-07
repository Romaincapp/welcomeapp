import Stripe from 'stripe'

// Singleton pour éviter de créer plusieurs instances
let stripeInstance: Stripe | null = null

/**
 * Retourne l'instance Stripe (singleton)
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not defined')
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
      typescript: true,
    })
  }
  return stripeInstance
}

/**
 * Mapping productType → crédits
 * Utilisé par le webhook pour ajouter les crédits
 */
export const CREDIT_AMOUNTS: Record<string, number> = {
  credits_bronze: 90,
  credits_silver: 180,
  credits_gold: 365,
  credits_platinum: 730,
  multi_pro: 500,
  multi_business: 800,
  multi_agency: 1500,
}

/**
 * Récupère le nombre de crédits pour un type de produit
 */
export function getCreditsForProduct(productType: string): number {
  return CREDIT_AMOUNTS[productType] || 0
}
