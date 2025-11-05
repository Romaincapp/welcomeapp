-- Migration: Email Automations
-- Date: 2025-11-05
-- Description: Tables pour gérer les automatisations d'emails (séquences de bienvenue, relances inactifs)

-- =============================================
-- Table: email_automations
-- Description: Configuration des automatisations d'emails
-- =============================================
CREATE TABLE email_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Type d'automation
  automation_type TEXT NOT NULL CHECK (automation_type IN (
    'welcome_sequence',           -- Séquence de bienvenue (J+0, J+3, J+7)
    'inactive_reactivation',      -- Relance inactifs (>30 jours)
    'tips_reminder'               -- Rappel ajouter tips (pour gestionnaires avec <10 tips)
  )),

  -- Statut
  is_enabled BOOLEAN NOT NULL DEFAULT false,

  -- Configuration JSON flexible
  -- Exemples:
  -- Pour welcome_sequence: {"days": [0, 3, 7], "templates": ["welcome", "tips_reminder", "tips_reminder"]}
  -- Pour inactive_reactivation: {"days_inactive": 30, "cooldown_days": 60}
  -- Pour tips_reminder: {"max_tips": 10, "check_every_days": 7}
  config JSONB NOT NULL DEFAULT '{}',

  -- Métadonnées
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Contrainte: Un seul record par type d'automation
  UNIQUE (automation_type)
);

-- Index pour recherches rapides
CREATE INDEX idx_email_automations_enabled ON email_automations(is_enabled);

-- Commentaire table
COMMENT ON TABLE email_automations IS 'Configuration des automatisations d''emails (séquences, relances)';
COMMENT ON COLUMN email_automations.automation_type IS 'Type d''automation (welcome_sequence, inactive_reactivation, tips_reminder)';
COMMENT ON COLUMN email_automations.is_enabled IS 'Si true, l''automation est active et s''exécute via le cron job';
COMMENT ON COLUMN email_automations.config IS 'Configuration JSON flexible par type d''automation';

-- =============================================
-- Table: automation_history
-- Description: Historique des emails automatiques envoyés (éviter doublons)
-- =============================================
CREATE TABLE automation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Référence au gestionnaire
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Type d'automation et email spécifique
  automation_type TEXT NOT NULL,
  email_type TEXT NOT NULL, -- Ex: 'welcome_day_0', 'welcome_day_3', 'inactive_reactivation_30d'

  -- Détails de l'envoi
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  resend_id TEXT, -- ID Resend pour tracking

  -- Métadonnées additionnelles
  metadata JSONB DEFAULT '{}', -- Ex: {"segment": "Inactif", "days_since_signup": 3}

  -- Contrainte: Éviter doublons (même client + même email)
  UNIQUE (client_id, email_type)
);

-- Index pour optimiser les requêtes du cron job
CREATE INDEX idx_automation_history_client ON automation_history(client_id);
CREATE INDEX idx_automation_history_type ON automation_history(automation_type);
CREATE INDEX idx_automation_history_sent_at ON automation_history(sent_at DESC);
CREATE INDEX idx_automation_history_success ON automation_history(success);

-- Index composite pour vérifier si un email a déjà été envoyé
CREATE INDEX idx_automation_history_lookup ON automation_history(client_id, email_type, sent_at);

-- Commentaire table
COMMENT ON TABLE automation_history IS 'Historique des emails automatiques envoyés (évite les doublons et permet le tracking)';
COMMENT ON COLUMN automation_history.email_type IS 'Type d''email spécifique (ex: welcome_day_0, welcome_day_3, inactive_reactivation_30d)';
COMMENT ON COLUMN automation_history.metadata IS 'Métadonnées JSON additionnelles sur l''envoi';

-- =============================================
-- Row Level Security (RLS)
-- =============================================

-- Activer RLS
ALTER TABLE email_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_history ENABLE ROW LEVEL SECURITY;

-- Policies : Seul l'admin peut accéder
CREATE POLICY "Admin can read email_automations"
  ON email_automations
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admin can update email_automations"
  ON email_automations
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin can insert email_automations"
  ON email_automations
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admin can delete email_automations"
  ON email_automations
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Policies automation_history : Admin lecture seule
CREATE POLICY "Admin can read automation_history"
  ON automation_history
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Service role peut insérer (pour le cron job)
CREATE POLICY "Service role can insert automation_history"
  ON automation_history
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- =============================================
-- Fonction: Mettre à jour updated_at automatiquement
-- =============================================
CREATE OR REPLACE FUNCTION update_email_automations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur email_automations
CREATE TRIGGER update_email_automations_timestamp
  BEFORE UPDATE ON email_automations
  FOR EACH ROW
  EXECUTE FUNCTION update_email_automations_updated_at();

-- =============================================
-- Données initiales: Créer les 3 automatisations (désactivées par défaut)
-- =============================================

INSERT INTO email_automations (automation_type, is_enabled, config) VALUES
(
  'welcome_sequence',
  false, -- Désactivé par défaut
  '{
    "days": [0, 3, 7],
    "templates": ["welcome", "tips_reminder", "tips_reminder"],
    "subjects": [
      "Bienvenue sur WelcomeApp ! 👋",
      "Comment se passe votre première semaine ?",
      "Découvrez toutes les fonctionnalités de WelcomeApp"
    ]
  }'::jsonb
),
(
  'inactive_reactivation',
  false,
  '{
    "days_inactive": 30,
    "cooldown_days": 60,
    "template": "inactive_reactivation",
    "subject": "Ça fait un moment ! Découvrez les nouveautés"
  }'::jsonb
),
(
  'tips_reminder',
  false,
  '{
    "max_tips": 10,
    "check_every_days": 7,
    "template": "tips_reminder",
    "subject": "💡 Enrichissez votre WelcomeBook avec de nouveaux conseils"
  }'::jsonb
);

-- =============================================
-- Vues utiles pour l'admin
-- =============================================

-- Vue: Statistiques des automatisations
CREATE OR REPLACE VIEW automation_stats AS
SELECT
  automation_type,
  COUNT(*) AS total_sent,
  COUNT(*) FILTER (WHERE success = true) AS successful,
  COUNT(*) FILTER (WHERE success = false) AS failed,
  MAX(sent_at) AS last_sent_at,
  COUNT(DISTINCT client_id) AS unique_recipients
FROM automation_history
GROUP BY automation_type;

COMMENT ON VIEW automation_stats IS 'Statistiques agrégées des automatisations d''emails';

-- Vue: Prochains envois prévus (gestionnaires éligibles)
CREATE OR REPLACE VIEW eligible_for_welcome_sequence AS
SELECT
  c.id,
  c.email,
  c.name,
  c.slug,
  c.created_at,
  EXTRACT(DAY FROM NOW() - c.created_at) AS days_since_signup,
  CASE
    WHEN ah0.id IS NULL THEN 0
    WHEN ah3.id IS NULL THEN 3
    WHEN ah7.id IS NULL THEN 7
    ELSE NULL
  END AS next_welcome_day
FROM clients c
LEFT JOIN automation_history ah0 ON c.id = ah0.client_id AND ah0.email_type = 'welcome_day_0'
LEFT JOIN automation_history ah3 ON c.id = ah3.client_id AND ah3.email_type = 'welcome_day_3'
LEFT JOIN automation_history ah7 ON c.id = ah7.client_id AND ah7.email_type = 'welcome_day_7'
WHERE c.email IS NOT NULL
  AND (
    (ah0.id IS NULL AND EXTRACT(DAY FROM NOW() - c.created_at) >= 0) OR
    (ah3.id IS NULL AND EXTRACT(DAY FROM NOW() - c.created_at) >= 3) OR
    (ah7.id IS NULL AND EXTRACT(DAY FROM NOW() - c.created_at) >= 7)
  );

COMMENT ON VIEW eligible_for_welcome_sequence IS 'Gestionnaires éligibles pour recevoir le prochain email de la séquence de bienvenue';
