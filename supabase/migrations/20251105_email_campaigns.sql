-- Migration: Email Campaigns Table
-- Description: Table pour stocker l'historique des campagnes email marketing
-- Date: 2025-11-05

-- Créer la table email_campaigns
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Informations de la campagne
  template_type TEXT NOT NULL CHECK (template_type IN ('welcome', 'inactive_reactivation', 'feature_announcement', 'newsletter', 'tips_reminder')),
  subject TEXT NOT NULL,
  segment TEXT NOT NULL, -- 'all', 'Inactif', 'Débutant', 'Intermédiaire', 'Avancé', 'Expert'

  -- Stats d'envoi
  total_sent INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,
  total_recipients INTEGER DEFAULT 0,

  -- Métadonnées
  sent_by TEXT, -- Email de l'admin qui a envoyé
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Stats d'engagement (à remplir plus tard avec tracking)
  total_opens INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,

  -- Données brutes (pour debug)
  results JSONB, -- Résultats détaillés de l'envoi

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_email_campaigns_sent_at ON email_campaigns(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_template_type ON email_campaigns(template_type);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_segment ON email_campaigns(segment);

-- RLS Policies : Seul l'admin peut voir/créer les campagnes
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

-- Policy : L'admin peut tout voir
CREATE POLICY "Admin can view all campaigns"
  ON email_campaigns
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Policy : L'admin peut créer des campagnes
CREATE POLICY "Admin can create campaigns"
  ON email_campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Commenter la table
COMMENT ON TABLE email_campaigns IS 'Historique des campagnes email marketing envoyées aux gestionnaires';
COMMENT ON COLUMN email_campaigns.template_type IS 'Type de template utilisé (welcome, inactive_reactivation, feature_announcement, newsletter, tips_reminder)';
COMMENT ON COLUMN email_campaigns.segment IS 'Segment ciblé (all, Inactif, Débutant, Intermédiaire, Avancé, Expert)';
COMMENT ON COLUMN email_campaigns.results IS 'Résultats détaillés JSON de l''envoi (pour debug)';
