-- Ajouter colonnes pour message d'accueil et footer personnalisé
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS welcome_message TEXT,
ADD COLUMN IF NOT EXISTS footer_custom_text TEXT;

-- Commentaires
COMMENT ON COLUMN clients.welcome_message IS 'Message d''accueil affiché dans un modal au premier chargement';
COMMENT ON COLUMN clients.footer_custom_text IS 'Texte personnalisé affiché dans le footer';
