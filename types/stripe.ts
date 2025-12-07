/**
 * Types pour l'intégration Stripe
 */

// Types de produits disponibles
export type ProductType =
  | 'credits_bronze'
  | 'credits_silver'
  | 'credits_gold'
  | 'credits_platinum'
  | 'multi_pro'
  | 'multi_business'
  | 'multi_agency'

// Interface pour un package de crédits
export interface CreditPackage {
  id: ProductType
  name: string
  credits: number
  price: number // Prix en EUR
  priceId: string // Stripe Price ID
  duration: string // Ex: "~3 mois"
  savings?: string // Ex: "-18%"
  isMulti?: boolean // Pack multi-welcomebooks
  recommendedFor?: string // Ex: "2-3 welcomebooks"
  popular?: boolean // Badge "Populaire"
}

// Interface pour un customer Stripe (DB)
export interface StripeCustomer {
  id: string
  user_email: string
  stripe_customer_id: string
  created_at: string
  updated_at: string
}

// Interface pour un achat (DB)
export interface StripePurchase {
  id: string
  user_email: string
  stripe_session_id: string
  stripe_payment_intent_id: string | null
  product_type: ProductType
  credits_amount: number
  amount_paid: number // En centimes
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  created_at: string
  completed_at: string | null
}

// Interface pour la réponse de création de checkout
export interface CheckoutSessionResponse {
  success: boolean
  url?: string
  sessionId?: string
  error?: string
}

// Interface pour l'historique des achats
export interface PurchaseHistoryResponse {
  success: boolean
  data?: StripePurchase[]
  error?: string
}

// Interface pour les stats admin
export interface StripePurchaseStats {
  day: string
  total_purchases: number
  total_credits_sold: number
  total_revenue_cents: number
  unique_buyers: number
}
