-- ============================================================================
-- Migration: Ajouter champ profil social aux partages
-- Date: 2025-11-25
-- Description: Permet de stocker l'URL du profil social de l'utilisateur
--              pour que l'admin puisse vérifier et remercier publiquement
-- ============================================================================

-- Ajouter le champ profil social à la table social_post_shares
ALTER TABLE social_post_shares
  ADD COLUMN IF NOT EXISTS social_profile_url TEXT;

-- Commentaire explicatif
COMMENT ON COLUMN social_post_shares.social_profile_url IS
'URL ou nom du profil social de l''utilisateur pour vérification admin et remerciements publics';

-- Index pour recherche par profil (optionnel, utile si recherche fréquente)
CREATE INDEX IF NOT EXISTS idx_social_shares_profile
  ON social_post_shares(social_profile_url)
  WHERE social_profile_url IS NOT NULL;

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================
