-- Migration pour ajouter le support multilingue
-- Langues supportées : FR (défaut), EN, ES, NL, DE, IT, PT

-- Ajouter les champs multilingues dans la table clients
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS name_es TEXT,
ADD COLUMN IF NOT EXISTS name_nl TEXT,
ADD COLUMN IF NOT EXISTS name_de TEXT,
ADD COLUMN IF NOT EXISTS name_it TEXT,
ADD COLUMN IF NOT EXISTS name_pt TEXT,
ADD COLUMN IF NOT EXISTS header_subtitle_en TEXT,
ADD COLUMN IF NOT EXISTS header_subtitle_es TEXT,
ADD COLUMN IF NOT EXISTS header_subtitle_nl TEXT,
ADD COLUMN IF NOT EXISTS header_subtitle_de TEXT,
ADD COLUMN IF NOT EXISTS header_subtitle_it TEXT,
ADD COLUMN IF NOT EXISTS header_subtitle_pt TEXT;

-- Ajouter les champs multilingues dans la table categories
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS name_es TEXT,
ADD COLUMN IF NOT EXISTS name_nl TEXT,
ADD COLUMN IF NOT EXISTS name_de TEXT,
ADD COLUMN IF NOT EXISTS name_it TEXT,
ADD COLUMN IF NOT EXISTS name_pt TEXT;

-- Ajouter les champs multilingues dans la table tips
ALTER TABLE tips
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS title_es TEXT,
ADD COLUMN IF NOT EXISTS title_nl TEXT,
ADD COLUMN IF NOT EXISTS title_de TEXT,
ADD COLUMN IF NOT EXISTS title_it TEXT,
ADD COLUMN IF NOT EXISTS title_pt TEXT,
ADD COLUMN IF NOT EXISTS comment_en TEXT,
ADD COLUMN IF NOT EXISTS comment_es TEXT,
ADD COLUMN IF NOT EXISTS comment_nl TEXT,
ADD COLUMN IF NOT EXISTS comment_de TEXT,
ADD COLUMN IF NOT EXISTS comment_it TEXT,
ADD COLUMN IF NOT EXISTS comment_pt TEXT;

-- Ajouter les champs multilingues dans la table secure_sections
ALTER TABLE secure_sections
ADD COLUMN IF NOT EXISTS arrival_instructions_en TEXT,
ADD COLUMN IF NOT EXISTS arrival_instructions_es TEXT,
ADD COLUMN IF NOT EXISTS arrival_instructions_nl TEXT,
ADD COLUMN IF NOT EXISTS arrival_instructions_de TEXT,
ADD COLUMN IF NOT EXISTS arrival_instructions_it TEXT,
ADD COLUMN IF NOT EXISTS arrival_instructions_pt TEXT,
ADD COLUMN IF NOT EXISTS parking_info_en TEXT,
ADD COLUMN IF NOT EXISTS parking_info_es TEXT,
ADD COLUMN IF NOT EXISTS parking_info_nl TEXT,
ADD COLUMN IF NOT EXISTS parking_info_de TEXT,
ADD COLUMN IF NOT EXISTS parking_info_it TEXT,
ADD COLUMN IF NOT EXISTS parking_info_pt TEXT,
ADD COLUMN IF NOT EXISTS additional_info_en TEXT,
ADD COLUMN IF NOT EXISTS additional_info_es TEXT,
ADD COLUMN IF NOT EXISTS additional_info_nl TEXT,
ADD COLUMN IF NOT EXISTS additional_info_de TEXT,
ADD COLUMN IF NOT EXISTS additional_info_it TEXT,
ADD COLUMN IF NOT EXISTS additional_info_pt TEXT;

-- Ajouter des traductions de base pour les catégories existantes
UPDATE categories SET
  name_en = CASE slug
    WHEN 'restaurants' THEN 'Restaurants'
    WHEN 'activites' THEN 'Activities'
    WHEN 'culture' THEN 'Culture'
    WHEN 'nature' THEN 'Nature'
    WHEN 'shopping' THEN 'Shopping'
    ELSE name_en
  END,
  name_es = CASE slug
    WHEN 'restaurants' THEN 'Restaurantes'
    WHEN 'activites' THEN 'Actividades'
    WHEN 'culture' THEN 'Cultura'
    WHEN 'nature' THEN 'Naturaleza'
    WHEN 'shopping' THEN 'Compras'
    ELSE name_es
  END,
  name_nl = CASE slug
    WHEN 'restaurants' THEN 'Restaurants'
    WHEN 'activites' THEN 'Activiteiten'
    WHEN 'culture' THEN 'Cultuur'
    WHEN 'nature' THEN 'Natuur'
    WHEN 'shopping' THEN 'Winkelen'
    ELSE name_nl
  END,
  name_de = CASE slug
    WHEN 'restaurants' THEN 'Restaurants'
    WHEN 'activites' THEN 'Aktivitäten'
    WHEN 'culture' THEN 'Kultur'
    WHEN 'nature' THEN 'Natur'
    WHEN 'shopping' THEN 'Einkaufen'
    ELSE name_de
  END,
  name_it = CASE slug
    WHEN 'restaurants' THEN 'Ristoranti'
    WHEN 'activites' THEN 'Attività'
    WHEN 'culture' THEN 'Cultura'
    WHEN 'nature' THEN 'Natura'
    WHEN 'shopping' THEN 'Shopping'
    ELSE name_it
  END,
  name_pt = CASE slug
    WHEN 'restaurants' THEN 'Restaurantes'
    WHEN 'activites' THEN 'Atividades'
    WHEN 'culture' THEN 'Cultura'
    WHEN 'nature' THEN 'Natureza'
    WHEN 'shopping' THEN 'Compras'
    ELSE name_pt
  END
WHERE slug IN ('restaurants', 'activites', 'culture', 'nature', 'shopping');
