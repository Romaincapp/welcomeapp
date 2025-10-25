-- Script de nettoyage ponctuel pour supprimer des utilisateurs spécifiques
-- Date: 2025-10-25
-- ATTENTION: Ce script supprime définitivement les données

-- 1. Supprimer les clients associés à ces emails (CASCADE supprimera tips, tip_media, etc.)
DELETE FROM clients
WHERE email IN ('romainfrancedumoulin@gmail.com', 'mini.dums@hotmail.com');

-- 2. Supprimer les utilisateurs de auth.users (nécessite des permissions admin)
-- Note: Cette partie doit être exécutée avec un compte ayant les droits admin
DELETE FROM auth.users
WHERE email IN ('romainfrancedumoulin@gmail.com', 'mini.dums@hotmail.com');

-- 3. Vérifier qu'ils sont bien supprimés
SELECT email FROM clients WHERE email IN ('romainfrancedumoulin@gmail.com', 'mini.dums@hotmail.com');
SELECT email FROM auth.users WHERE email IN ('romainfrancedumoulin@gmail.com', 'mini.dums@hotmail.com');

-- Les deux requêtes ci-dessus devraient retourner 0 résultats
