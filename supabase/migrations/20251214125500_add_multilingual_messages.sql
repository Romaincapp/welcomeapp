-- Ajouter colonnes multilingues pour les messages personnalisés
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS welcome_message_en TEXT,
ADD COLUMN IF NOT EXISTS welcome_message_de TEXT,
ADD COLUMN IF NOT EXISTS welcome_message_es TEXT,
ADD COLUMN IF NOT EXISTS welcome_message_it TEXT,
ADD COLUMN IF NOT EXISTS welcome_message_nl TEXT,
ADD COLUMN IF NOT EXISTS welcome_message_pt TEXT,
ADD COLUMN IF NOT EXISTS welcome_message_photo TEXT,
ADD COLUMN IF NOT EXISTS footer_custom_text_en TEXT,
ADD COLUMN IF NOT EXISTS footer_custom_text_de TEXT,
ADD COLUMN IF NOT EXISTS footer_custom_text_es TEXT,
ADD COLUMN IF NOT EXISTS footer_custom_text_it TEXT,
ADD COLUMN IF NOT EXISTS footer_custom_text_nl TEXT,
ADD COLUMN IF NOT EXISTS footer_custom_text_pt TEXT;

-- Commentaires
COMMENT ON COLUMN clients.welcome_message_en IS 'Welcome message (English)';
COMMENT ON COLUMN clients.welcome_message_de IS 'Welcome message (German)';
COMMENT ON COLUMN clients.welcome_message_es IS 'Welcome message (Spanish)';
COMMENT ON COLUMN clients.welcome_message_it IS 'Welcome message (Italian)';
COMMENT ON COLUMN clients.welcome_message_nl IS 'Welcome message (Dutch)';
COMMENT ON COLUMN clients.welcome_message_pt IS 'Welcome message (Portuguese)';
COMMENT ON COLUMN clients.welcome_message_photo IS 'URL of the photo to display in the welcome message modal';
COMMENT ON COLUMN clients.footer_custom_text_en IS 'Footer custom text (English)';
COMMENT ON COLUMN clients.footer_custom_text_de IS 'Footer custom text (German)';
COMMENT ON COLUMN clients.footer_custom_text_es IS 'Footer custom text (Spanish)';
COMMENT ON COLUMN clients.footer_custom_text_it IS 'Footer custom text (Italian)';
COMMENT ON COLUMN clients.footer_custom_text_nl IS 'Footer custom text (Dutch)';
COMMENT ON COLUMN clients.footer_custom_text_pt IS 'Footer custom text (Portuguese)';
