-- Ajouter le champ background_effect pour permettre au gestionnaire
-- d'appliquer des effets visuels sur l'image de fond
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS background_effect TEXT DEFAULT 'normal';

-- Valeurs possibles:
-- "normal" (par défaut): aucun effet
-- "dark": assombri le fond (overlay sombre)
-- "light": éclaircit le fond (overlay lumineux)
-- "blur": ajoute un flou au fond

COMMENT ON COLUMN clients.background_effect IS
'Effet visuel appliqué au background (normal, dark, light, blur). Améliore la lisibilité du contenu.';
