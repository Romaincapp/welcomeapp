-- Ajout de credits_balance et autres champs manquants à la vue manager_categories
-- Date : 2025-11-25

-- =============================================================================
-- VUE : manager_categories (MISE À JOUR)
-- =============================================================================
-- Ajout de : name, subdomain, has_shared, credits_balance

-- Supprimer l'ancienne vue pour éviter l'erreur "cannot change name of view column"
DROP VIEW IF EXISTS manager_categories;

-- Recréer la vue avec les nouvelles colonnes
CREATE VIEW manager_categories AS
SELECT
  c.id,
  c.email,
  c.slug,
  c.name,
  c.subdomain,
  c.has_shared,
  c.credits_balance,
  c.created_at,

  -- Compteurs
  COALESCE(t.total_tips, 0) AS total_tips,
  COALESCE(m.total_media, 0) AS total_media,
  COALESCE(v.total_views, 0) AS total_views,
  COALESCE(cl.total_clicks, 0) AS total_clicks,

  -- Catégorie basée sur nombre de tips
  CASE
    WHEN COALESCE(t.total_tips, 0) = 0 THEN 'Inactif'
    WHEN COALESCE(t.total_tips, 0) BETWEEN 1 AND 5 THEN 'Débutant'
    WHEN COALESCE(t.total_tips, 0) BETWEEN 6 AND 15 THEN 'Intermédiaire'
    WHEN COALESCE(t.total_tips, 0) BETWEEN 16 AND 30 THEN 'Avancé'
    ELSE 'Expert'
  END AS category,

  -- Ancienneté
  EXTRACT(DAY FROM (NOW() - c.created_at)) AS days_since_signup

FROM clients c

-- Compter les tips
LEFT JOIN LATERAL (
  SELECT COUNT(*) AS total_tips
  FROM tips
  WHERE client_id = c.id
) t ON true

-- Compter les médias
LEFT JOIN LATERAL (
  SELECT COUNT(*) AS total_media
  FROM tip_media tm
  JOIN tips tip ON tm.tip_id = tip.id
  WHERE tip.client_id = c.id
) m ON true

-- Compter les vues (analytics_events)
LEFT JOIN LATERAL (
  SELECT COUNT(*) AS total_views
  FROM analytics_events
  WHERE client_id = c.id AND event_type = 'view'
) v ON true

-- Compter les clics (analytics_events)
LEFT JOIN LATERAL (
  SELECT COUNT(*) AS total_clicks
  FROM analytics_events
  WHERE client_id = c.id AND event_type = 'click'
) cl ON true;

-- =============================================================================
-- COMMENTAIRE
-- =============================================================================

COMMENT ON VIEW manager_categories IS 'Catégorisation des gestionnaires par niveau d''activité avec analytics complètes et solde crédits';
