-- Ajouter une colonne pour stocker l'URL de la miniature de carte des randonnées
ALTER TABLE tips ADD COLUMN IF NOT EXISTS hike_thumbnail_url TEXT;

-- Commentaire explicatif
COMMENT ON COLUMN tips.hike_thumbnail_url IS 'URL de la miniature de carte générée pour les randonnées (stockée dans Supabase Storage)';

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_tips_hike_thumbnail ON tips(hike_thumbnail_url) WHERE hike_thumbnail_url IS NOT NULL;
