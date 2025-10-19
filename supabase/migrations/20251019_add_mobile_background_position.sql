-- Ajouter le champ mobile_background_position pour permettre au gestionnaire
-- de personnaliser le recadrage de l'image de fond sur mobile
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS mobile_background_position TEXT DEFAULT 'center';

-- Format attendu: "50% 50%" ou "top", "bottom", "left", "right", "center"
-- Exemples:
-- "center" (par défaut)
-- "top" (affiche le haut de l'image)
-- "bottom" (affiche le bas de l'image)
-- "30% 50%" (position personnalisée: 30% horizontal, 50% vertical)

COMMENT ON COLUMN clients.mobile_background_position IS
'Position CSS du background sur mobile (ex: "center", "top", "50% 30%"). Permet au gestionnaire de recadrer la vue mobile de l''image de fond.';
