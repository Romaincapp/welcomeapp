-- Script pour créer un utilisateur test pour le mode édition
-- À exécuter dans Dashboard Supabase → Authentication → Users

/**
 * IMPORTANT : Ce script ne peut pas être exécuté dans le SQL Editor
 * Vous devez créer l'utilisateur via l'interface Supabase
 *
 * Étapes :
 * 1. Dashboard Supabase → Authentication → Users
 * 2. Cliquez sur "Add user" → "Create new user"
 * 3. Email : test@welcomebook.be
 * 4. Password : Test123456!
 * 5. Auto Confirm User : OUI (cocher la case)
 *
 * Ou via SQL si vous avez les permissions admin :
 */

-- Alternative : Via l'API Supabase Admin (à exécuter depuis votre backend)
/*
const { data, error } = await supabase.auth.admin.createUser({
  email: 'test@welcomebook.be',
  password: 'Test123456!',
  email_confirm: true
})
*/

-- Vérifier que l'utilisateur existe
SELECT id, email, created_at
FROM auth.users
WHERE email = 'test@welcomebook.be';

-- Note : Pour un environnement de production, vous devriez :
-- 1. Activer la vérification par email
-- 2. Utiliser des mots de passe forts et sécurisés
-- 3. Implémenter des rôles et permissions (RLS avancé)
-- 4. Lier les utilisateurs aux clients dans votre table clients
