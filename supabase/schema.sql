6+333333-- Créer les tables pour WelcomeBook

-- Table des clients (gestionnaires de locations)
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_en TEXT,
  name_es TEXT,
  name_nl TEXT,
  name_de TEXT,
  name_it TEXT,
  name_pt TEXT,
  slug TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  header_color TEXT DEFAULT '#4F46E5',
  header_subtitle TEXT DEFAULT 'Bienvenue dans votre guide personnalisé',
  header_subtitle_en TEXT,
  header_subtitle_es TEXT,
  header_subtitle_nl TEXT,
  header_subtitle_de TEXT,
  header_subtitle_it TEXT,
  header_subtitle_pt TEXT,
  footer_color TEXT DEFAULT '#1E1B4B',
  background_image TEXT,
  mobile_background_position TEXT DEFAULT '50% 50%',
  background_effect TEXT DEFAULT 'normal',
  ad_iframe_url TEXT,
  footer_contact_phone TEXT,
  footer_contact_email TEXT,
  footer_contact_website TEXT,
  footer_contact_facebook TEXT,
  footer_contact_instagram TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des catégories de conseils
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_en TEXT,
  name_es TEXT,
  name_nl TEXT,
  name_de TEXT,
  name_it TEXT,
  name_pt TEXT,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des conseils (tips/cards)
CREATE TABLE IF NOT EXISTS tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  title_en TEXT,
  title_es TEXT,
  title_nl TEXT,
  title_de TEXT,
  title_it TEXT,
  title_pt TEXT,
  comment TEXT,
  comment_en TEXT,
  comment_es TEXT,
  comment_nl TEXT,
  comment_de TEXT,
  comment_it TEXT,
  comment_pt TEXT,
  route_url TEXT,
  location TEXT,
  coordinates JSONB,
  contact_email TEXT,
  contact_phone TEXT,
  contact_social JSONB,
  promo_code TEXT,
  opening_hours JSONB,
  rating DECIMAL(2, 1), -- Note moyenne Google (0.0 à 5.0)
  user_ratings_total INTEGER DEFAULT 0, -- Nombre total d'avis
  price_level INTEGER CHECK (price_level BETWEEN 0 AND 4), -- Niveau de prix (0=gratuit, 1=€, 2=€€, 3=€€€, 4=€€€€)
  reviews JSONB, -- Tableau des avis (max 5 avis stockés)
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des médias (photos/vidéos des conseils)
CREATE TABLE IF NOT EXISTS tip_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tip_id UUID REFERENCES tips(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des sections sécurisées (informations sensibles)
CREATE TABLE IF NOT EXISTS secure_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
  access_code_hash TEXT NOT NULL,
  check_in_time TEXT,
  check_out_time TEXT,
  arrival_instructions TEXT,
  arrival_instructions_en TEXT,
  arrival_instructions_es TEXT,
  arrival_instructions_nl TEXT,
  arrival_instructions_de TEXT,
  arrival_instructions_it TEXT,
  arrival_instructions_pt TEXT,
  property_address TEXT,
  property_coordinates JSONB,
  wifi_ssid TEXT,
  wifi_password TEXT,
  parking_info TEXT,
  parking_info_en TEXT,
  parking_info_es TEXT,
  parking_info_nl TEXT,
  parking_info_de TEXT,
  parking_info_it TEXT,
  parking_info_pt TEXT,
  additional_info TEXT,
  additional_info_en TEXT,
  additional_info_es TEXT,
  additional_info_nl TEXT,
  additional_info_de TEXT,
  additional_info_it TEXT,
  additional_info_pt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_tips_client_id ON tips(client_id);
CREATE INDEX IF NOT EXISTS idx_tips_category_id ON tips(category_id);
CREATE INDEX IF NOT EXISTS idx_tip_media_tip_id ON tip_media(tip_id);
CREATE INDEX IF NOT EXISTS idx_clients_slug ON clients(slug);
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories("order");
CREATE INDEX IF NOT EXISTS idx_tips_category_order ON tips(category_id, "order");
CREATE INDEX IF NOT EXISTS idx_secure_sections_client_id ON secure_sections(client_id);
CREATE INDEX IF NOT EXISTS idx_tips_rating ON tips(rating) WHERE rating IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tips_price_level ON tips(price_level) WHERE price_level IS NOT NULL;

-- Function pour mettre à jour le champ updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le champ updated_at des tips
DROP TRIGGER IF EXISTS update_tips_updated_at ON tips;
CREATE TRIGGER update_tips_updated_at
BEFORE UPDATE ON tips
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour mettre à jour le champ updated_at des secure_sections
DROP TRIGGER IF EXISTS update_secure_sections_updated_at ON secure_sections;
CREATE TRIGGER update_secure_sections_updated_at
BEFORE UPDATE ON secure_sections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE tip_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE secure_sections ENABLE ROW LEVEL SECURITY;

-- Policies pour permettre la lecture publique
CREATE POLICY "Public can read clients" ON clients FOR SELECT USING (true);
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can read tips" ON tips FOR SELECT USING (true);
CREATE POLICY "Public can read tip_media" ON tip_media FOR SELECT USING (true);

-- Note: Les policies détaillées (INSERT, UPDATE, DELETE) sont dans les migrations
-- Voir: supabase/migrations/20251014122308_add_rls_policies.sql
-- Voir: supabase/migrations/20251017_add_secure_sections.sql pour secure_sections policies

-- Données de démonstration

-- Catégories
INSERT INTO categories (name, slug, icon) VALUES
  ('Restaurants', 'restaurants', '🍽️'),
  ('Activités', 'activites', '🎯'),
  ('Culture', 'culture', '🎨'),
  ('Nature', 'nature', '🌲'),
  ('Shopping', 'shopping', '🛍️')
ON CONFLICT (slug) DO NOTHING;

-- Client de démonstration
INSERT INTO clients (
  name,
  slug,
  email,
  header_color,
  footer_color,
  footer_contact_phone,
  footer_contact_email,
  footer_contact_website
) VALUES (
  'Villa des Ardennes',
  'demo',
  'romainfrancedumoulin@gmail.com',
  '#4F46E5',
  '#1E1B4B',
  '+32 123 456 789',
  'contact@villa-ardennes.be',
  'https://villa-ardennes.be'
)
ON CONFLICT (slug) DO UPDATE SET email = EXCLUDED.email;

-- Récupérer les IDs pour les données de démonstration
DO $$
DECLARE
  demo_client_id UUID;
  restaurant_cat_id UUID;
  activite_cat_id UUID;
  nature_cat_id UUID;
BEGIN
  -- Récupérer les IDs
  SELECT id INTO demo_client_id FROM clients WHERE slug = 'demo';
  SELECT id INTO restaurant_cat_id FROM categories WHERE slug = 'restaurants';
  SELECT id INTO activite_cat_id FROM categories WHERE slug = 'activites';
  SELECT id INTO nature_cat_id FROM categories WHERE slug = 'nature';

  -- Conseils de démonstration
  INSERT INTO tips (
    client_id,
    category_id,
    title,
    comment,
    location,
    coordinates,
    contact_phone,
    route_url,
    opening_hours
  ) VALUES
    (
      demo_client_id,
      restaurant_cat_id,
      'Le Petit Gourmet',
      'Restaurant gastronomique local avec des spécialités régionales. Réservation recommandée.',
      'Rue de la Station 15, 6980 La Roche-en-Ardenne',
      '{"lat": 50.1831, "lng": 5.5769}'::jsonb,
      '+32 84 41 15 25',
      'https://example.com',
      '{"monday": "Fermé", "tuesday": "12:00-14:00, 18:00-22:00", "wednesday": "12:00-14:00, 18:00-22:00", "thursday": "12:00-14:00, 18:00-22:00", "friday": "12:00-14:00, 18:00-23:00", "saturday": "12:00-14:00, 18:00-23:00", "sunday": "12:00-14:00, 18:00-22:00"}'::jsonb
    ),
    (
      demo_client_id,
      activite_cat_id,
      'Kayak Adventures',
      'Location de kayaks pour descendre l''Ourthe. Matériel fourni, navette incluse.',
      'Quai de l''Ourthe 8, 6980 La Roche-en-Ardenne',
      '{"lat": 50.1845, "lng": 5.5742}'::jsonb,
      '+32 84 41 19 50',
      'https://example.com',
      '{"monday": "09:00-18:00", "tuesday": "09:00-18:00", "wednesday": "09:00-18:00", "thursday": "09:00-18:00", "friday": "09:00-18:00", "saturday": "09:00-19:00", "sunday": "09:00-19:00"}'::jsonb
    ),
    (
      demo_client_id,
      nature_cat_id,
      'Belvédère de Nisramont',
      'Point de vue panoramique sur la vallée de l''Ourthe. Parking gratuit.',
      'Nisramont, 6980 La Roche-en-Ardenne',
      '{"lat": 50.1654, "lng": 5.5389}'::jsonb,
      NULL,
      NULL,
      NULL
    )
  ON CONFLICT DO NOTHING;

END $$;
