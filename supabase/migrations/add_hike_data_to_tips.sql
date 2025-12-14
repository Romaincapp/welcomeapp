-- Migration: Ajouter support pour les randonnées guidées
-- Date: 2024-12-14
-- Description: Ajout du champ hike_data pour stocker les données GPX et infos de randonnée

-- Ajouter la colonne hike_data à la table tips
ALTER TABLE tips
ADD COLUMN IF NOT EXISTS hike_data jsonb;

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN tips.hike_data IS 'Données de randonnée guidée: distance, durée, difficulté, dénivelé, waypoints GPX, instructions';

-- Créer un index GIN pour rechercher efficacement dans le JSON
CREATE INDEX IF NOT EXISTS idx_tips_hike_data ON tips USING gin (hike_data);

-- Exemple de structure attendue dans hike_data:
-- {
--   "distance": 12.5,              -- km
--   "duration": 180,                -- minutes
--   "difficulty": "moyen",          -- facile | moyen | difficile
--   "elevation_gain": 450,          -- mètres D+
--   "elevation_loss": 450,          -- mètres D-
--   "waypoints": [                  -- Points GPS du tracé
--     {
--       "lat": 50.123,
--       "lng": 5.456,
--       "elevation": 320,
--       "name": "Départ",
--       "description": "Parking du village"
--     },
--     ...
--   ],
--   "gpx_url": "https://...",       -- URL du fichier GPX stocké
--   "instructions": [               -- Instructions turn-by-turn
--     "Suivre le chemin forestier pendant 2km",
--     "Tourner à gauche au panneau",
--     ...
--   ]
-- }
