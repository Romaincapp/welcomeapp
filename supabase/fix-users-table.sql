-- Solution au problème : "relation public.users does not exist"
-- Ce script crée une table public.users qui se synchronise automatiquement avec auth.users

-- 1. Créer la table public.users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Activer Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Politique pour permettre aux utilisateurs de lire leur propre profil
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- 4. Politique pour permettre aux utilisateurs de mettre à jour leur propre profil
CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- 5. Politique pour la lecture publique (optionnel, à activer si nécessaire)
-- CREATE POLICY "Public profiles are viewable by everyone"
--   ON public.users
--   FOR SELECT
--   USING (true);

-- 6. Créer une fonction pour synchroniser auth.users avec public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Créer un trigger pour synchroniser automatiquement
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 8. Ajouter une colonne user_id dans la table clients pour lier les utilisateurs aux clients
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- 9. Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);

-- 10. Politique RLS pour permettre aux utilisateurs de gérer leur propre client
CREATE POLICY "Users can manage their own client"
  ON public.clients
  FOR ALL
  USING (auth.uid() = user_id);

-- Note : Pour lier un utilisateur existant à un client, utilisez :
-- UPDATE public.clients SET user_id = 'USER_ID_HERE' WHERE slug = 'demo';
