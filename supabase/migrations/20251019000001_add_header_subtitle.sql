-- Ajouter le champ header_subtitle à la table clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS header_subtitle TEXT DEFAULT 'Bienvenue dans votre guide personnalisé';

-- Mettre à jour le client de démonstration avec un sous-titre personnalisé
UPDATE clients
SET header_subtitle = 'Votre guide complet pour un séjour inoubliable'
WHERE slug = 'demo';
