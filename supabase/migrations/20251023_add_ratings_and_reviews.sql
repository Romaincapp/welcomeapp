-- Migration: Ajout des champs rating, user_ratings_total, price_level et reviews
-- Date: 2025-10-23
-- Description: Permet de stocker les notes Google, le nombre d'avis, le niveau de prix et les avis détaillés

-- Ajouter les nouveaux champs à la table tips
ALTER TABLE tips
ADD COLUMN IF NOT EXISTS rating DECIMAL(2, 1), -- Note moyenne (0.0 à 5.0)
ADD COLUMN IF NOT EXISTS user_ratings_total INTEGER DEFAULT 0, -- Nombre total d'avis
ADD COLUMN IF NOT EXISTS price_level INTEGER CHECK (price_level BETWEEN 0 AND 4), -- Niveau de prix (0=gratuit, 1=€, 2=€€, 3=€€€, 4=€€€€)
ADD COLUMN IF NOT EXISTS reviews JSONB; -- Tableau des avis (max 5 avis stockés)

-- Ajouter des commentaires pour documenter les nouveaux champs
COMMENT ON COLUMN tips.rating IS 'Note moyenne Google (0.0 à 5.0)';
COMMENT ON COLUMN tips.user_ratings_total IS 'Nombre total d''avis Google';
COMMENT ON COLUMN tips.price_level IS 'Niveau de prix Google (0=gratuit, 1=€, 2=€€, 3=€€€, 4=€€€€)';
COMMENT ON COLUMN tips.reviews IS 'Tableau JSON contenant jusqu''à 5 avis Google (author_name, rating, text, relative_time_description, profile_photo_url)';

-- Créer un index sur rating pour permettre le filtrage par note
CREATE INDEX IF NOT EXISTS idx_tips_rating ON tips(rating) WHERE rating IS NOT NULL;

-- Créer un index sur price_level pour permettre le filtrage par prix
CREATE INDEX IF NOT EXISTS idx_tips_price_level ON tips(price_level) WHERE price_level IS NOT NULL;
