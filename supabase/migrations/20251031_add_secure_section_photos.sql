-- Ajout d'un champ pour stocker les photos sécurisées
-- Ces photos ne seront visibles que dans la section sécurisée (après saisie du code)

ALTER TABLE secure_sections
ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN secure_sections.photos IS 'Tableau de photos sécurisées (uniquement visibles après saisie du code). Format: [{"url": "...", "caption": "..."}]';
