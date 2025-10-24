-- Ajouter le champ mobile_background_position pour permettre au gestionnaire
-- de personnaliser le recadrage de l'image de fond sur mobile
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS mobile_background_position TEXT DEFAULT '50% 50%';

-- Format attendu: "X% Y%" en pourcentage
-- Exemples:
-- "50% 50%" (par défaut - centré)
-- "50% 0%" (haut centré)
-- "50% 100%" (bas centré)
-- "30% 50%" (position personnalisée)

COMMENT ON COLUMN clients.mobile_background_position IS
'Position CSS du background sur mobile (format: "X% Y%"). Permet au gestionnaire de recadrer la vue mobile de l''image de fond.';
