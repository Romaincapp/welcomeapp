-- Table pour tracker les générations de commentaires IA (anti-spam)
CREATE TABLE IF NOT EXISTS ai_generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  tips_count INTEGER NOT NULL DEFAULT 0,
  provider_used TEXT,
  success_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les queries de rate limiting
CREATE INDEX idx_ai_generation_logs_client_created ON ai_generation_logs(client_id, created_at DESC);

-- RLS policies
ALTER TABLE ai_generation_logs ENABLE ROW LEVEL SECURITY;

-- Policy : Les clients peuvent voir leurs propres logs
CREATE POLICY "Users can view their own generation logs"
  ON ai_generation_logs
  FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Policy : Seul le système peut insérer des logs (via service role)
CREATE POLICY "Service role can insert generation logs"
  ON ai_generation_logs
  FOR INSERT
  WITH CHECK (true);

-- Fonction helper pour vérifier le rate limit (dernière génération < 5 min)
CREATE OR REPLACE FUNCTION check_generation_cooldown(p_client_id UUID)
RETURNS TABLE(
  can_generate BOOLEAN,
  last_generation_at TIMESTAMP WITH TIME ZONE,
  seconds_remaining INTEGER
) AS $$
DECLARE
  v_last_generation TIMESTAMP WITH TIME ZONE;
  v_cooldown_seconds INTEGER := 300; -- 5 minutes
  v_elapsed_seconds INTEGER;
BEGIN
  -- Récupérer la dernière génération
  SELECT created_at INTO v_last_generation
  FROM ai_generation_logs
  WHERE client_id = p_client_id
  ORDER BY created_at DESC
  LIMIT 1;

  -- Si aucune génération précédente, OK
  IF v_last_generation IS NULL THEN
    RETURN QUERY SELECT TRUE, NULL::TIMESTAMP WITH TIME ZONE, 0;
    RETURN;
  END IF;

  -- Calculer le temps écoulé
  v_elapsed_seconds := EXTRACT(EPOCH FROM (NOW() - v_last_generation))::INTEGER;

  -- Vérifier si le cooldown est passé
  IF v_elapsed_seconds >= v_cooldown_seconds THEN
    RETURN QUERY SELECT TRUE, v_last_generation, 0;
  ELSE
    RETURN QUERY SELECT FALSE, v_last_generation, (v_cooldown_seconds - v_elapsed_seconds);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction helper pour vérifier le quota quotidien (max 100 générations/jour)
CREATE OR REPLACE FUNCTION check_daily_quota(p_client_id UUID)
RETURNS TABLE(
  can_generate BOOLEAN,
  used_count INTEGER,
  max_count INTEGER
) AS $$
DECLARE
  v_used_count INTEGER;
  v_max_count INTEGER := 100; -- 100 générations max par jour
BEGIN
  -- Compter les générations des dernières 24h
  SELECT COALESCE(SUM(tips_count), 0) INTO v_used_count
  FROM ai_generation_logs
  WHERE client_id = p_client_id
    AND created_at > NOW() - INTERVAL '24 hours';

  -- Vérifier si le quota est dépassé
  IF v_used_count >= v_max_count THEN
    RETURN QUERY SELECT FALSE, v_used_count, v_max_count;
  ELSE
    RETURN QUERY SELECT TRUE, v_used_count, v_max_count;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
