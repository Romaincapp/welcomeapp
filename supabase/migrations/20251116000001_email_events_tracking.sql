-- Migration: Email Events Tracking Optimization
-- Date: 2025-11-16
-- Description: Ajoute des index et fonctions pour optimiser le tracking des événements email
--              et faciliter le lookup campaign_id depuis email_id (Resend webhook)

-- =====================================================================
-- 1. INDEX POUR PERFORMANCES
-- =====================================================================

-- Index sur email_id pour lookup rapide depuis les webhooks Resend
-- Utilisé par le webhook pour retrouver le campaign_id associé à un email_id
CREATE INDEX IF NOT EXISTS idx_email_events_email_id
ON email_events(email_id);

-- Index composite pour les requêtes analytics par campagne et type d'événement
CREATE INDEX IF NOT EXISTS idx_email_events_campaign_type
ON email_events(campaign_id, event_type);

-- Index sur created_at pour les requêtes temporelles (graphiques évolution)
CREATE INDEX IF NOT EXISTS idx_email_events_created_at
ON email_events(created_at DESC);

-- Index composite pour analytics par destinataire
CREATE INDEX IF NOT EXISTS idx_email_events_recipient
ON email_events(recipient_email, event_type);

-- =====================================================================
-- 2. FONCTION: Retrouver campaign_id depuis email_id
-- =====================================================================

CREATE OR REPLACE FUNCTION get_campaign_id_from_email_id(p_email_id TEXT)
RETURNS UUID
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_campaign_id UUID;
BEGIN
  -- Chercher dans email_events pour trouver le campaign_id associé à cet email_id
  -- On prend le premier résultat (devrait être unique de toute façon)
  SELECT campaign_id INTO v_campaign_id
  FROM email_events
  WHERE email_id = p_email_id
  LIMIT 1;

  RETURN v_campaign_id;
END;
$$;

-- =====================================================================
-- 3. FONCTION: Stats email events par campagne
-- =====================================================================

CREATE OR REPLACE FUNCTION get_campaign_event_stats(p_campaign_id UUID)
RETURNS TABLE(
  event_type TEXT,
  event_count BIGINT,
  unique_recipients BIGINT,
  latest_event TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ee.event_type::TEXT,
    COUNT(*)::BIGINT as event_count,
    COUNT(DISTINCT ee.recipient_email)::BIGINT as unique_recipients,
    MAX(ee.created_at) as latest_event
  FROM email_events ee
  WHERE ee.campaign_id = p_campaign_id
  GROUP BY ee.event_type
  ORDER BY event_count DESC;
END;
$$;

-- =====================================================================
-- 4. FONCTION: Cleanup automatique des vieux événements (optionnel)
-- =====================================================================

CREATE OR REPLACE FUNCTION cleanup_old_email_events(p_days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Supprimer les événements plus vieux que X jours
  DELETE FROM email_events
  WHERE created_at < NOW() - (p_days_to_keep || ' days')::INTERVAL;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RAISE NOTICE 'Cleanup email_events: % événements supprimés (> % jours)',
    v_deleted_count, p_days_to_keep;

  RETURN v_deleted_count;
END;
$$;

-- =====================================================================
-- 5. COMMENTAIRES
-- =====================================================================

COMMENT ON INDEX idx_email_events_email_id IS
'Index pour lookup rapide de campaign_id depuis email_id (webhooks Resend)';

COMMENT ON INDEX idx_email_events_campaign_type IS
'Index composite pour requêtes analytics par campagne et type événement';

COMMENT ON INDEX idx_email_events_created_at IS
'Index pour requêtes temporelles (graphiques évolution open/click rates)';

COMMENT ON FUNCTION get_campaign_id_from_email_id(TEXT) IS
'Retrouve le campaign_id associé à un email_id Resend';

COMMENT ON FUNCTION get_campaign_event_stats(UUID) IS
'Retourne les stats d''événements pour une campagne (count par type, unique recipients)';

COMMENT ON FUNCTION cleanup_old_email_events(INTEGER) IS
'Supprime les événements email plus vieux que X jours (défaut: 90 jours)';
