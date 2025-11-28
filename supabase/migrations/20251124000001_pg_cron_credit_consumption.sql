-- ============================================================================
-- Migration: pg_cron pour Consommation de Crédits
-- Date: 2025-11-24
-- Description: Remplace le Vercel Cron par pg_cron natif PostgreSQL
-- Avantages: Crons illimités, 0 latence, robuste (indépendant de Vercel)
-- ============================================================================

-- 1. Activer l'extension pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Accorder les permissions nécessaires
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- ============================================================================
-- 2. Fonction principale de consommation des crédits
-- ============================================================================

CREATE OR REPLACE FUNCTION public.consume_daily_credits()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user RECORD;
  v_credits_consumed INTEGER := 0;
  v_users_processed INTEGER := 0;
  v_users_entered_grace INTEGER := 0;
  v_users_suspended INTEGER := 0;
  v_errors TEXT[] := ARRAY[]::TEXT[];
  v_new_balance INTEGER;
  v_should_consume BOOLEAN;
  v_interval_hours NUMERIC;
  v_next_consumption TIMESTAMP WITH TIME ZONE;
  v_days_since_suspension INTEGER;
  v_start_time TIMESTAMP WITH TIME ZONE := clock_timestamp();
BEGIN
  -- Parcourir tous les utilisateurs éligibles
  -- (balance > 0 OU en grace_period pour vérifier suspension)
  FOR v_user IN
    SELECT
      user_email,
      credits_balance,
      welcomebook_count,
      last_credit_consumption,
      account_status,
      consumption_interval_hours
    FROM user_credits_summary
    WHERE credits_balance > 0 OR account_status = 'grace_period'
  LOOP
    BEGIN
      -- ================================================================
      -- Cas 1: Vérifier si grace_period > 7 jours -> suspension
      -- ================================================================
      IF v_user.account_status = 'grace_period' THEN
        SELECT EXTRACT(DAY FROM (NOW() - suspended_at))::INTEGER
        INTO v_days_since_suspension
        FROM clients
        WHERE email = v_user.user_email
        LIMIT 1;

        IF v_days_since_suspension IS NOT NULL AND v_days_since_suspension >= 7 THEN
          -- Passer en status 'suspended'
          UPDATE clients
          SET account_status = 'suspended'
          WHERE email = v_user.user_email;

          v_users_suspended := v_users_suspended + 1;

          -- TODO Phase 2: Envoyer email "Account Suspended"
          CONTINUE; -- Passer à l'utilisateur suivant
        END IF;
      END IF;

      -- ================================================================
      -- Cas 2: Consommer un crédit si intervalle atteint
      -- ================================================================
      IF v_user.credits_balance > 0 THEN
        -- Calculer l'intervalle et la prochaine consommation
        v_interval_hours := v_user.consumption_interval_hours;

        -- Gérer le cas où last_credit_consumption est NULL
        IF v_user.last_credit_consumption IS NULL THEN
          v_should_consume := TRUE;
        ELSE
          v_next_consumption := v_user.last_credit_consumption + (v_interval_hours || ' hours')::INTERVAL;
          v_should_consume := NOW() >= v_next_consumption;
        END IF;

        IF v_should_consume THEN
          v_new_balance := v_user.credits_balance - 1;

          -- Mettre à jour TOUS les clients de l'utilisateur (multi-welcomebooks)
          UPDATE clients
          SET
            credits_balance = v_new_balance,
            last_credit_consumption = NOW(),
            account_status = CASE WHEN v_new_balance = 0 THEN 'grace_period' ELSE 'active' END,
            suspended_at = CASE WHEN v_new_balance = 0 THEN NOW() ELSE NULL END
          WHERE email = v_user.user_email;

          -- Logger la transaction dans credit_transactions
          INSERT INTO credit_transactions (
            user_email,
            amount,
            balance_after,
            transaction_type,
            description,
            metadata
          ) VALUES (
            v_user.user_email,
            -1,
            v_new_balance,
            'spend_daily',
            'Consommation quotidienne automatique (pg_cron)',
            jsonb_build_object(
              'welcomebook_count', v_user.welcomebook_count,
              'previous_balance', v_user.credits_balance,
              'interval_hours', v_interval_hours,
              'source', 'pg_cron'
            )
          );

          v_credits_consumed := v_credits_consumed + 1;

          -- Si passage à 0 crédits -> grace period
          IF v_new_balance = 0 THEN
            v_users_entered_grace := v_users_entered_grace + 1;
            -- TODO Phase 2: Envoyer email "Credit Exhausted"
          END IF;

          -- TODO Phase 2: Vérifier seuils d'alerte (30j, 7j, 1j restants)
        END IF;
      END IF;

      v_users_processed := v_users_processed + 1;

    EXCEPTION WHEN OTHERS THEN
      -- Capturer l'erreur et continuer avec les autres utilisateurs
      v_errors := array_append(v_errors, format('Error processing %s: %s', v_user.user_email, SQLERRM));
    END;
  END LOOP;

  -- Retourner le résumé de l'exécution
  RETURN jsonb_build_object(
    'success', TRUE,
    'users_processed', v_users_processed,
    'credits_consumed', v_credits_consumed,
    'users_entered_grace_period', v_users_entered_grace,
    'users_suspended', v_users_suspended,
    'execution_time_ms', EXTRACT(MILLISECONDS FROM (clock_timestamp() - v_start_time))::INTEGER,
    'errors', CASE WHEN array_length(v_errors, 1) > 0 THEN to_jsonb(v_errors) ELSE NULL END,
    'executed_at', NOW()
  );
END;
$$;

COMMENT ON FUNCTION public.consume_daily_credits() IS
'Consomme 1 crédit par utilisateur selon leur intervalle personnalisé.
Appelée toutes les heures par pg_cron.
Gère aussi le passage en grace_period et suspension.';

-- ============================================================================
-- 3. Fonction de test dry-run (prévisualisation sans effet)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.test_consume_credits_dry_run()
RETURNS TABLE (
  user_email TEXT,
  current_balance INTEGER,
  welcomebook_count BIGINT,
  interval_hours NUMERIC,
  last_consumption TIMESTAMP WITH TIME ZONE,
  next_consumption TIMESTAMP WITH TIME ZONE,
  would_consume BOOLEAN,
  account_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ucs.user_email,
    ucs.credits_balance,
    ucs.welcomebook_count,
    ucs.consumption_interval_hours,
    ucs.last_credit_consumption,
    CASE
      WHEN ucs.last_credit_consumption IS NULL THEN NOW()
      ELSE (ucs.last_credit_consumption + (ucs.consumption_interval_hours || ' hours')::INTERVAL)
    END AS next_consumption,
    CASE
      WHEN ucs.last_credit_consumption IS NULL THEN TRUE
      ELSE (NOW() >= (ucs.last_credit_consumption + (ucs.consumption_interval_hours || ' hours')::INTERVAL))
    END AS would_consume,
    ucs.account_status
  FROM user_credits_summary ucs
  WHERE ucs.credits_balance > 0 OR ucs.account_status = 'grace_period'
  ORDER BY ucs.last_credit_consumption ASC NULLS FIRST;
END;
$$;

COMMENT ON FUNCTION public.test_consume_credits_dry_run() IS
'Prévisualisation des utilisateurs qui seraient affectés par consume_daily_credits().
Ne modifie aucune donnée. Utile pour debug et monitoring.';

-- ============================================================================
-- 4. Planifier le job pg_cron (toutes les heures à :00)
-- ============================================================================

SELECT cron.schedule(
  'consume-daily-credits',           -- Nom du job (unique)
  '0 * * * *',                       -- Toutes les heures à :00
  $$SELECT public.consume_daily_credits()$$
);

-- ============================================================================
-- 5. Vue pour monitoring des exécutions
-- ============================================================================

CREATE OR REPLACE VIEW public.cron_credits_history AS
SELECT
  jrd.runid,
  jrd.status,
  jrd.return_message,
  jrd.start_time,
  jrd.end_time,
  (jrd.end_time - jrd.start_time) AS duration
FROM cron.job_run_details jrd
JOIN cron.job j ON j.jobid = jrd.jobid
WHERE j.jobname = 'consume-daily-credits'
ORDER BY jrd.start_time DESC;

COMMENT ON VIEW public.cron_credits_history IS
'Historique des exécutions du cron job de consommation de crédits.
Utile pour monitoring et debugging.';

-- ============================================================================
-- 6. Fonction utilitaire pour activer/désactiver le cron
-- ============================================================================

CREATE OR REPLACE FUNCTION public.toggle_credit_consumption_cron(p_enabled BOOLEAN)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, cron
AS $func$
BEGIN
  IF p_enabled THEN
    -- Réactiver le cron (upsert: remplace si existe)
    PERFORM cron.schedule(
      'consume-daily-credits',
      '0 * * * *',
      'SELECT public.consume_daily_credits()'
    );
    RETURN 'Cron job "consume-daily-credits" ENABLED (schedule: 0 * * * *)';
  ELSE
    -- Désactiver le cron
    PERFORM cron.unschedule('consume-daily-credits');
    RETURN 'Cron job "consume-daily-credits" DISABLED';
  END IF;
END;
$func$;

COMMENT ON FUNCTION public.toggle_credit_consumption_cron(BOOLEAN) IS
'Active (TRUE) ou désactive (FALSE) le cron job de consommation de crédits.
Utile pour maintenance ou rollback vers Vercel Cron.';

-- ============================================================================
-- 7. Fonction de nettoyage des anciens logs cron (optionnel)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.cleanup_old_cron_logs(p_days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM cron.job_run_details
  WHERE end_time < NOW() - (p_days_to_keep || ' days')::INTERVAL;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

COMMENT ON FUNCTION public.cleanup_old_cron_logs(INTEGER) IS
'Supprime les logs cron plus anciens que N jours (défaut: 30).
Évite que la table cron.job_run_details grossisse indéfiniment.';

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================
