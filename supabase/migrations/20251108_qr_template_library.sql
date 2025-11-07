-- Migration: QR Code Template Library System
-- Date: 2025-11-08
-- Description: Ajoute le support des templates QR avec configurations personnalisées

-- Étape 1: Ajouter les nouveaux champs à la table qr_code_designs
ALTER TABLE qr_code_designs
ADD COLUMN IF NOT EXISTS template_id TEXT,
ADD COLUMN IF NOT EXISTS template_config JSONB DEFAULT '{}'::jsonb;

-- Étape 2: Créer un index sur template_id pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_qr_code_designs_template_id ON qr_code_designs(template_id);

-- Étape 3: Migrer les anciennes données (thèmes existants vers nouveaux template IDs)
-- Ceci assure la rétrocompatibilité avec les 4 thèmes originaux
UPDATE qr_code_designs
SET template_id = CASE theme
  WHEN 'modern-minimal' THEN 'minimalist-clean-white'
  WHEN 'bold-gradient' THEN 'modern-tech-gradient'
  WHEN 'clean-professional' THEN 'minimalist-scandinave'
  WHEN 'elegant-frame' THEN 'elegant-classic-frame'
  ELSE 'minimalist-clean-white'  -- Fallback par défaut
END
WHERE template_id IS NULL;

-- Étape 4: Ajouter un commentaire sur la colonne pour documentation
COMMENT ON COLUMN qr_code_designs.template_id IS 'ID du template sélectionné parmi la bibliothèque (15 templates disponibles: minimalist, modern, vacation, elegant, festive)';
COMMENT ON COLUMN qr_code_designs.template_config IS 'Configuration JSONB optionnelle pour personnalisations supplémentaires du template (couleurs, décorations custom, etc.)';

-- Étape 5: Mise à jour du timestamp updated_at
CREATE OR REPLACE FUNCTION update_qr_code_designs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger si il n'existe pas déjà
DROP TRIGGER IF EXISTS update_qr_code_designs_updated_at_trigger ON qr_code_designs;
CREATE TRIGGER update_qr_code_designs_updated_at_trigger
  BEFORE UPDATE ON qr_code_designs
  FOR EACH ROW
  EXECUTE FUNCTION update_qr_code_designs_updated_at();

-- Étape 6: Vérification des données migrées (optionnel, pour debug)
-- SELECT theme, template_id, COUNT(*) as count
-- FROM qr_code_designs
-- GROUP BY theme, template_id;
