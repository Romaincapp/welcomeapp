-- =====================================================
-- MIGRATION : Section Sécurisée pour WelcomeApp
-- =====================================================
-- Copiez-collez ce fichier complet dans l'éditeur SQL
-- de Supabase (https://supabase.com/dashboard/project/nimbzitahumdefggtiob/sql)
-- =====================================================

-- Table pour stocker les informations sécurisées de chaque client
CREATE TABLE IF NOT EXISTS secure_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
  access_code_hash TEXT NOT NULL,
  check_in_time TEXT,
  check_out_time TEXT,
  arrival_instructions TEXT,
  property_address TEXT,
  property_coordinates JSONB,
  wifi_ssid TEXT,
  wifi_password TEXT,
  parking_info TEXT,
  additional_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_secure_sections_client_id ON secure_sections(client_id);

-- Trigger pour mettre à jour le champ updated_at
DROP TRIGGER IF EXISTS update_secure_sections_updated_at ON secure_sections;
CREATE TRIGGER update_secure_sections_updated_at
BEFORE UPDATE ON secure_sections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE secure_sections ENABLE ROW LEVEL SECURITY;

-- Policy : Seul le propriétaire peut lire sa section sécurisée
CREATE POLICY "Owners can read their secure sections"
  ON secure_sections
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = secure_sections.client_id
      AND clients.email = auth.jwt() ->> 'email'
    )
  );

-- Policy : Seul le propriétaire peut créer sa section sécurisée
CREATE POLICY "Owners can insert their secure sections"
  ON secure_sections
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_id
      AND clients.email = auth.jwt() ->> 'email'
    )
  );

-- Policy : Seul le propriétaire peut modifier sa section sécurisée
CREATE POLICY "Owners can update their secure sections"
  ON secure_sections
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = secure_sections.client_id
      AND clients.email = auth.jwt() ->> 'email'
    )
  );

-- Policy : Seul le propriétaire peut supprimer sa section sécurisée
CREATE POLICY "Owners can delete their secure sections"
  ON secure_sections
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = secure_sections.client_id
      AND clients.email = auth.jwt() ->> 'email'
    )
  );

-- =====================================================
-- VÉRIFICATIONS POST-MIGRATION
-- =====================================================

-- Vérifier que la table a été créée
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'secure_sections'
ORDER BY ordinal_position;

-- Vérifier que RLS est activé
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'secure_sections';

-- Vérifier les policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename = 'secure_sections';

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================
