-- Migration: Supprimer le champ icon et combiner avec name
-- Date: 2025-11-11
-- Description: Simplifie les catégories en combinant emoji + nom dans un seul champ

-- 1. Combiner icon + name pour toutes les catégories existantes (français)
UPDATE categories
SET name = CONCAT(icon, ' ', name)
WHERE icon IS NOT NULL AND icon != '' AND icon != '📍';

-- 2. Migrer les champs traduits
UPDATE categories
SET
  name_en = CASE
    WHEN icon IS NOT NULL AND icon != '' AND icon != '📍' AND name_en IS NOT NULL
    THEN CONCAT(icon, ' ', name_en)
    ELSE name_en
  END,
  name_es = CASE
    WHEN icon IS NOT NULL AND icon != '' AND icon != '📍' AND name_es IS NOT NULL
    THEN CONCAT(icon, ' ', name_es)
    ELSE name_es
  END,
  name_nl = CASE
    WHEN icon IS NOT NULL AND icon != '' AND icon != '📍' AND name_nl IS NOT NULL
    THEN CONCAT(icon, ' ', name_nl)
    ELSE name_nl
  END,
  name_de = CASE
    WHEN icon IS NOT NULL AND icon != '' AND icon != '📍' AND name_de IS NOT NULL
    THEN CONCAT(icon, ' ', name_de)
    ELSE name_de
  END,
  name_it = CASE
    WHEN icon IS NOT NULL AND icon != '' AND icon != '📍' AND name_it IS NOT NULL
    THEN CONCAT(icon, ' ', name_it)
    ELSE name_it
  END,
  name_pt = CASE
    WHEN icon IS NOT NULL AND icon != '' AND icon != '📍' AND name_pt IS NOT NULL
    THEN CONCAT(icon, ' ', name_pt)
    ELSE name_pt
  END;

-- 3. Supprimer la colonne icon
ALTER TABLE categories DROP COLUMN icon;
