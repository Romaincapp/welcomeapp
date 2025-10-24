-- Migration: Supprimer la table footer_buttons (obsolète)
-- Date: 2025-10-20
-- Raison: La table footer_buttons n'est plus utilisée. Le footer utilise maintenant
--         directement les champs de la table clients (footer_contact_phone,
--         footer_contact_email, footer_contact_website, etc.)

-- Supprimer les policies RLS
DROP POLICY IF EXISTS "Boutons footer sont visibles publiquement" ON footer_buttons;
DROP POLICY IF EXISTS "Gestionnaires peuvent ajouter leurs propres boutons footer" ON footer_buttons;
DROP POLICY IF EXISTS "Gestionnaires peuvent modifier leurs propres boutons footer" ON footer_buttons;
DROP POLICY IF EXISTS "Gestionnaires peuvent supprimer leurs propres boutons footer" ON footer_buttons;

-- Supprimer l'index
DROP INDEX IF EXISTS idx_footer_buttons_client_id;

-- Supprimer la table (CASCADE supprimera automatiquement les données)
DROP TABLE IF EXISTS footer_buttons CASCADE;
