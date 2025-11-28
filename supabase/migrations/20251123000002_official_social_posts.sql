-- ============================================================================
-- Migration: Système de Repost de Posts Officiels WelcomeApp
-- Date: 2025-11-23
-- Description: Tables pour gérer les posts officiels WelcomeApp et tracking
--              des partages (trust-based, crédits immédiats)
-- ============================================================================

-- Table: Posts officiels WelcomeApp (gérés par admin)
CREATE TABLE IF NOT EXISTS official_social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'linkedin', 'facebook', 'twitter', 'blog', 'newsletter')),
  post_url TEXT NOT NULL, -- URL du post original à partager
  thumbnail_url TEXT, -- Screenshot/image du post pour preview
  caption TEXT NOT NULL, -- Extrait du contenu (100-150 chars)
  category TEXT, -- 'testimonial' | 'benefit' | 'stats' | 'comparison' | etc.
  credits_reward INT NOT NULL DEFAULT 90, -- Crédits gagnés si partagé
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: Tracking des partages (trust-based)
CREATE TABLE IF NOT EXISTS social_post_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL, -- Email de l'utilisateur (validation applicative uniquement)
  post_id UUID NOT NULL REFERENCES official_social_posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- Copie de la plateforme pour analytics
  credits_awarded INT NOT NULL, -- Crédits effectivement crédités
  shared_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes pour performances
CREATE INDEX idx_official_posts_platform ON official_social_posts(platform) WHERE is_active = true;
CREATE INDEX idx_official_posts_active ON official_social_posts(is_active, created_at DESC);
CREATE INDEX idx_social_shares_user_email ON social_post_shares(user_email, shared_at DESC);
CREATE INDEX idx_social_shares_post_id ON social_post_shares(post_id);

-- Trigger: Mise à jour automatique du champ updated_at
CREATE OR REPLACE FUNCTION update_official_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_official_posts_updated_at
  BEFORE UPDATE ON official_social_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_official_posts_updated_at();

-- RLS Policies
ALTER TABLE official_social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_shares ENABLE ROW LEVEL SECURITY;

-- Policy: Admin peut tout faire sur official_social_posts
CREATE POLICY admin_all_official_posts ON official_social_posts
  FOR ALL
  USING (is_admin());

-- Policy: Tous les utilisateurs authentifiés peuvent lire les posts actifs
CREATE POLICY authenticated_read_active_posts ON official_social_posts
  FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = true);

-- Policy: Users peuvent insérer leurs propres partages
CREATE POLICY users_insert_own_shares ON social_post_shares
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = user_email);

-- Policy: Users peuvent voir leurs propres partages
CREATE POLICY users_read_own_shares ON social_post_shares
  FOR SELECT
  USING (auth.jwt() ->> 'email' = user_email);

-- Policy: Admin peut tout voir sur social_post_shares
CREATE POLICY admin_all_social_shares ON social_post_shares
  FOR ALL
  USING (is_admin());

-- Vue SQL: Analytics des partages par post (pour admin)
CREATE OR REPLACE VIEW official_posts_analytics AS
SELECT
  op.id,
  op.platform,
  op.post_url,
  op.caption,
  op.credits_reward,
  op.is_active,
  op.created_at,
  COUNT(DISTINCT sps.user_email) AS unique_sharers,
  COUNT(sps.id) AS total_shares,
  SUM(sps.credits_awarded) AS total_credits_distributed
FROM official_social_posts op
LEFT JOIN social_post_shares sps ON op.id = sps.post_id
GROUP BY op.id, op.platform, op.post_url, op.caption, op.credits_reward, op.is_active, op.created_at
ORDER BY op.created_at DESC;

-- Vue SQL: Top sharers (utilisateurs qui partagent le plus)
CREATE OR REPLACE VIEW top_social_sharers AS
SELECT
  sps.user_email,
  COUNT(sps.id) AS total_shares,
  SUM(sps.credits_awarded) AS total_credits_earned,
  MAX(sps.shared_at) AS last_share_at
FROM social_post_shares sps
GROUP BY sps.user_email
ORDER BY total_shares DESC, total_credits_earned DESC
LIMIT 50;

-- Fonction: Insertion de posts officiels avec validation
CREATE OR REPLACE FUNCTION insert_official_post(
  p_platform TEXT,
  p_post_url TEXT,
  p_thumbnail_url TEXT,
  p_caption TEXT,
  p_category TEXT,
  p_credits_reward INT
)
RETURNS UUID AS $$
DECLARE
  v_post_id UUID;
BEGIN
  -- Validation
  IF p_platform NOT IN ('instagram', 'linkedin', 'facebook', 'twitter', 'blog', 'newsletter') THEN
    RAISE EXCEPTION 'Invalid platform: %', p_platform;
  END IF;

  IF p_credits_reward < 0 THEN
    RAISE EXCEPTION 'Credits reward must be >= 0';
  END IF;

  -- Insertion
  INSERT INTO official_social_posts (
    platform, post_url, thumbnail_url, caption, category, credits_reward
  ) VALUES (
    p_platform, p_post_url, p_thumbnail_url, p_caption, p_category, p_credits_reward
  )
  RETURNING id INTO v_post_id;

  RETURN v_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================
