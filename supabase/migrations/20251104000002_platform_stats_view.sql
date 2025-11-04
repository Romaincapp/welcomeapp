-- Vue SQL pour les statistiques globales de la plateforme (Admin Dashboard)
-- Agrège : total clients, tips, catégories, médias, QR codes, événements analytics

-- =============================================================================
-- VUE : platform_overview_stats
-- =============================================================================
-- Statistiques générales de la plateforme (compteurs totaux)

CREATE OR REPLACE VIEW platform_overview_stats AS
SELECT
  -- Compteurs généraux
  (SELECT COUNT(*) FROM clients) AS total_clients,
  (SELECT COUNT(*) FROM tips) AS total_tips,
  (SELECT COUNT(*) FROM tip_media) AS total_media,
  (SELECT COUNT(*) FROM qr_code_designs) AS total_qr_codes,
  (SELECT COUNT(*) FROM secure_sections) AS total_secure_sections,

  -- Analytics events
  (SELECT COUNT(*) FROM analytics_events WHERE event_type = 'view') AS total_views,
  (SELECT COUNT(*) FROM analytics_events WHERE event_type = 'click') AS total_clicks,
  (SELECT COUNT(*) FROM analytics_events WHERE event_type = 'share') AS total_shares,
  (SELECT COUNT(*) FROM analytics_events WHERE event_type = 'install_pwa') AS total_pwa_installs,

  -- Clients actifs (ayant au moins 1 tip)
  (SELECT COUNT(DISTINCT client_id) FROM tips) AS active_clients,

  -- Rating moyen de tous les tips
  (SELECT AVG(rating) FROM tips WHERE rating IS NOT NULL) AS average_rating;

-- =============================================================================
-- VUE : signups_evolution
-- =============================================================================
-- Évolution des inscriptions par mois (30 derniers jours + historique mensuel)

CREATE OR REPLACE VIEW signups_evolution AS
SELECT
  DATE_TRUNC('day', created_at) AS signup_date,
  COUNT(*) AS new_signups
FROM clients
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY signup_date DESC;

-- =============================================================================
-- VUE : top_welcomebooks
-- =============================================================================
-- Top welcomebooks par nombre de tips et vues

CREATE OR REPLACE VIEW top_welcomebooks AS
SELECT
  c.id,
  c.email,
  c.slug,
  c.name AS welcomebook_name,
  c.created_at,

  -- Compteurs
  COALESCE(t.total_tips, 0) AS total_tips,
  COALESCE(m.total_media, 0) AS total_media,
  COALESCE(v.total_views, 0) AS total_views,
  COALESCE(cl.total_clicks, 0) AS total_clicks,

  -- Flags
  c.has_shared,
  CASE WHEN ss.id IS NOT NULL THEN true ELSE false END AS has_secure_section,
  CASE WHEN qr.id IS NOT NULL THEN true ELSE false END AS has_qr_code

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
) cl ON true

-- Vérifier si secure_section existe
LEFT JOIN secure_sections ss ON ss.client_id = c.id

-- Vérifier si QR code existe
LEFT JOIN LATERAL (
  SELECT id
  FROM qr_code_designs
  WHERE client_id = c.id
  LIMIT 1
) qr ON true

ORDER BY total_tips DESC, total_views DESC;

-- =============================================================================
-- VUE : manager_categories
-- =============================================================================
-- Catégorisation des gestionnaires par niveau d'activité

CREATE OR REPLACE VIEW manager_categories AS
SELECT
  c.id,
  c.email,
  c.slug,
  c.created_at,
  COALESCE(t.total_tips, 0) AS total_tips,

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
LEFT JOIN LATERAL (
  SELECT COUNT(*) AS total_tips
  FROM tips
  WHERE client_id = c.id
) t ON true;

-- =============================================================================
-- COMMENTAIRES
-- =============================================================================

COMMENT ON VIEW platform_overview_stats IS 'Statistiques générales de la plateforme (compteurs totaux, analytics)';
COMMENT ON VIEW signups_evolution IS 'Évolution des inscriptions par jour (90 derniers jours)';
COMMENT ON VIEW top_welcomebooks IS 'Top welcomebooks triés par tips et vues';
COMMENT ON VIEW manager_categories IS 'Catégorisation des gestionnaires par niveau d''activité';
