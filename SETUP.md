# Guide de Configuration - WelcomeBook

## Configuration Supabase

### 1. Créer un projet Supabase

1. Rendez-vous sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre URL de projet et votre clé anonyme (anon key)

### 2. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votreprojet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_ici
```

### 3. Initialiser la base de données

1. Dans votre dashboard Supabase, allez dans l'onglet "SQL Editor"
2. Créez une nouvelle requête
3. Copiez le contenu du fichier `supabase/schema.sql`
4. Exécutez la requête

Cela créera :
- Toutes les tables nécessaires
- Les index pour améliorer les performances
- Les politiques RLS (Row Level Security) pour la lecture publique
- Des données de démonstration (client "demo" avec quelques conseils)

### 4. Configurer le Storage (optionnel)

Pour l'upload d'images personnalisées :

1. Allez dans "Storage" dans votre dashboard Supabase
2. Créez un nouveau bucket nommé "welcomebook-media"
3. Configurez les permissions :
   - Lecture publique : `true`
   - Upload authentifié : `true`

### 5. Tester avec les données de démonstration

Une fois la base de données initialisée, visitez :
```
http://localhost:3000/demo
```

Vous devriez voir le welcomebook de démonstration avec :
- Un header personnalisé
- Des conseils organisés par catégories
- Une carte interactive
- Un footer avec des boutons d'action

## Structure de données

### Exemple de coordonnées (JSONB)
```json
{
  "lat": 50.8503,
  "lng": 4.3517
}
```

### Exemple d'horaires d'ouverture (JSONB)
```json
{
  "monday": "09:00-18:00",
  "tuesday": "09:00-18:00",
  "wednesday": "Fermé",
  "thursday": "09:00-18:00",
  "friday": "09:00-20:00",
  "saturday": "10:00-20:00",
  "sunday": "10:00-17:00"
}
```

### Exemple de réseaux sociaux (JSONB)
```json
{
  "facebook": "https://facebook.com/monrestaurant",
  "instagram": "https://instagram.com/monrestaurant",
  "twitter": "https://twitter.com/monrestaurant"
}
```

## Ajouter un nouveau client

### Via SQL
```sql
INSERT INTO clients (name, slug, email, header_color, footer_color)
VALUES (
  'Nom de votre location',
  'slug-unique',
  'email@exemple.com',
  '#4F46E5',
  '#1E1B4B'
);
```

### Slug
Le slug est utilisé dans l'URL : `welcomebook.be/[slug]`
- Doit être unique
- Utiliser uniquement des lettres minuscules, chiffres et tirets
- Exemples : `villa-ardennes`, `chalet-ski`, `appartement-mer`

## Ajouter des conseils

```sql
-- Récupérer l'ID de votre client
SELECT id FROM clients WHERE slug = 'votre-slug';

-- Récupérer les IDs des catégories
SELECT id, name FROM categories;

-- Ajouter un conseil
INSERT INTO tips (
  client_id,
  category_id,
  title,
  comment,
  location,
  coordinates,
  contact_phone,
  opening_hours
) VALUES (
  'uuid-du-client',
  'uuid-de-la-categorie',
  'Nom du lieu',
  'Description du lieu...',
  'Adresse complète',
  '{"lat": 50.8503, "lng": 4.3517}'::jsonb,
  '+32 123 456 789',
  '{"monday": "09:00-18:00", "tuesday": "09:00-18:00"}'::jsonb
);
```

## Ajouter des médias à un conseil

```sql
-- Récupérer l'ID de votre conseil
SELECT id, title FROM tips WHERE client_id = 'uuid-du-client';

-- Ajouter une image
INSERT INTO tip_media (tip_id, url, type, "order")
VALUES (
  'uuid-du-conseil',
  'https://votreurl.com/image.jpg',
  'image',
  0
);

-- Ajouter une vidéo
INSERT INTO tip_media (tip_id, url, type, "order")
VALUES (
  'uuid-du-conseil',
  'https://votreurl.com/video.mp4',
  'video',
  1
);
```

## Personnaliser le footer

```sql
-- Ajouter des boutons d'action
INSERT INTO footer_buttons (client_id, label, emoji, link, "order")
VALUES
  ('uuid-du-client', 'WhatsApp', '💬', 'https://wa.me/32123456789', 0),
  ('uuid-du-client', 'Urgence', '🚨', 'tel:+32123456789', 1),
  ('uuid-du-client', 'Email', '📧', 'mailto:contact@exemple.com', 2);
```

## Prochaines étapes

Une fois la configuration de base terminée, vous pouvez :

1. **Personnaliser les couleurs** : Modifiez `header_color` et `footer_color` dans la table `clients`
2. **Ajouter un arrière-plan** : Uploadez une image et mettez à jour `background_image`
3. **Créer vos catégories** : Ajoutez des catégories personnalisées avec des émojis
4. **Implémenter l'authentification** : Pour le mode édition (à venir)

## Support

Pour toute question, consultez la documentation de :
- [Next.js](https://nextjs.org/docs)
- [Supabase](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
