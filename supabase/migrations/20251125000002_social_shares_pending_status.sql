-- Migration: Add pending status to social_post_shares
-- Purpose: Allow shares without profile URL to be pending until profile is added

-- Add status column with default 'credited' for backwards compatibility
ALTER TABLE social_post_shares
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'credited'
CHECK (status IN ('pending', 'credited', 'revoked'));

-- Add index for filtering by status (admin queries)
CREATE INDEX IF NOT EXISTS idx_social_post_shares_status
ON social_post_shares(status);

-- Create view for pending shares (admin moderation)
-- Note: on ne sélectionne pas osp.platform car sps.platform existe déjà
CREATE OR REPLACE VIEW pending_social_shares AS
SELECT
  sps.*,
  osp.post_url AS original_post_url,
  osp.caption AS post_caption,
  osp.credits_reward AS post_credits_reward
FROM social_post_shares sps
LEFT JOIN official_social_posts osp ON sps.post_id = osp.id
WHERE sps.status = 'pending'
ORDER BY sps.shared_at DESC;

-- Function to complete a pending share (add profile URL and credit)
CREATE OR REPLACE FUNCTION complete_pending_share(
  p_share_id UUID,
  p_social_profile_url TEXT
) RETURNS JSONB AS $$
DECLARE
  v_share RECORD;
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Get the pending share
  SELECT * INTO v_share
  FROM social_post_shares
  WHERE id = p_share_id AND status = 'pending';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Partage non trouvé ou déjà traité');
  END IF;

  -- Get current balance
  SELECT credits_balance INTO v_current_balance
  FROM clients
  WHERE email = v_share.user_email
  ORDER BY created_at DESC
  LIMIT 1;

  v_new_balance := COALESCE(v_current_balance, 0) + v_share.credits_awarded;

  -- Update all clients for this user
  UPDATE clients
  SET
    credits_balance = v_new_balance,
    credits_lifetime_earned = credits_lifetime_earned + v_share.credits_awarded
  WHERE email = v_share.user_email;

  -- Update the share status and profile URL
  UPDATE social_post_shares
  SET
    status = 'credited',
    social_profile_url = p_social_profile_url
  WHERE id = p_share_id;

  -- Create credit transaction
  INSERT INTO credit_transactions (
    user_email,
    amount,
    balance_after,
    transaction_type,
    description,
    metadata
  ) VALUES (
    v_share.user_email,
    v_share.credits_awarded,
    v_new_balance,
    'earn_social',
    'Partage ' || v_share.platform || ' officiel WelcomeApp (complété)',
    jsonb_build_object(
      'post_id', v_share.post_id,
      'platform', v_share.platform,
      'share_id', v_share.id,
      'completed_at', NOW()
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'credits_awarded', v_share.credits_awarded,
    'new_balance', v_new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment
COMMENT ON COLUMN social_post_shares.status IS 'pending = attente profil, credited = crédits accordés, revoked = crédits révoqués';
