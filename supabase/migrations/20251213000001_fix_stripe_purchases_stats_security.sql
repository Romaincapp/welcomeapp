-- Migration: Fix Security Definer Issue on stripe_purchases_stats View
-- Description: Recrée la vue avec SECURITY INVOKER pour respecter les permissions RLS de l'utilisateur

-- Supprimer la vue existante
DROP VIEW IF EXISTS stripe_purchases_stats;

-- Recréer la vue avec SECURITY INVOKER
CREATE OR REPLACE VIEW stripe_purchases_stats
WITH (security_invoker = true)
AS
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

-- Ajouter une policy RLS pour cette vue (seulement les admins)
-- Note: Les vues héritent des policies de leurs tables sous-jacentes avec SECURITY INVOKER
COMMENT ON VIEW stripe_purchases_stats IS 'Vue des statistiques d''achats Stripe - accessible uniquement aux admins via RLS sur stripe_purchases';
