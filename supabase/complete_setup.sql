-- ============================================
-- SETUP COMPLET WELCOMEBOOK
-- ============================================
-- Ce script configure toute la base de données pour le système de welcomebook
-- avec gestion des gestionnaires et de leurs welcomebooks personnalisés

-- ============================================
-- 1. MODIFICATION DU SCHÉMA
-- ============================================

-- Ajouter la colonne user_id à la table clients pour lier un gestionnaire à son welcomebook
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS subdomain text UNIQUE;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS clients_user_id_idx ON clients(user_id);
CREATE INDEX IF NOT EXISTS clients_subdomain_idx ON clients(subdomain);

-- Ajouter une contrainte pour s'assurer qu'un user ne peut avoir qu'un seul welcomebook
-- (commenté pour permettre plusieurs welcomebooks par user si nécessaire)
-- ALTER TABLE clients ADD CONSTRAINT one_welcomebook_per_user UNIQUE(user_id);

-- ============================================
-- 2. FONCTION DE GÉNÉRATION DE SLUG UNIQUE
-- ============================================

CREATE OR REPLACE FUNCTION generate_unique_slug(base_name text)
RETURNS text AS $$
DECLARE
  slug_candidate text;
  counter integer := 0;
BEGIN
  -- Générer le slug de base (minuscules, remplacer espaces par tirets, supprimer caractères spéciaux)
  slug_candidate := lower(regexp_replace(base_name, '[^a-zA-Z0-9\s-]', '', 'g'));
  slug_candidate := regexp_replace(slug_candidate, '\s+', '-', 'g');
  slug_candidate := trim(both '-' from slug_candidate);

  -- Si le slug existe déjà, ajouter un numéro
  WHILE EXISTS (SELECT 1 FROM clients WHERE slug = slug_candidate OR subdomain = slug_candidate) LOOP
    counter := counter + 1;
    slug_candidate := lower(regexp_replace(base_name, '[^a-zA-Z0-9\s-]', '', 'g'));
    slug_candidate := regexp_replace(slug_candidate, '\s+', '-', 'g');
    slug_candidate := trim(both '-' from slug_candidate) || '-' || counter::text;
  END LOOP;

  RETURN slug_candidate;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. TRIGGER POUR CRÉER AUTOMATIQUEMENT UN WELCOMEBOOK
-- ============================================

-- Fonction appelée lors de la création d'un nouvel utilisateur
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_email text;
  base_name text;
  generated_slug text;
BEGIN
  -- Récupérer l'email de l'utilisateur
  user_email := NEW.email;

  -- Générer un nom de base à partir de l'email (partie avant @)
  base_name := split_part(user_email, '@', 1);

  -- Générer un slug unique
  generated_slug := generate_unique_slug(base_name);

  -- Créer automatiquement un welcomebook pour ce gestionnaire
  INSERT INTO clients (
    user_id,
    name,
    slug,
    subdomain,
    email,
    header_color,
    footer_color
  ) VALUES (
    NEW.id,
    'Mon WelcomeBook', -- Nom par défaut que l'utilisateur pourra changer
    generated_slug,
    generated_slug, -- Le subdomain est le même que le slug
    user_email,
    '#4F46E5', -- Couleur indigo par défaut
    '#1E1B4B'  -- Couleur indigo foncé par défaut
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le trigger qui s'exécute après chaque création d'utilisateur
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 4. CONFIGURATION DU STORAGE BUCKET "media"
-- ============================================

-- Créer le bucket s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Public can read media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their media" ON storage.objects;

-- Lecture publique
CREATE POLICY "Public can read media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Upload pour les users authentifiés
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- Suppression pour les users authentifiés
CREATE POLICY "Authenticated users can delete their media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media');

-- Mise à jour pour les users authentifiés
CREATE POLICY "Authenticated users can update their media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media');

-- ============================================
-- 5. ROW LEVEL SECURITY - LECTURE PUBLIQUE
-- ============================================

-- Tout le monde peut lire les données (visiteurs)
DROP POLICY IF EXISTS "Public can read clients" ON clients;
CREATE POLICY "Public can read clients"
ON clients FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Public can read tips" ON tips;
CREATE POLICY "Public can read tips"
ON tips FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Public can read tip_media" ON tip_media;
CREATE POLICY "Public can read tip_media"
ON tip_media FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Public can read categories" ON categories;
CREATE POLICY "Public can read categories"
ON categories FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Public can read footer_buttons" ON footer_buttons;
CREATE POLICY "Public can read footer_buttons"
ON footer_buttons FOR SELECT
USING (true);

-- ============================================
-- 6. ROW LEVEL SECURITY - ÉDITION PROPRIÉTAIRE UNIQUEMENT
-- ============================================

-- CLIENTS : Seul le propriétaire peut modifier son welcomebook
DROP POLICY IF EXISTS "Users can update their own client" ON clients;
CREATE POLICY "Users can update their own client"
ON clients FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- TIPS : Seul le propriétaire du welcomebook peut créer/modifier/supprimer des tips
DROP POLICY IF EXISTS "Users can create tips in their welcomebook" ON tips;
CREATE POLICY "Users can create tips in their welcomebook"
ON tips FOR INSERT
TO authenticated
WITH CHECK (
  client_id IN (
    SELECT id FROM clients WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update tips in their welcomebook" ON tips;
CREATE POLICY "Users can update tips in their welcomebook"
ON tips FOR UPDATE
TO authenticated
USING (
  client_id IN (
    SELECT id FROM clients WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  client_id IN (
    SELECT id FROM clients WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete tips in their welcomebook" ON tips;
CREATE POLICY "Users can delete tips in their welcomebook"
ON tips FOR DELETE
TO authenticated
USING (
  client_id IN (
    SELECT id FROM clients WHERE user_id = auth.uid()
  )
);

-- TIP_MEDIA : Seul le propriétaire peut gérer les médias de ses tips
DROP POLICY IF EXISTS "Users can create media for their tips" ON tip_media;
CREATE POLICY "Users can create media for their tips"
ON tip_media FOR INSERT
TO authenticated
WITH CHECK (
  tip_id IN (
    SELECT t.id FROM tips t
    INNER JOIN clients c ON t.client_id = c.id
    WHERE c.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete media from their tips" ON tip_media;
CREATE POLICY "Users can delete media from their tips"
ON tip_media FOR DELETE
TO authenticated
USING (
  tip_id IN (
    SELECT t.id FROM tips t
    INNER JOIN clients c ON t.client_id = c.id
    WHERE c.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update media for their tips" ON tip_media;
CREATE POLICY "Users can update media for their tips"
ON tip_media FOR UPDATE
TO authenticated
USING (
  tip_id IN (
    SELECT t.id FROM tips t
    INNER JOIN clients c ON t.client_id = c.id
    WHERE c.user_id = auth.uid()
  )
);

-- FOOTER_BUTTONS : Seul le propriétaire peut gérer les boutons de son footer
DROP POLICY IF EXISTS "Users can create footer buttons for their welcomebook" ON footer_buttons;
CREATE POLICY "Users can create footer buttons for their welcomebook"
ON footer_buttons FOR INSERT
TO authenticated
WITH CHECK (
  client_id IN (
    SELECT id FROM clients WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update footer buttons for their welcomebook" ON footer_buttons;
CREATE POLICY "Users can update footer buttons for their welcomebook"
ON footer_buttons FOR UPDATE
TO authenticated
USING (
  client_id IN (
    SELECT id FROM clients WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete footer buttons for their welcomebook" ON footer_buttons;
CREATE POLICY "Users can delete footer buttons for their welcomebook"
ON footer_buttons FOR DELETE
TO authenticated
USING (
  client_id IN (
    SELECT id FROM clients WHERE user_id = auth.uid()
  )
);

-- ============================================
-- 7. FONCTION POUR RÉCUPÉRER LE WELCOMEBOOK DE L'UTILISATEUR
-- ============================================

CREATE OR REPLACE FUNCTION get_user_welcomebook()
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  subdomain text,
  email text,
  header_color text,
  footer_color text,
  background_image text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.slug,
    c.subdomain,
    c.email,
    c.header_color,
    c.footer_color,
    c.background_image,
    c.created_at
  FROM clients c
  WHERE c.user_id = auth.uid()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. VUE POUR LES STATISTIQUES (OPTIONNEL)
-- ============================================

CREATE OR REPLACE VIEW user_welcomebook_stats AS
SELECT
  c.id as client_id,
  c.user_id,
  c.name,
  c.slug,
  c.subdomain,
  COUNT(DISTINCT t.id) as total_tips,
  COUNT(DISTINCT t.category_id) as total_categories,
  COUNT(DISTINCT tm.id) as total_media
FROM clients c
LEFT JOIN tips t ON t.client_id = c.id
LEFT JOIN tip_media tm ON tm.tip_id = t.id
GROUP BY c.id, c.user_id, c.name, c.slug, c.subdomain;

-- ============================================
-- CONFIRMATION
-- ============================================

SELECT
  '✅ Setup complet terminé avec succès!' as message,
  'Les utilisateurs auront maintenant automatiquement leur welcomebook à l''inscription' as details;

-- ============================================
-- INFORMATIONS UTILES
-- ============================================

-- Pour voir tous les welcomebooks avec leurs propriétaires :
-- SELECT c.name, c.slug, c.subdomain, u.email as owner_email
-- FROM clients c
-- LEFT JOIN auth.users u ON c.user_id = u.id;

-- Pour voir les stats d'un utilisateur :
-- SELECT * FROM user_welcomebook_stats WHERE user_id = auth.uid();
