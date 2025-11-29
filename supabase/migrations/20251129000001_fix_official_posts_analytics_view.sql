-- ============================================================================
-- Migration: Correction vue official_posts_analytics
-- Date: 2025-11-29
-- Description: Ajoute thumbnail_url et category à la vue SQL pour l'affichage
--              des images d'aperçu sur les cards des posts
-- ============================================================================

-- Supprimer et recréer la vue avec tous les champs
DROP VIEW IF EXISTS official_posts_analytics;

CREATE VIEW official_posts_analytics AS
SELECT
  op.id,
  op.platform,
  op.post_url,
  op.thumbnail_url,  -- AJOUTÉ: Image d'aperçu du post
  op.caption,
  op.category,       -- AJOUTÉ: Catégorie du post
  op.credits_reward,
  op.is_active,
  op.created_at,
  op.updated_at,     -- AJOUTÉ: Date de mise à jour
  COUNT(DISTINCT sps.user_email) AS unique_sharers,
  COUNT(sps.id) AS total_shares,
  COALESCE(SUM(sps.credits_awarded), 0) AS total_credits_distributed
FROM official_social_posts op
LEFT JOIN social_post_shares sps ON op.id = sps.post_id
GROUP BY op.id, op.platform, op.post_url, op.thumbnail_url, op.caption, op.category, op.credits_reward, op.is_active, op.created_at, op.updated_at
ORDER BY op.created_at DESC;

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================
