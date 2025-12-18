-- Migration: Ajouter les options de personnalisation des couleurs
-- Date: 2024-12-18

-- Ajouter les nouveaux champs de couleur à la table clients
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#f3f4f6',
ADD COLUMN IF NOT EXISTS category_title_color TEXT,
ADD COLUMN IF NOT EXISTS header_text_color TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS footer_text_color TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS sync_background_with_header BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sync_background_with_footer BOOLEAN DEFAULT false;

-- Commentaires pour documentation
COMMENT ON COLUMN clients.background_color IS 'Couleur de l''arrière-plan (quand pas d''image)';
COMMENT ON COLUMN clients.category_title_color IS 'Couleur des titres de catégories (null = hérite de header_color)';
COMMENT ON COLUMN clients.header_text_color IS 'Couleur du texte du header';
COMMENT ON COLUMN clients.footer_text_color IS 'Couleur du texte du footer';
COMMENT ON COLUMN clients.sync_background_with_header IS 'Synchroniser la couleur du fond avec le header';
COMMENT ON COLUMN clients.sync_background_with_footer IS 'Synchroniser la couleur du fond avec le footer';
