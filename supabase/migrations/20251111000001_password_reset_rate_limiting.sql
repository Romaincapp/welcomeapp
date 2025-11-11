-- Migration : Password Reset Rate Limiting
-- Description : Système de rate limiting pour empêcher l'abus du reset de mot de passe
-- Date : 2025-11-11

-- ============================================
-- 1. Créer table password_reset_attempts
-- ============================================

CREATE TABLE IF NOT EXISTS password_reset_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

COMMENT ON TABLE password_reset_attempts IS 'Log des tentatives de reset de mot de passe pour rate limiting (max 4/heure)';
COMMENT ON COLUMN password_reset_attempts.email IS 'Email de l''utilisateur ayant demandé le reset';
COMMENT ON COLUMN password_reset_attempts.attempted_at IS 'Date et heure de la tentative';
COMMENT ON COLUMN password_reset_attempts.ip_address IS 'Adresse IP de l''utilisateur (optionnel, pour sécurité)';
COMMENT ON COLUMN password_reset_attempts.user_agent IS 'User agent du navigateur (optionnel, pour sécurité)';

-- Index pour performance (recherche par email + date)
CREATE INDEX IF NOT EXISTS idx_password_reset_attempts_email ON password_reset_attempts(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_attempts_attempted_at ON password_reset_attempts(attempted_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_attempts_email_attempted ON password_reset_attempts(email, attempted_at DESC);

-- ============================================
-- 2. Fonction pour vérifier le rate limit
-- ============================================

CREATE OR REPLACE FUNCTION check_password_reset_cooldown(p_email TEXT)
RETURNS TABLE (
  can_reset BOOLEAN,
  attempts_count INTEGER,
  seconds_remaining INTEGER,
  next_attempt_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attempts_last_hour INTEGER;
  v_last_attempt_time TIMESTAMPTZ;
  v_cooldown_seconds INTEGER := 900; -- 15 minutes (900 secondes)
  v_seconds_since_last INTEGER;
  v_seconds_remaining INTEGER;
BEGIN
  -- Nettoyer d'abord les vieilles entrées (> 24h)
  DELETE FROM password_reset_attempts
  WHERE attempted_at < NOW() - INTERVAL '24 hours';

  -- Compter les tentatives dans la dernière heure
  SELECT COUNT(*) INTO v_attempts_last_hour
  FROM password_reset_attempts
  WHERE email = p_email
    AND attempted_at > NOW() - INTERVAL '1 hour';

  -- Récupérer l'heure de la dernière tentative
  SELECT attempted_at INTO v_last_attempt_time
  FROM password_reset_attempts
  WHERE email = p_email
  ORDER BY attempted_at DESC
  LIMIT 1;

  -- Si aucune tentative précédente, autoriser
  IF v_last_attempt_time IS NULL THEN
    RETURN QUERY SELECT true, 0, 0, NOW();
    RETURN;
  END IF;

  -- Calculer le temps écoulé depuis la dernière tentative
  v_seconds_since_last := EXTRACT(EPOCH FROM (NOW() - v_last_attempt_time))::INTEGER;

  -- Si plus de 4 tentatives dans la dernière heure, bloquer pendant 1 heure
  IF v_attempts_last_hour >= 4 THEN
    v_seconds_remaining := 3600 - EXTRACT(EPOCH FROM (NOW() - v_last_attempt_time))::INTEGER;
    IF v_seconds_remaining < 0 THEN
      v_seconds_remaining := 0;
    END IF;
    RETURN QUERY SELECT
      v_seconds_remaining <= 0,
      v_attempts_last_hour,
      v_seconds_remaining,
      v_last_attempt_time + INTERVAL '1 hour';
    RETURN;
  END IF;

  -- Sinon, cooldown de 15 minutes entre chaque tentative
  v_seconds_remaining := v_cooldown_seconds - v_seconds_since_last;

  IF v_seconds_remaining < 0 THEN
    v_seconds_remaining := 0;
  END IF;

  RETURN QUERY SELECT
    v_seconds_remaining <= 0,
    v_attempts_last_hour,
    v_seconds_remaining,
    v_last_attempt_time + INTERVAL '15 minutes';
END;
$$;

COMMENT ON FUNCTION check_password_reset_cooldown IS 'Vérifie si un utilisateur peut demander un reset (max 4/heure, cooldown 15 min entre tentatives)';

-- ============================================
-- 3. Fonction pour enregistrer une tentative
-- ============================================

CREATE OR REPLACE FUNCTION log_password_reset_attempt(
  p_email TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO password_reset_attempts (email, ip_address, user_agent)
  VALUES (p_email, p_ip_address, p_user_agent);
END;
$$;

COMMENT ON FUNCTION log_password_reset_attempt IS 'Enregistre une tentative de reset de mot de passe';

-- ============================================
-- 4. Fonction de cleanup automatique
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_password_reset_attempts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Supprimer les entrées de plus de 24 heures
  DELETE FROM password_reset_attempts
  WHERE attempted_at < NOW() - INTERVAL '24 hours';

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RETURN v_deleted_count;
END;
$$;

COMMENT ON FUNCTION cleanup_password_reset_attempts IS 'Nettoie les tentatives de plus de 24 heures';

-- ============================================
-- 5. RLS Policies (sécurité maximale)
-- ============================================

ALTER TABLE password_reset_attempts ENABLE ROW LEVEL SECURITY;

-- Personne ne peut lire directement (utiliser les fonctions)
CREATE POLICY "Aucun accès direct aux tentatives"
  ON password_reset_attempts
  FOR ALL
  USING (false);

-- ============================================
-- 6. Vue pour statistiques admin
-- ============================================

CREATE OR REPLACE VIEW password_reset_stats AS
SELECT
  COUNT(*) AS total_attempts_today,
  COUNT(DISTINCT email) AS unique_emails_today,
  MAX(attempted_at) AS last_attempt_at,
  COUNT(*) FILTER (WHERE attempted_at > NOW() - INTERVAL '1 hour') AS attempts_last_hour
FROM password_reset_attempts
WHERE attempted_at > NOW() - INTERVAL '24 hours';

COMMENT ON VIEW password_reset_stats IS 'Statistiques des tentatives de reset de mot de passe (24h)';

-- ============================================
-- 7. Accorder les permissions
-- ============================================

-- Les fonctions sont SECURITY DEFINER, elles s'exécutent avec les privilèges du créateur
-- Accorder EXECUTE aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION check_password_reset_cooldown(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION log_password_reset_attempt(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_password_reset_attempts() TO authenticated;

-- Accorder SELECT sur la vue aux admins uniquement
GRANT SELECT ON password_reset_stats TO authenticated;
