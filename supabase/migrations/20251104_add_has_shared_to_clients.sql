-- Ajouter le champ has_shared à la table clients
-- Ce champ permet de tracker si le gestionnaire a déjà partagé son welcomebook
-- (copie du lien ou téléchargement du QR code)
-- Utilisé pour cocher automatiquement la tâche "Partager" dans la checklist du dashboard

ALTER TABLE clients ADD COLUMN IF NOT EXISTS has_shared BOOLEAN DEFAULT false;

-- Ajouter un commentaire sur la colonne pour documenter son usage
COMMENT ON COLUMN clients.has_shared IS 'Indique si le gestionnaire a déjà effectué une action de partage (copie lien ou téléchargement QR code). Utilisé pour la checklist du dashboard.';

-- Créer un index pour améliorer les performances des requêtes filtrant sur has_shared
CREATE INDEX IF NOT EXISTS idx_clients_has_shared ON clients(has_shared);
