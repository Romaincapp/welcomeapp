-- ========================================
-- 🛡️ RATE LIMITING SIGNUP (Anti-Bot Protection)
-- ========================================
-- Migration : 20251211000001_signup_rate_limiting.sql
-- Description : Système de rate limiting pour limiter les inscriptions par IP
--               Protection contre les bots et les inscriptions massives

-- 1. Table de suivi des tentatives d'inscription
CREATE TABLE IF NOT EXISTS public.signup_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  email text,
  property_name text,
  success boolean DEFAULT false,
  blocked boolean DEFAULT false,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Index optimisés pour les requêtes de rate limiting
CREATE INDEX IF NOT EXISTS idx_signup_attempts_ip_created
  ON public.signup_attempts(ip_address, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_signup_attempts_created
  ON public.signup_attempts(created_at DESC);

-- 3. Fonction pour vérifier le cooldown d'inscription
-- Règles de rate limiting :
-- - Max 3 tentatives réussies par heure par IP
-- - Max 10 tentatives échouées par heure par IP (détection bot)
-- - Cooldown de 5 minutes entre chaque tentative
CREATE OR REPLACE FUNCTION public.check_signup_rate_limit(
  p_ip_address text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_successful_last_hour integer;
  v_failed_last_hour integer;
  v_last_attempt_time timestamptz;
  v_cooldown_seconds integer;
  v_is_allowed boolean := true;
  v_reason text := '';
  v_retry_after_seconds integer := 0;
BEGIN
  -- Compter les tentatives réussies dans la dernière heure
  SELECT COUNT(*) INTO v_successful_last_hour
  FROM public.signup_attempts
  WHERE ip_address = p_ip_address
    AND success = true
    AND created_at > (now() - interval '1 hour');

  -- Compter les tentatives échouées dans la dernière heure
  SELECT COUNT(*) INTO v_failed_last_hour
  FROM public.signup_attempts
  WHERE ip_address = p_ip_address
    AND success = false
    AND created_at > (now() - interval '1 hour');

  -- Récupérer la dernière tentative
  SELECT created_at INTO v_last_attempt_time
  FROM public.signup_attempts
  WHERE ip_address = p_ip_address
  ORDER BY created_at DESC
  LIMIT 1;

  -- Vérification 1 : Max 3 inscriptions réussies par heure
  IF v_successful_last_hour >= 3 THEN
    v_is_allowed := false;
    v_reason := 'Limite d''inscriptions atteinte (3/heure). Veuillez réessayer plus tard.';
    v_retry_after_seconds := 3600; -- 1 heure
  END IF;

  -- Vérification 2 : Max 10 tentatives échouées par heure (détection bot)
  IF v_failed_last_hour >= 10 THEN
    v_is_allowed := false;
    v_reason := 'Trop de tentatives échouées. Veuillez réessayer dans 1 heure.';
    v_retry_after_seconds := 3600; -- 1 heure
  END IF;

  -- Vérification 3 : Cooldown de 5 minutes entre tentatives
  IF v_last_attempt_time IS NOT NULL THEN
    v_cooldown_seconds := EXTRACT(EPOCH FROM (now() - v_last_attempt_time))::integer;

    IF v_cooldown_seconds < 300 THEN -- 5 minutes = 300 secondes
      v_is_allowed := false;
      v_reason := 'Veuillez patienter avant de réessayer.';
      v_retry_after_seconds := 300 - v_cooldown_seconds;
    END IF;
  END IF;

  -- Retourner le résultat
  RETURN jsonb_build_object(
    'allowed', v_is_allowed,
    'reason', v_reason,
    'retry_after_seconds', v_retry_after_seconds,
    'successful_attempts_last_hour', v_successful_last_hour,
    'failed_attempts_last_hour', v_failed_last_hour
  );
END;
$$;

-- 4. Fonction pour enregistrer une tentative d'inscription
CREATE OR REPLACE FUNCTION public.log_signup_attempt(
  p_ip_address text,
  p_email text DEFAULT NULL,
  p_property_name text DEFAULT NULL,
  p_success boolean DEFAULT false,
  p_blocked boolean DEFAULT false,
  p_user_agent text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attempt_id uuid;
BEGIN
  INSERT INTO public.signup_attempts (
    ip_address,
    email,
    property_name,
    success,
    blocked,
    user_agent,
    created_at
  ) VALUES (
    p_ip_address,
    p_email,
    p_property_name,
    p_success,
    p_blocked,
    p_user_agent,
    now()
  )
  RETURNING id INTO v_attempt_id;

  RETURN v_attempt_id;
END;
$$;

-- 5. Fonction de nettoyage automatique (supprimer les logs > 7 jours)
CREATE OR REPLACE FUNCTION public.cleanup_signup_attempts(
  days_to_keep integer DEFAULT 7
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count integer;
BEGIN
  DELETE FROM public.signup_attempts
  WHERE created_at < (now() - (days_to_keep || ' days')::interval);

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RETURN v_deleted_count;
END;
$$;

-- 6. Vue pour statistiques admin (monitoring des tentatives)
CREATE OR REPLACE VIEW public.signup_attempts_stats AS
SELECT
  date_trunc('hour', created_at) AS hour,
  COUNT(*) AS total_attempts,
  COUNT(*) FILTER (WHERE success = true) AS successful,
  COUNT(*) FILTER (WHERE success = false) AS failed,
  COUNT(*) FILTER (WHERE blocked = true) AS blocked_by_bot_protection,
  COUNT(DISTINCT ip_address) AS unique_ips
FROM public.signup_attempts
WHERE created_at > (now() - interval '24 hours')
GROUP BY date_trunc('hour', created_at)
ORDER BY hour DESC;

-- 7. RLS Policies (sécurité)
ALTER TABLE public.signup_attempts ENABLE ROW LEVEL SECURITY;

-- Policy : Seul l'admin peut lire les tentatives d'inscription
CREATE POLICY "Admin can view signup attempts"
  ON public.signup_attempts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE email = auth.email()
      AND email = 'romainfrancedumoulin@gmail.com'
    )
  );

-- Policy : Les fonctions SECURITY DEFINER peuvent insérer
-- (pas besoin de policy INSERT car géré par fonction)

-- 8. Permissions pour les fonctions
GRANT EXECUTE ON FUNCTION public.check_signup_rate_limit(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_signup_attempt(text, text, text, boolean, boolean, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_signup_attempts(integer) TO authenticated;

-- ========================================
-- 🎯 RÉCAPITULATIF
-- ========================================
-- ✅ Table signup_attempts pour tracking
-- ✅ Rate limiting : 3 signups/heure, 5 min cooldown
-- ✅ Détection bot : max 10 échecs/heure
-- ✅ Fonctions SQL pour vérification et logging
-- ✅ Nettoyage automatique après 7 jours
-- ✅ Vue statistiques pour monitoring admin
-- ✅ RLS activé (lecture admin uniquement)
