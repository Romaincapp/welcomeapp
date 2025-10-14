# Quick Start Guide - WelcomeBook

## Installation rapide (5 minutes)

### 1. Cloner et installer

```bash
git clone <votre-repo>
cd welcomeapp
npm install
```

### 2. Configurer Supabase

#### A. Créer un projet Supabase
- Allez sur https://supabase.com
- Créez un compte et un nouveau projet
- Notez l'URL et la clé anon

#### B. Variables d'environnement
```bash
cp .env.local.example .env.local
```

Éditez `.env.local` :
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

#### C. Initialiser la base de données
1. Dashboard Supabase → SQL Editor
2. Copiez le contenu de `supabase/schema.sql`
3. Exécutez la requête

### 3. Lancer l'application

```bash
npm run dev
```

Visitez : http://localhost:3000

### 4. Tester la démo

Visitez : http://localhost:3000/demo

Vous verrez un welcomebook de démonstration complet !

---

## Structure rapide

```
app/
  [slug]/          # Pages dynamiques (/demo, /villa-ardennes, etc.)
components/        # Composants UI réutilisables
lib/supabase/      # Configuration Supabase
types/             # Types TypeScript
supabase/          # Schéma de la base de données
```

---

## Créer votre premier welcomebook

### 1. Via SQL (Dashboard Supabase)

```sql
-- Créer un client
INSERT INTO clients (name, slug, email)
VALUES ('Ma Villa', 'ma-villa', 'contact@mavilla.be');

-- Récupérer l'ID du client
SELECT id FROM clients WHERE slug = 'ma-villa';

-- Ajouter un conseil (remplacez UUID_DU_CLIENT)
INSERT INTO tips (client_id, title, comment, location, coordinates)
VALUES (
  'UUID_DU_CLIENT',
  'Restaurant Le Gourmet',
  'Excellent restaurant local avec vue sur la vallée',
  'Rue Principale 15, 6980 La Roche',
  '{"lat": 50.1831, "lng": 5.5769}'::jsonb
);
```

### 2. Visiter votre welcomebook

http://localhost:3000/ma-villa

---

## Personnalisation rapide

### Changer les couleurs

```sql
UPDATE clients
SET
  header_color = '#6366F1',
  footer_color = '#312E81'
WHERE slug = 'ma-villa';
```

### Ajouter des boutons au footer

```sql
INSERT INTO footer_buttons (client_id, label, emoji, link, "order")
VALUES
  ('UUID_DU_CLIENT', 'WhatsApp', '💬', 'https://wa.me/32123456789', 0),
  ('UUID_DU_CLIENT', 'Email', '📧', 'mailto:contact@mavilla.be', 1);
```

### Ajouter une photo à un conseil

```sql
-- Trouver l'ID du conseil
SELECT id, title FROM tips WHERE client_id = 'UUID_DU_CLIENT';

-- Ajouter une image
INSERT INTO tip_media (tip_id, url, type, "order")
VALUES (
  'UUID_DU_CONSEIL',
  'https://images.unsplash.com/photo-restaurant.jpg',
  'image',
  0
);
```

---

## Commandes utiles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Démarrer en production
npm run start

# Vérifier les types TypeScript
npx tsc --noEmit
```

---

## Dépannage

### Erreur de build

```bash
# Supprimer les caches
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### Erreur de connexion Supabase

Vérifiez que :
1. Les variables d'environnement sont correctes dans `.env.local`
2. Le fichier `.env.local` existe (pas `.env.local.example`)
3. Vous avez redémarré le serveur après avoir modifié `.env.local`

### Carte ne s'affiche pas

C'est normal ! Leaflet nécessite que les conseils aient des coordonnées :

```sql
UPDATE tips
SET coordinates = '{"lat": 50.1831, "lng": 5.5769}'::jsonb
WHERE id = 'UUID_DU_CONSEIL';
```

---

## Prochaines étapes

1. **Ajoutez plus de conseils** avec des photos et des catégories
2. **Personnalisez les couleurs** pour matcher votre branding
3. **Ajoutez un arrière-plan** personnalisé
4. **Configurez les horaires** d'ouverture pour chaque conseil
5. **Ajoutez des codes promo** exclusifs

## Documentation complète

- [README.md](README.md) - Vue d'ensemble complète
- [SETUP.md](SETUP.md) - Guide de configuration détaillé
- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture technique

## Support

Des questions ? Consultez :
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Supabase](https://supabase.com/docs)
- Issues GitHub du projet
