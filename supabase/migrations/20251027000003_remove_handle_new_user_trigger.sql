-- ============================================
-- SUPPRESSION DU TRIGGER handle_new_user
-- ============================================
-- Date: 2025-10-27
-- Raison: Ce trigger créait automatiquement un client avec des données
--         incorrectes (nom "Mon WelcomeBook" et slug basé sur l'email).
--         La création du client doit être gérée par createWelcomebookServerAction()
--         qui utilise le nom du logement fourni par l'utilisateur.
-- ============================================

-- 1. Supprimer le trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Supprimer la fonction handle_new_user
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ============================================
-- VÉRIFICATION
-- ============================================
-- Après cette migration, la création de clients se fait uniquement via
-- createWelcomebookServerAction() qui utilise le propertyName fourni
-- par l'utilisateur dans le formulaire signup.
-- ============================================
