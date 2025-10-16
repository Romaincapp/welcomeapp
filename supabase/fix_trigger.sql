-- ============================================
-- FIX SIMPLE - Trigger de création automatique
-- ============================================

-- Le problème : Le trigger ne peut pas INSERT dans clients à cause des RLS
-- La solution : Utiliser SECURITY DEFINER pour bypasser les RLS dans le trigger

-- 1. Supprimer l'ancien trigger et fonction
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 2. Recréer la fonction avec les bons droits
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
SECURITY DEFINER -- IMPORTANT: Permet d'ignorer les RLS
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_email text;
  base_name text;
  generated_slug text;
  counter integer := 0;
BEGIN
  -- Récupérer l'email
  user_email := NEW.email;

  -- Générer le nom de base (partie avant @)
  base_name := split_part(user_email, '@', 1);

  -- Nettoyer et créer le slug
  generated_slug := lower(regexp_replace(base_name, '[^a-zA-Z0-9\s-]', '', 'g'));
  generated_slug := regexp_replace(generated_slug, '\s+', '-', 'g');
  generated_slug := trim(both '-' from generated_slug);

  -- Vérifier l'unicité et ajouter un numéro si nécessaire
  WHILE EXISTS (SELECT 1 FROM public.clients WHERE slug = generated_slug OR subdomain = generated_slug) LOOP
    counter := counter + 1;
    generated_slug := lower(regexp_replace(base_name, '[^a-zA-Z0-9\s-]', '', 'g'));
    generated_slug := regexp_replace(generated_slug, '\s+', '-', 'g');
    generated_slug := trim(both '-' from generated_slug) || '-' || counter::text;
  END LOOP;

  -- Créer le welcomebook
  INSERT INTO public.clients (
    user_id,
    name,
    slug,
    subdomain,
    email,
    header_color,
    footer_color
  ) VALUES (
    NEW.id,
    'Mon WelcomeBook',
    generated_slug,
    generated_slug,
    user_email,
    '#4F46E5',
    '#1E1B4B'
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- En cas d'erreur, loguer mais ne pas bloquer la création du user
    RAISE WARNING 'Erreur création welcomebook pour %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$;

-- 3. Recréer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 4. Message de confirmation
SELECT '✅ Trigger corrigé avec succès!' as message;
