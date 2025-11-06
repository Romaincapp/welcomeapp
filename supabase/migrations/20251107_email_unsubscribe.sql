-- Migration : Email Unsubscribe System
-- Description : Système de désabonnement des emails marketing avec tokens sécurisés
-- Date : 2025-11-07

-- ============================================
-- 1. Ajouter champ email_unsubscribed dans clients
-- ============================================

ALTER TABLE clients
ADD COLUMN IF NOT EXISTS email_unsubscribed BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS email_unsubscribed_at TIMESTAMPTZ;

COMMENT ON COLUMN clients.email_unsubscribed IS 'Indique si l''utilisateur s''est désabonné des emails marketing';
COMMENT ON COLUMN clients.email_unsubscribed_at IS 'Date de désabonnement des emails marketing';

-- Index pour filtrer rapidement les utilisateurs abonnés
CREATE INDEX IF NOT EXISTS idx_clients_email_unsubscribed ON clients(email_unsubscribed) WHERE email_unsubscribed = false;

-- ============================================
-- 2. Créer table unsubscribe_tokens pour sécuriser les liens
-- ============================================

CREATE TABLE IF NOT EXISTS unsubscribe_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '90 days'),
  used_at TIMESTAMPTZ
);

COMMENT ON TABLE unsubscribe_tokens IS 'Tokens sécurisés pour les liens de désabonnement email (expiration 90 jours)';
COMMENT ON COLUMN unsubscribe_tokens.token IS 'Token unique hashé (SHA256) pour sécuriser le lien';
COMMENT ON COLUMN unsubscribe_tokens.used_at IS 'Date d''utilisation du token (empêche la réutilisation)';

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_unsubscribe_tokens_token ON unsubscribe_tokens(token);
CREATE INDEX IF NOT EXISTS idx_unsubscribe_tokens_client_id ON unsubscribe_tokens(client_id);
CREATE INDEX IF NOT EXISTS idx_unsubscribe_tokens_expires_at ON unsubscribe_tokens(expires_at);

-- ============================================
-- 3. Fonction pour générer un token d'unsubscribe
-- ============================================

CREATE OR REPLACE FUNCTION generate_unsubscribe_token(p_client_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token TEXT;
  v_raw_token TEXT;
BEGIN
  -- Générer un token aléatoire (32 caractères hexadécimaux)
  v_raw_token := encode(gen_random_bytes(16), 'hex');

  -- Hash SHA256 pour stockage sécurisé
  v_token := encode(digest(v_raw_token, 'sha256'), 'hex');

  -- Insérer le token dans la table
  INSERT INTO unsubscribe_tokens (client_id, token)
  VALUES (p_client_id, v_token);

  -- Retourner le token en clair (pour le lien email)
  RETURN v_raw_token;
END;
$$;

COMMENT ON FUNCTION generate_unsubscribe_token IS 'Génère un token sécurisé pour le lien de désabonnement (retourne le token en clair)';

-- ============================================
-- 4. Fonction pour valider et utiliser un token
-- ============================================

CREATE OR REPLACE FUNCTION validate_unsubscribe_token(p_raw_token TEXT)
RETURNS TABLE (
  valid BOOLEAN,
  client_id UUID,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_hashed_token TEXT;
  v_token_record RECORD;
BEGIN
  -- Hash le token fourni
  v_hashed_token := encode(digest(p_raw_token, 'sha256'), 'hex');

  -- Chercher le token
  SELECT * INTO v_token_record
  FROM unsubscribe_tokens
  WHERE token = v_hashed_token;

  -- Token introuvable
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Token invalide ou expiré'::TEXT;
    RETURN;
  END IF;

  -- Token déjà utilisé
  IF v_token_record.used_at IS NOT NULL THEN
    RETURN QUERY SELECT false, v_token_record.client_id, 'Ce lien a déjà été utilisé'::TEXT;
    RETURN;
  END IF;

  -- Token expiré
  IF v_token_record.expires_at < NOW() THEN
    RETURN QUERY SELECT false, v_token_record.client_id, 'Ce lien a expiré'::TEXT;
    RETURN;
  END IF;

  -- Token valide : marquer comme utilisé
  UPDATE unsubscribe_tokens
  SET used_at = NOW()
  WHERE id = v_token_record.id;

  -- Désabonner l'utilisateur
  UPDATE clients
  SET
    email_unsubscribed = true,
    email_unsubscribed_at = NOW()
  WHERE id = v_token_record.client_id;

  -- Retourner succès
  RETURN QUERY SELECT true, v_token_record.client_id, NULL::TEXT;
END;
$$;

COMMENT ON FUNCTION validate_unsubscribe_token IS 'Valide un token d''unsubscribe, désabonne l''utilisateur si valide';

-- ============================================
-- 5. Tâche de nettoyage : supprimer les tokens expirés (>90 jours)
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_expired_unsubscribe_tokens()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM unsubscribe_tokens
  WHERE expires_at < NOW() - INTERVAL '30 days'; -- Garder 30 jours après expiration pour debug

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RETURN v_deleted_count;
END;
$$;

COMMENT ON FUNCTION cleanup_expired_unsubscribe_tokens IS 'Nettoie les tokens expirés depuis plus de 30 jours';

-- ============================================
-- 6. RLS Policies pour unsubscribe_tokens
-- ============================================

ALTER TABLE unsubscribe_tokens ENABLE ROW LEVEL SECURITY;

-- Personne ne peut lire directement (utiliser la fonction validate_unsubscribe_token)
CREATE POLICY "Aucun accès direct aux tokens"
  ON unsubscribe_tokens
  FOR ALL
  USING (false);

-- ============================================
-- 7. Vue pour stats d'unsubscribe
-- ============================================

CREATE OR REPLACE VIEW unsubscribe_stats AS
SELECT
  COUNT(*) FILTER (WHERE email_unsubscribed = true) AS total_unsubscribed,
  COUNT(*) FILTER (WHERE email_unsubscribed = false) AS total_subscribed,
  COUNT(*) AS total_clients,
  ROUND(
    (COUNT(*) FILTER (WHERE email_unsubscribed = true)::numeric /
     NULLIF(COUNT(*), 0)) * 100,
    2
  ) AS unsubscribe_rate,
  COUNT(*) FILTER (
    WHERE email_unsubscribed = true
    AND email_unsubscribed_at > NOW() - INTERVAL '30 days'
  ) AS unsubscribed_last_30_days
FROM clients;

COMMENT ON VIEW unsubscribe_stats IS 'Statistiques des désabonnements emails';

-- ============================================
-- 8. Modifier les vues existantes pour exclure les unsubscribed
-- ============================================

-- Note: Les vues manager_categories et eligible_for_welcome_sequence
-- devraient filtrer les email_unsubscribed = false dans le code applicatif
-- pour éviter d'envoyer des emails aux utilisateurs désabonnés
