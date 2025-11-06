-- Migration : Email Analytics & A/B Testing
-- Description : Ajoute les champs nécessaires pour le tracking d'ouverture/clics et l'A/B testing des campagnes email
-- Date : 2025-11-06

-- ============================================
-- 1. Ajouter champs A/B Testing dans email_campaigns
-- ============================================

ALTER TABLE email_campaigns
ADD COLUMN IF NOT EXISTS ab_test_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS ab_test_variant TEXT CHECK (ab_test_variant IN ('A', 'B', NULL)),
ADD COLUMN IF NOT EXISTS ab_test_subject_a TEXT,
ADD COLUMN IF NOT EXISTS ab_test_subject_b TEXT,
ADD COLUMN IF NOT EXISTS ab_test_winner TEXT CHECK (ab_test_winner IN ('A', 'B', NULL));

COMMENT ON COLUMN email_campaigns.ab_test_enabled IS 'Indique si cette campagne utilise un A/B test sur le sujet';
COMMENT ON COLUMN email_campaigns.ab_test_variant IS 'Variante testée dans cette campagne (A ou B)';
COMMENT ON COLUMN email_campaigns.ab_test_subject_a IS 'Sujet de la variante A pour A/B testing';
COMMENT ON COLUMN email_campaigns.ab_test_subject_b IS 'Sujet de la variante B pour A/B testing';
COMMENT ON COLUMN email_campaigns.ab_test_winner IS 'Variante gagnante après analyse (A ou B)';

-- ============================================
-- 2. Ajouter champs Tracking dans email_campaigns
-- ============================================

ALTER TABLE email_campaigns
ADD COLUMN IF NOT EXISTS tracking_data JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN email_campaigns.tracking_data IS 'Données de tracking détaillées (opens, clicks, bounces, etc.)';

-- Index pour optimiser les requêtes sur tracking_data
CREATE INDEX IF NOT EXISTS idx_email_campaigns_tracking_data ON email_campaigns USING GIN (tracking_data);

-- ============================================
-- 3. Créer table email_events pour tracking granulaire
-- ============================================

CREATE TABLE IF NOT EXISTS email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  email_id TEXT NOT NULL, -- Resend email ID
  recipient_email TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained')),
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE email_events IS 'Événements de tracking des emails (opens, clicks, etc.) par destinataire';
COMMENT ON COLUMN email_events.campaign_id IS 'ID de la campagne email';
COMMENT ON COLUMN email_events.email_id IS 'ID de l''email retourné par Resend';
COMMENT ON COLUMN email_events.recipient_email IS 'Email du destinataire';
COMMENT ON COLUMN email_events.event_type IS 'Type d''événement (sent, delivered, opened, clicked, bounced, complained)';
COMMENT ON COLUMN email_events.event_data IS 'Données supplémentaires de l''événement (ex: URL cliquée, user agent, etc.)';

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_email_events_campaign_id ON email_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_events_email_id ON email_events(email_id);
CREATE INDEX IF NOT EXISTS idx_email_events_event_type ON email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_created_at ON email_events(created_at DESC);

-- ============================================
-- 4. Créer vue pour analytics des campagnes
-- ============================================

CREATE OR REPLACE VIEW campaign_analytics AS
SELECT
  c.id AS campaign_id,
  c.subject,
  c.segment,
  c.template_type,
  c.sent_at,
  c.total_recipients,
  c.total_sent,
  c.total_failed,
  c.ab_test_enabled,
  c.ab_test_variant,
  c.ab_test_winner,

  -- Comptage des événements
  COUNT(DISTINCT CASE WHEN e.event_type = 'delivered' THEN e.email_id END) AS total_delivered,
  COUNT(DISTINCT CASE WHEN e.event_type = 'opened' THEN e.email_id END) AS total_opened,
  COUNT(DISTINCT CASE WHEN e.event_type = 'clicked' THEN e.email_id END) AS total_clicked,
  COUNT(DISTINCT CASE WHEN e.event_type = 'bounced' THEN e.email_id END) AS total_bounced,
  COUNT(DISTINCT CASE WHEN e.event_type = 'complained' THEN e.email_id END) AS total_complained,

  -- Taux de conversion
  CASE
    WHEN c.total_sent > 0 THEN
      ROUND((COUNT(DISTINCT CASE WHEN e.event_type = 'delivered' THEN e.email_id END)::numeric / c.total_sent) * 100, 2)
    ELSE 0
  END AS delivery_rate,

  CASE
    WHEN c.total_sent > 0 THEN
      ROUND((COUNT(DISTINCT CASE WHEN e.event_type = 'opened' THEN e.email_id END)::numeric / c.total_sent) * 100, 2)
    ELSE 0
  END AS open_rate,

  CASE
    WHEN COUNT(DISTINCT CASE WHEN e.event_type = 'opened' THEN e.email_id END) > 0 THEN
      ROUND((COUNT(DISTINCT CASE WHEN e.event_type = 'clicked' THEN e.email_id END)::numeric /
             COUNT(DISTINCT CASE WHEN e.event_type = 'opened' THEN e.email_id END)) * 100, 2)
    ELSE 0
  END AS click_rate

FROM email_campaigns c
LEFT JOIN email_events e ON c.id = e.campaign_id
WHERE c.sent_at IS NOT NULL
GROUP BY c.id, c.subject, c.segment, c.template_type, c.sent_at, c.total_recipients,
         c.total_sent, c.total_failed, c.ab_test_enabled, c.ab_test_variant, c.ab_test_winner;

COMMENT ON VIEW campaign_analytics IS 'Analytics détaillés par campagne email avec taux d''ouverture et de clic';

-- ============================================
-- 5. Créer vue pour comparaison A/B testing
-- ============================================

CREATE OR REPLACE VIEW ab_test_comparison AS
SELECT
  c.id AS campaign_id,
  c.subject AS base_subject,
  c.ab_test_subject_a,
  c.ab_test_subject_b,
  c.ab_test_winner,
  c.sent_at,

  -- Variante A stats
  COUNT(DISTINCT CASE WHEN e.event_type = 'sent' AND c_a.ab_test_variant = 'A' THEN e.email_id END) AS variant_a_sent,
  COUNT(DISTINCT CASE WHEN e.event_type = 'opened' AND c_a.ab_test_variant = 'A' THEN e.email_id END) AS variant_a_opened,
  COUNT(DISTINCT CASE WHEN e.event_type = 'clicked' AND c_a.ab_test_variant = 'A' THEN e.email_id END) AS variant_a_clicked,
  CASE
    WHEN COUNT(DISTINCT CASE WHEN e.event_type = 'sent' AND c_a.ab_test_variant = 'A' THEN e.email_id END) > 0 THEN
      ROUND((COUNT(DISTINCT CASE WHEN e.event_type = 'opened' AND c_a.ab_test_variant = 'A' THEN e.email_id END)::numeric /
             COUNT(DISTINCT CASE WHEN e.event_type = 'sent' AND c_a.ab_test_variant = 'A' THEN e.email_id END)) * 100, 2)
    ELSE 0
  END AS variant_a_open_rate,

  -- Variante B stats
  COUNT(DISTINCT CASE WHEN e.event_type = 'sent' AND c_b.ab_test_variant = 'B' THEN e.email_id END) AS variant_b_sent,
  COUNT(DISTINCT CASE WHEN e.event_type = 'opened' AND c_b.ab_test_variant = 'B' THEN e.email_id END) AS variant_b_opened,
  COUNT(DISTINCT CASE WHEN e.event_type = 'clicked' AND c_b.ab_test_variant = 'B' THEN e.email_id END) AS variant_b_clicked,
  CASE
    WHEN COUNT(DISTINCT CASE WHEN e.event_type = 'sent' AND c_b.ab_test_variant = 'B' THEN e.email_id END) > 0 THEN
      ROUND((COUNT(DISTINCT CASE WHEN e.event_type = 'opened' AND c_b.ab_test_variant = 'B' THEN e.email_id END)::numeric /
             COUNT(DISTINCT CASE WHEN e.event_type = 'sent' AND c_b.ab_test_variant = 'B' THEN e.email_id END)) * 100, 2)
    ELSE 0
  END AS variant_b_open_rate

FROM email_campaigns c
LEFT JOIN email_campaigns c_a ON c_a.id = c.id AND c_a.ab_test_variant = 'A'
LEFT JOIN email_campaigns c_b ON c_b.id = c.id AND c_b.ab_test_variant = 'B'
LEFT JOIN email_events e ON (c_a.id = e.campaign_id OR c_b.id = e.campaign_id)
WHERE c.ab_test_enabled = true
GROUP BY c.id, c.subject, c.ab_test_subject_a, c.ab_test_subject_b, c.ab_test_winner, c.sent_at;

COMMENT ON VIEW ab_test_comparison IS 'Comparaison des performances des variantes A/B dans les campagnes email';

-- ============================================
-- 6. RLS Policies pour email_events
-- ============================================

ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;

-- Admin peut tout voir
CREATE POLICY "Admin peut tout voir dans email_events"
  ON email_events
  FOR SELECT
  USING (is_admin());

-- Service role peut insérer (pour webhook Resend)
CREATE POLICY "Service role peut insérer dans email_events"
  ON email_events
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 7. Fonction helper pour calculer le winner A/B
-- ============================================

CREATE OR REPLACE FUNCTION calculate_ab_test_winner(p_campaign_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_variant_a_open_rate NUMERIC;
  v_variant_b_open_rate NUMERIC;
  v_winner TEXT;
BEGIN
  -- Récupérer les taux d'ouverture des deux variantes
  SELECT
    variant_a_open_rate,
    variant_b_open_rate
  INTO v_variant_a_open_rate, v_variant_b_open_rate
  FROM ab_test_comparison
  WHERE campaign_id = p_campaign_id;

  -- Déterminer le winner
  IF v_variant_a_open_rate > v_variant_b_open_rate THEN
    v_winner := 'A';
  ELSIF v_variant_b_open_rate > v_variant_a_open_rate THEN
    v_winner := 'B';
  ELSE
    v_winner := NULL; -- Égalité ou pas assez de données
  END IF;

  -- Mettre à jour la campagne
  UPDATE email_campaigns
  SET ab_test_winner = v_winner
  WHERE id = p_campaign_id;

  RETURN v_winner;
END;
$$;

COMMENT ON FUNCTION calculate_ab_test_winner IS 'Calcule et enregistre la variante gagnante d''un A/B test basé sur le taux d''ouverture';
