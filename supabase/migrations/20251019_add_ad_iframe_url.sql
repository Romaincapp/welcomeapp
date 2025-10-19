-- Ajouter le champ ad_iframe_url pour permettre au gestionnaire
-- d'afficher une pub dans le footer
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS ad_iframe_url TEXT;

COMMENT ON COLUMN clients.ad_iframe_url IS
'URL de l''iframe publicitaire à afficher dans le footer (optionnel).';
