-- Table de cache pour les recherches SmartFill
-- Permet de réduire les coûts API Google Places en cachant les résultats de recherches identiques

CREATE TABLE IF NOT EXISTS smartfill_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  results JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  hit_count INTEGER DEFAULT 0,
  last_hit_at TIMESTAMP WITH TIME ZONE
);

-- Index pour recherche rapide par clé
CREATE INDEX idx_smartfill_cache_key ON smartfill_cache(cache_key);

-- Index pour nettoyage des entrées expirées
CREATE INDEX idx_smartfill_cache_expires ON smartfill_cache(expires_at);

-- Index pour statistiques d'utilisation
CREATE INDEX idx_smartfill_cache_hit_count ON smartfill_cache(hit_count DESC);

-- Politique RLS (Row Level Security)
ALTER TABLE smartfill_cache ENABLE ROW LEVEL SECURITY;

-- Permettre la lecture à tous (cache partagé entre utilisateurs pour même localisation)
CREATE POLICY "Allow read access to all users" ON smartfill_cache
  FOR SELECT
  USING (expires_at > NOW());

-- Permettre l'insertion uniquement aux utilisateurs authentifiés
CREATE POLICY "Allow insert for authenticated users" ON smartfill_cache
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Permettre la mise à jour (pour hit_count)
CREATE POLICY "Allow update for all users" ON smartfill_cache
  FOR UPDATE
  USING (expires_at > NOW());

-- Fonction pour nettoyer automatiquement les entrées expirées
CREATE OR REPLACE FUNCTION clean_expired_smartfill_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM smartfill_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Commentaires pour documentation
COMMENT ON TABLE smartfill_cache IS 'Cache des résultats de recherche Google Places pour réduire les coûts API';
COMMENT ON COLUMN smartfill_cache.cache_key IS 'Clé unique: lat_lng_radius_category (ex: 48.8566_2.3522_5000_restaurants)';
COMMENT ON COLUMN smartfill_cache.results IS 'Résultats JSON de la recherche nearby';
COMMENT ON COLUMN smartfill_cache.expires_at IS 'Date d''expiration du cache (par défaut 60 minutes)';
COMMENT ON COLUMN smartfill_cache.hit_count IS 'Nombre de fois que cette entrée a été utilisée';
COMMENT ON COLUMN smartfill_cache.last_hit_at IS 'Dernière utilisation du cache';
