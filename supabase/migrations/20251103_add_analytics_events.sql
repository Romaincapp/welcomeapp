-- Migration: Add analytics_events table for tracking user interactions
-- Date: 2025-11-03
-- Description: Table pour tracker les vues, clics, et partages des welcomebooks

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  tip_id UUID REFERENCES tips(id) ON DELETE CASCADE, -- Nullable (événements au niveau welcomebook)
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click', 'share', 'install_pwa')),
  event_data JSONB DEFAULT '{}'::jsonb, -- Données additionnelles (button_name, url, etc.)
  user_session_id TEXT, -- Identifier la session utilisateur (généré côté client)
  device_type TEXT, -- 'mobile', 'tablet', 'desktop'
  user_language TEXT, -- Langue du visiteur (ISO 639-1: 'fr', 'en', etc.)
  user_country TEXT, -- Pays du visiteur (ISO 3166-1: 'BE', 'FR', etc.) - optionnel
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Créer des index pour les requêtes fréquentes
CREATE INDEX idx_analytics_events_client_id ON analytics_events(client_id);
CREATE INDEX idx_analytics_events_tip_id ON analytics_events(tip_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_session ON analytics_events(user_session_id);

-- Créer un index composite pour les queries par client + date
CREATE INDEX idx_analytics_events_client_date ON analytics_events(client_id, created_at DESC);

-- RLS Policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy 1: Tout le monde peut INSERT (tracking public)
CREATE POLICY "Public can insert analytics events"
  ON analytics_events
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy 2: Les gestionnaires peuvent SELECT leurs propres événements
CREATE POLICY "Owners can view their analytics events"
  ON analytics_events
  FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM clients WHERE email = auth.jwt()->>'email'
    )
  );

-- Policy 3: Les gestionnaires peuvent DELETE leurs propres événements (GDPR)
CREATE POLICY "Owners can delete their analytics events"
  ON analytics_events
  FOR DELETE
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM clients WHERE email = auth.jwt()->>'email'
    )
  );

-- Commenter la table et les colonnes importantes
COMMENT ON TABLE analytics_events IS 'Événements d''analytics pour tracker l''usage des welcomebooks (vues, clics, partages)';
COMMENT ON COLUMN analytics_events.event_type IS 'Type d''événement: view (vue page), click (clic bouton/lien), share (partage), install_pwa';
COMMENT ON COLUMN analytics_events.event_data IS 'Données JSON additionnelles selon l''événement (ex: {"button": "directions", "destination": "google_maps"})';
COMMENT ON COLUMN analytics_events.user_session_id IS 'ID de session unique généré côté client pour identifier les sessions uniques';
COMMENT ON COLUMN analytics_events.device_type IS 'Type d''appareil du visiteur (mobile, tablet, desktop)';
COMMENT ON COLUMN analytics_events.user_language IS 'Langue du navigateur du visiteur (ISO 639-1)';
COMMENT ON COLUMN analytics_events.user_country IS 'Pays du visiteur détecté via IP (optionnel, ISO 3166-1)';
