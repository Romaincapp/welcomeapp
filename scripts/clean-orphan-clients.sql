-- ============================================
-- NETTOYAGE DES CLIENTS ORPHELINS
-- ============================================
-- Ce script supprime tous les clients créés avec l'ancien code bugué
-- (nom "Mon WelcomeBook" et slug basé sur email)
--
-- À exécuter dans: Dashboard Supabase → SQL Editor
-- ============================================

-- 1. Afficher les clients à supprimer
SELECT
  id,
  name,
  slug,
  email,
  user_id,
  created_at
FROM clients
WHERE name = 'Mon WelcomeBook';

-- 2. Suppression (décommentez les lignes ci-dessous pour exécuter)
-- ATTENTION: Cette action est IRRÉVERSIBLE !
-- Elle supprimera aussi tous les tips, tip_media, et secure_sections liés (CASCADE)

/*
DELETE FROM clients
WHERE name = 'Mon WelcomeBook';
*/

-- 3. Vérification après suppression
-- SELECT COUNT(*) as remaining_clients FROM clients;
