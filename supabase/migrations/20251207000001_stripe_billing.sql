-- Migration: Stripe Billing System
-- Description: Tables pour gérer les paiements Stripe et achats de crédits

-- ============================================
-- Table stripe_customers (lien user <-> Stripe)
-- ============================================
CREATE TABLE IF NOT EXISTS stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour lookup rapide
CREATE INDEX IF NOT EXISTS idx_stripe_customers_email ON stripe_customers(user_email);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_stripe_id ON stripe_customers(stripe_customer_id);

-- ============================================
-- Table stripe_purchases (achats uniques)
-- ============================================
CREATE TABLE IF NOT EXISTS stripe_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  stripe_session_id TEXT UNIQUE NOT NULL, -- Idempotence: empêche double crédit
  stripe_payment_intent_id TEXT,
  product_type TEXT NOT NULL CHECK (product_type IN (
    'credits_bronze', 'credits_silver', 'credits_gold', 'credits_platinum',
    'multi_pro', 'multi_business', 'multi_agency'
  )),
  credits_amount INTEGER NOT NULL,
  amount_paid INTEGER NOT NULL, -- En centimes (990 = 9.90€)
  currency TEXT DEFAULT 'eur',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_stripe_purchases_user ON stripe_purchases(user_email);
CREATE INDEX IF NOT EXISTS idx_stripe_purchases_session ON stripe_purchases(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_stripe_purchases_status ON stripe_purchases(status);

-- ============================================
-- Ajouter 'purchase' aux types de transaction
-- ============================================
ALTER TABLE credit_transactions
  DROP CONSTRAINT IF EXISTS credit_transactions_transaction_type_check;

ALTER TABLE credit_transactions
  ADD CONSTRAINT credit_transactions_transaction_type_check
  CHECK (transaction_type IN (
    'earn_social',
    'spend_daily',
    'manual_add',
    'manual_remove',
    'initial_bonus',
    'purchase'  -- NOUVEAU: Achat Stripe
  ));

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_purchases ENABLE ROW LEVEL SECURITY;

-- Users peuvent voir leurs propres données
CREATE POLICY "Users view own stripe customer" ON stripe_customers
  FOR SELECT TO authenticated
  USING (user_email = auth.email());

CREATE POLICY "Users view own purchases" ON stripe_purchases
  FOR SELECT TO authenticated
  USING (user_email = auth.email());

-- Admin accès complet
CREATE POLICY "Admin full access stripe_customers" ON stripe_customers
  FOR ALL TO authenticated
  USING (is_admin());

CREATE POLICY "Admin full access stripe_purchases" ON stripe_purchases
  FOR ALL TO authenticated
  USING (is_admin());

-- ============================================
-- Trigger updated_at pour stripe_customers
-- ============================================
CREATE TRIGGER update_stripe_customers_updated_at
  BEFORE UPDATE ON stripe_customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Vue pour stats admin
-- ============================================
CREATE OR REPLACE VIEW stripe_purchases_stats AS
SELECT
  DATE_TRUNC('day', created_at) AS day,
  COUNT(*) AS total_purchases,
  SUM(credits_amount) AS total_credits_sold,
  SUM(amount_paid) AS total_revenue_cents,
  COUNT(DISTINCT user_email) AS unique_buyers
FROM stripe_purchases
WHERE status = 'completed'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY day DESC;
