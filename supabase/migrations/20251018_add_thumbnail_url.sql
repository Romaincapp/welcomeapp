-- Migration: Ajouter un champ thumbnail_url pour les miniatures d'images
-- Date: 2025-10-18
-- Description: Permet de stocker des versions optimisées/compressées des images pour les aperçus (TipCard)

-- Ajouter la colonne thumbnail_url
ALTER TABLE tip_media
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Créer un commentaire pour documenter le champ
COMMENT ON COLUMN tip_media.thumbnail_url IS 'URL de la miniature optimisée (recommandé: 400x400px, quality 60) pour les aperçus rapides';

-- Pour les images existantes, utiliser l'URL originale par défaut (sera remplacé progressivement)
UPDATE tip_media
SET thumbnail_url = url
WHERE thumbnail_url IS NULL AND type = 'image';
