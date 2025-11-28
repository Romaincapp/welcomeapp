-- ============================================================================
-- Migration: Système de Crédits Sociaux MVP
-- Date: 2025-11-22
-- Description: Système freemium avec crédits gagnés via partages sociaux
-- ============================================================================

-- ============================================================================
-- 1. MODIFICATION TABLE CLIENTS (ajout colonnes crédits)
-- ============================================================================

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS credits_balance INTEGER DEFAULT 150,
  ADD COLUMN IF NOT EXISTS credits_lifetime_earned INTEGER DEFAULT 150,
  ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'grace_period', 'suspended', 'to_delete')),
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS last_credit_consumption TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Backfill 150 crédits pour tous les clients existants
UPDATE clients
SET
  credits_balance = 150,
  credits_lifetime_earned = 150,
  account_status = 'active',
  last_credit_consumption = NOW()
WHERE credits_balance IS NULL;

-- ============================================================================
-- 2. TABLE CREDIT_TRANSACTIONS (historique complet)
-- ============================================================================

CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  amount INTEGER NOT NULL, -- Positif = gain, négatif = dépense
  balance_after INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'earn_social',      -- Gagné via partage social
    'spend_daily',      -- Consommation quotidienne
    'manual_add',       -- Ajout manuel admin
    'manual_remove',    -- Retrait manuel admin
    'initial_bonus'     -- Bonus initial signup
  )),
  description TEXT NOT NULL,
  metadata JSONB, -- { platform, post_url, admin_note, welcomebook_count, etc. }
  request_id UUID, -- Référence vers credit_requests (ajouté après création de la table)
  created_by TEXT, -- Email admin si ajout/retrait manuel
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(user_email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(transaction_type);

-- ============================================================================
-- 3. TABLE POST_TEMPLATES (10 templates FR)
-- ============================================================================

CREATE TABLE IF NOT EXISTS post_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  emoji TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('testimonial', 'comparison', 'benefit', 'engagement', 'insight', 'stats', 'problem_solution', 'quick_share')),
  content TEXT NOT NULL,
  variables JSONB, -- Array des variables à personnaliser: ["[ta_durée]", "[ta_localisation]", etc.]
  platform_recommendations JSONB, -- ["linkedin", "facebook", "instagram"]
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. TABLE CREDIT_REQUESTS (demandes de crédits sociaux)
-- ============================================================================

CREATE TABLE IF NOT EXISTS credit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'facebook', 'instagram', 'twitter', 'blog', 'newsletter')),
  post_type TEXT NOT NULL CHECK (post_type IN ('post', 'story')),
  template_id UUID REFERENCES post_templates(id),
  personalization_score INTEGER CHECK (personalization_score BETWEEN 100 AND 150), -- 100% = copié-collé, 150% = ultra perso
  credits_requested INTEGER NOT NULL,
  proof_url TEXT,
  proof_screenshot_url TEXT,
  custom_content TEXT, -- Contenu posté (pour review admin)
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'auto_approved')),
  reviewed_by TEXT, -- Email admin
  review_note TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_credit_requests_status ON credit_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_requests_user ON credit_requests(user_email);
CREATE INDEX IF NOT EXISTS idx_credit_requests_client ON credit_requests(client_id);

-- Ajout foreign key credit_transactions -> credit_requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_credit_transactions_request'
  ) THEN
    ALTER TABLE credit_transactions
      ADD CONSTRAINT fk_credit_transactions_request
      FOREIGN KEY (request_id)
      REFERENCES credit_requests(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================================
-- 5. TABLE TRUSTED_USERS (auto-approve utilisateurs de confiance)
-- ============================================================================

CREATE TABLE IF NOT EXISTS trusted_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT UNIQUE NOT NULL,
  approved_requests_count INTEGER DEFAULT 0,
  trust_level TEXT DEFAULT 'standard' CHECK (trust_level IN ('standard', 'trusted', 'vip')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trusted_users_email ON trusted_users(user_email);

-- ============================================================================
-- 6. RLS POLICIES
-- ============================================================================

-- 6.1 CREDIT_TRANSACTIONS
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own credit transactions" ON credit_transactions;
CREATE POLICY "Users view own credit transactions"
  ON credit_transactions FOR SELECT
  TO authenticated
  USING (user_email = auth.email());

DROP POLICY IF EXISTS "Admin full access credit transactions" ON credit_transactions;
CREATE POLICY "Admin full access credit transactions"
  ON credit_transactions FOR ALL
  TO authenticated
  USING (is_admin());

-- 6.2 CREDIT_REQUESTS
ALTER TABLE credit_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users create own credit requests" ON credit_requests;
CREATE POLICY "Users create own credit requests"
  ON credit_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_email = auth.email());

DROP POLICY IF EXISTS "Users view own credit requests" ON credit_requests;
CREATE POLICY "Users view own credit requests"
  ON credit_requests FOR SELECT
  TO authenticated
  USING (user_email = auth.email());

DROP POLICY IF EXISTS "Admin full access credit requests" ON credit_requests;
CREATE POLICY "Admin full access credit requests"
  ON credit_requests FOR ALL
  TO authenticated
  USING (is_admin());

-- 6.3 POST_TEMPLATES (publics pour tous les users authentifiés)
ALTER TABLE post_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Templates viewable by authenticated users" ON post_templates;
CREATE POLICY "Templates viewable by authenticated users"
  ON post_templates FOR SELECT
  TO authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Admin manage templates" ON post_templates;
CREATE POLICY "Admin manage templates"
  ON post_templates FOR ALL
  TO authenticated
  USING (is_admin());

-- 6.4 TRUSTED_USERS (admin uniquement)
ALTER TABLE trusted_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manage trusted users" ON trusted_users;
CREATE POLICY "Admin manage trusted users"
  ON trusted_users FOR ALL
  TO authenticated
  USING (is_admin());

-- ============================================================================
-- 7. FONCTIONS SQL UTILES
-- ============================================================================

-- 7.1 Trigger auto-update updated_at pour post_templates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_post_templates_updated_at ON post_templates;
CREATE TRIGGER update_post_templates_updated_at
  BEFORE UPDATE ON post_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_trusted_users_updated_at ON trusted_users;
CREATE TRIGGER update_trusted_users_updated_at
  BEFORE UPDATE ON trusted_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7.2 Fonction: Compter welcomebooks d'un utilisateur
CREATE OR REPLACE FUNCTION count_user_welcomebooks(p_user_email TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM clients WHERE email = p_user_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7.3 Fonction: Calculer intervalle de consommation selon nombre de welcomebooks
CREATE OR REPLACE FUNCTION get_consumption_interval_hours(p_welcomebook_count INTEGER)
RETURNS NUMERIC AS $$
DECLARE
  base_hours NUMERIC := 24.0;
  acceleration NUMERIC;
BEGIN
  -- 1 app = 0%, 2 apps = 10%, 3 apps = 20%, ..., plafond 50%
  acceleration := LEAST((p_welcomebook_count - 1) * 0.10, 0.50);
  RETURN base_hours * (1.0 - acceleration);
END;
$$ LANGUAGE plpgsql;

-- 7.4 Vue: Résumé crédits par utilisateur
CREATE OR REPLACE VIEW user_credits_summary AS
SELECT
  c.email AS user_email,
  c.credits_balance,
  c.credits_lifetime_earned,
  c.account_status,
  c.suspended_at,
  c.last_credit_consumption,
  COUNT(DISTINCT c.id) AS welcomebook_count,
  get_consumption_interval_hours(COUNT(DISTINCT c.id)::INTEGER) AS consumption_interval_hours,
  COALESCE(tr.total_earned, 0) AS total_earned,
  COALESCE(tr.total_spent, 0) AS total_spent
FROM clients c
LEFT JOIN LATERAL (
  SELECT
    SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) AS total_earned,
    ABS(SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END)) AS total_spent
  FROM credit_transactions ct
  WHERE ct.user_email = c.email
) tr ON true
GROUP BY c.email, c.credits_balance, c.credits_lifetime_earned, c.account_status, c.suspended_at, c.last_credit_consumption, tr.total_earned, tr.total_spent;

-- ============================================================================
-- 8. SEED 10 TEMPLATES DE POSTS SOCIAUX (FRANÇAIS)
-- ============================================================================

-- Insérer uniquement si aucun template n'existe déjà
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM post_templates LIMIT 1) THEN
    INSERT INTO post_templates (title, emoji, category, content, variables, platform_recommendations) VALUES

-- 1. ⏰ Gain de temps
(
  'Gain de temps',
  '⏰',
  'benefit',
  E'[ta_durée] pour créer mon guide de bienvenue digital pour mes voyageurs.\n\nAvant, je passais des heures à répondre aux mêmes questions :\n❌ "Où sont les clés ?"\n❌ "Comment fonctionne le WiFi ?"\n❌ "Quels restaurants recommandez-vous ?"\n\nAujourd\'hui avec Welcomeapp :\n✅ Tout est centralisé dans un QR code\n✅ Mes voyageurs ont toutes les infos instantanément\n✅ Je gagne [ta_estimation] par réservation\n\nRésultat : Plus de temps pour ce qui compte vraiment - accueillir mes voyageurs avec le sourire 😊\n\n[ton_retour_perso]\n\n#GestionLocative #LocationSaisonnière #DigitalNomad',
  '["[ta_durée]", "[ta_estimation]", "[ton_retour_perso]"]',
  '["linkedin", "facebook"]'
),

-- 2. 📊 Résultat concret
(
  'Résultat concret',
  '📊',
  'stats',
  E'📊 Mes chiffres après [ta_période] d\'utilisation de Welcomeapp :\n\n✅ [ton_chiffre_1]\n✅ [ton_chiffre_2]\n✅ [ton_chiffre_3]\n\nMon meilleur investissement de l\'année ? Ce guide digital.\n\nPourquoi ça marche ?\n→ Mes voyageurs ont TOUT sous la main (restaurants, activités, infos pratiques)\n→ Moins de messages paniqués à 23h\n→ Meilleures notes = plus de réservations\n\nSi vous gérez une location [ta_localisation], c\'est un game-changer.\n\n[ta_conclusion_perso]\n\n#Airbnb #Booking #LocationVacances',
  '["[ta_période]", "[ton_chiffre_1]", "[ton_chiffre_2]", "[ton_chiffre_3]", "[ta_localisation]", "[ta_conclusion_perso]"]',
  '["linkedin", "facebook", "instagram"]'
),

-- 3. 🔄 Avant/Après
(
  'Avant/Après',
  '🔄',
  'comparison',
  E'AVANT vs APRÈS avoir digitalisé l\'accueil de mes voyageurs 👇\n\n📱 AVANT :\n• Messages à répétition ("Où sont les serviettes ?")\n• Imprimer des documents à chaque arrivée\n• Stress si je ne suis pas dispo au téléphone\n• Infos obsolètes (restaurant fermé depuis 6 mois...)\n\n✨ APRÈS (avec Welcomeapp) :\n• QR code scanné = toutes les infos accessibles\n• Mises à jour en temps réel depuis mon téléphone\n• Mes voyageurs trouvent mes meilleures adresses secrètes\n• [ton_bénéfice_principal]\n\nLa différence ? [ton_insight_clé]\n\n💬 Vous gérez comment l\'accueil de vos voyageurs ?\n\n#Conciergerie #SmartHome #Hospitality',
  '["[ton_bénéfice_principal]", "[ton_insight_clé]"]',
  '["linkedin", "facebook"]'
),

-- 4. 💬 Question engageante
(
  'Question engageante',
  '💬',
  'engagement',
  E'Question pour les propriétaires de locations saisonnières 👇\n\nCombien de fois par semaine recevez-vous ces messages ?\n\n📩 "Bonjour, où se trouve [question_basique] ?"\n📩 "Comment fonctionne [appareil_basique] ?"\n📩 "Vous recommandez quoi comme [restaurant/activité] ?"\n\nMoi, c\'était [ton_chiffre] fois par semaine.\n\nJusqu\'à ce que je digitalise tout avec un simple QR code à scanner :\n→ Guide complet de la location\n→ Tous mes bons plans [ta_région]\n→ Infos pratiques mises à jour en temps réel\n\nRésultat : [ton_résultat_concret]\n\n💡 Et vous, quelle est votre astuce pour gérer ces demandes récurrentes ?\n\n#LocationSaisonnière #Airbnb #PropTech',
  '["[question_basique]", "[appareil_basique]", "[restaurant/activité]", "[ton_chiffre]", "[ta_région]", "[ton_résultat_concret]"]',
  '["linkedin", "facebook"]'
),

-- 5. 🌟 Bénéfice voyageur
(
  'Bénéfice voyageur',
  '🌟',
  'benefit',
  E'Ce que mes voyageurs adorent dans mon guide digital 👇\n\n🎯 "Vos recommandations de restaurants sont top !"\n🗺️ "La carte interactive nous a fait gagner un temps fou"\n📸 "On a visité tous vos spots photos secrets"\n🏠 "Toutes les infos pratiques au même endroit, génial !"\n\nLe secret ? [ton_secret]\n\nAu lieu de leur donner un classeur poussiéreux avec des infos périmées, ils scannent un QR code et ont :\n\n✅ Mes [nombre] meilleurs restaurants testés personnellement\n✅ [nombre] activités incontournables [ta_région]\n✅ Tous les codes WiFi, parkings, consignes de tri...\n✅ Une carte interactive pour tout visualiser\n\n[ta_anecdote_voyageur]\n\nRésultat : [ta_métrique] ⭐\n\n#Hospitality #TravelTips #VacationRental',
  '["[ton_secret]", "[nombre]", "[ta_région]", "[ta_anecdote_voyageur]", "[ta_métrique]"]',
  '["instagram", "facebook"]'
),

-- 6. 💡 Le déclic
(
  'Le déclic',
  '💡',
  'insight',
  E'Le déclic qui a changé ma gestion locative 👇\n\nJ\'ai réalisé que je perdais [ta_durée] par semaine à :\n\n❌ Répondre aux mêmes questions\n❌ Mettre à jour des documents Word\n❌ Envoyer des listes de recommandations par SMS\n❌ [ta_tâche_répétitive]\n\n💡 Puis j\'ai compris : mes voyageurs ne veulent pas me déranger.\n\nIls veulent juste les infos. Au bon moment. Sans chercher.\n\nSolution : [ta_solution]\n\nDepuis que j\'ai créé mon guide digital accessible par QR code :\n\n✅ [ton_bénéfice_1]\n✅ [ton_bénéfice_2]\n✅ [ton_bénéfice_3]\n\nMoins de friction = voyageurs plus heureux = meilleures notes.\n\nSimple, mais puissant.\n\n#LocationSaisonnière #Automatisation #PropTech',
  '["[ta_durée]", "[ta_tâche_répétitive]", "[ta_solution]", "[ton_bénéfice_1]", "[ton_bénéfice_2]", "[ton_bénéfice_3]"]',
  '["linkedin"]'
),

-- 7. 🎯 Statistique/Chiffre
(
  'Statistique/Chiffre',
  '🎯',
  'stats',
  E'[ton_chiffre_marquant] 🔥\n\nC\'est le nombre de [ta_métrique] depuis que j\'ai digitalisé l\'accueil de mes voyageurs.\n\nComment j\'ai fait ?\n\n1️⃣ Créé un guide complet [ta_destination] en [ta_durée]\n2️⃣ Ajouté mes [nombre] meilleurs bons plans locaux\n3️⃣ Généré un QR code à scanner (collé dans l\'appartement)\n4️⃣ [ton_étape_spécifique]\n\nRésultat concret :\n\n📈 [métrique_1]\n⭐ [métrique_2]\n⏰ [métrique_3]\n\nLe meilleur ? [ton_meilleur_bénéfice]\n\n💬 Question : vous utilisez quoi pour améliorer l\'expérience de vos voyageurs ?\n\n#DataDriven #Hospitality #LocationVacances',
  '["[ton_chiffre_marquant]", "[ta_métrique]", "[ta_destination]", "[ta_durée]", "[nombre]", "[ton_étape_spécifique]", "[métrique_1]", "[métrique_2]", "[métrique_3]", "[ton_meilleur_bénéfice]"]',
  '["linkedin", "facebook"]'
),

-- 8. ⭐ Témoignage simple
(
  'Témoignage simple',
  '⭐',
  'testimonial',
  E'Petit témoignage qui fait chaud au cœur ❤️\n\nMessage reçu ce matin d\'un voyageur :\n\n"[citation_voyageur]"\n\nCe qui m\'a le plus marqué ? [ton_insight]\n\nDepuis que j\'ai créé mon guide digital pour [ta_location] :\n\n✨ Les voyageurs découvrent [ton_bénéfice_1]\n✨ Ils apprécient [ton_bénéfice_2]\n✨ Et surtout : [ton_bénéfice_3]\n\nMon astuce : [ton_conseil_pratique]\n\nRésultat : des avis comme celui-ci, et une note moyenne de [ta_note] ⭐\n\n[ta_conclusion]\n\n#CustomerExperience #Hospitality #Airbnb',
  '["[citation_voyageur]", "[ton_insight]", "[ta_location]", "[ton_bénéfice_1]", "[ton_bénéfice_2]", "[ton_bénéfice_3]", "[ton_conseil_pratique]", "[ta_note]", "[ta_conclusion]"]',
  '["facebook", "instagram"]'
),

-- 9. ✅ Problème résolu
(
  'Problème résolu',
  '✅',
  'problem_solution',
  E'PROBLÈME : [ton_problème_initial] 😤\n\nC\'était mon quotidien de gestionnaire de location [ta_localisation].\n\nChaque semaine, la même galère :\n• [problème_1]\n• [problème_2]\n• [problème_3]\n\nJusqu\'au jour où [ton_déclic]\n\n💡 LA SOLUTION :\n\nCréer un guide complet accessible par QR code avec :\n\n1. Toutes les infos pratiques (WiFi, parking, consignes)\n2. Mes recommandations [restaurants/activités] testées\n3. Une carte interactive pour tout localiser\n4. [ton_ajout_spécifique]\n\nRÉSULTAT APRÈS [ta_période] :\n\n✅ [résultat_1]\n✅ [résultat_2]\n✅ [résultat_3]\n\n[ta_conclusion_inspirante]\n\n#ProblemSolving #PropTech #SmartHospitality',
  '["[ton_problème_initial]", "[ta_localisation]", "[problème_1]", "[problème_2]", "[problème_3]", "[ton_déclic]", "[restaurants/activités]", "[ton_ajout_spécifique]", "[ta_période]", "[résultat_1]", "[résultat_2]", "[résultat_3]", "[ta_conclusion_inspirante]"]',
  '["linkedin", "facebook"]'
),

-- 10. ⚡ Partage rapide
(
  'Partage rapide',
  '⚡',
  'quick_share',
  E'Guide digital pour locations de vacances = game-changer 🚀\n\nCréé le mien en [ta_durée].\nMes voyageurs adorent.\n[ta_note_moyenne] en moyenne.\n\nTout est dans un QR code : infos pratiques + bons plans [ta_région] + carte interactive.\n\nMoins de messages. Plus de 5 étoiles.\n\n#LocationSaisonnière #DigitalTransformation',
  '["[ta_durée]", "[ta_note_moyenne]", "[ta_région]"]',
  '["linkedin", "twitter", "instagram"]'
);
  END IF;
END $$;

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================
