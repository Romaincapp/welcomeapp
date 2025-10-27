-- ============================================
-- MIGRATION: Ajouter une valeur DEFAULT pour background_image
-- Date: 2025-10-27
-- ============================================

-- Ajouter une valeur DEFAULT à la colonne background_image
-- pour que tous les nouveaux clients aient automatiquement un background
ALTER TABLE clients
ALTER COLUMN background_image
SET DEFAULT '/backgrounds/default-1.jpg';

-- Mettre à jour tous les clients existants qui n'ont pas de background
-- (normalement déjà fait via UPDATE manuel, mais au cas où)
UPDATE clients
SET background_image = '/backgrounds/default-1.jpg'
WHERE background_image IS NULL;
