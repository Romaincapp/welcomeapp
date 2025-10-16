# 🎉 Setup Complet - WelcomeBook avec Gestion des Gestionnaires

## ✅ Ce qui a été créé

### 1. **Système d'authentification complet**
- Page de connexion ([/login](http://localhost:3001/login))
- Page d'inscription ([/signup](http://localhost:3001/signup))
- Gestion de session automatique
- Déconnexion

### 2. **Dashboard gestionnaire**
- Page [/dashboard](http://localhost:3001/dashboard) (accès réservé aux connectés)
- Statistiques du welcomebook
- Bouton de partage avec QR code
- Accès rapide à l'édition
- Vue d'ensemble de toutes les infos

### 3. **Système de propriété**
- Chaque gestionnaire est lié à SON welcomebook
- Création automatique du welcomebook à l'inscription
- Génération automatique du sous-domaine (ex: `jean.welcomebook.be`)
- Seul le propriétaire peut éditer son welcomebook

### 4. **Partage et QR Code**
- Génération de QR code
- Téléchargement du QR code en PNG
- Copie du lien en un clic
- Partage par email
- URL personnalisée : `nomdelalocation.welcomebook.be`

### 5. **Sécurité renforcée**
- Row Level Security (RLS) activé
- Policies par propriétaire uniquement
- Lecture publique (visiteurs)
- Écriture limitée au propriétaire

---

## 🚀 Installation (2 étapes simples)

### Étape 1 : Exécuter le script SQL complet

1. Ouvrez [Supabase SQL Editor](https://supabase.com/dashboard/project/nimbzitahumdefggtiob/sql/new)

2. Copiez **TOUT** le contenu du fichier `supabase/complete_setup.sql`

3. Collez-le dans l'éditeur SQL

4. Cliquez sur **Run** ▶️

5. Vous devriez voir :
   ```
   ✅ Setup complet terminé avec succès!
   Les utilisateurs auront maintenant automatiquement leur welcomebook à l'inscription
   ```

**Ce que fait ce script :**
- ✅ Ajoute les colonnes `user_id` et `subdomain` à la table `clients`
- ✅ Crée une fonction pour générer des slugs uniques
- ✅ Crée un trigger qui génère automatiquement un welcomebook à l'inscription
- ✅ Configure le bucket Storage `media`
- ✅ Met en place toutes les permissions (RLS policies)
- ✅ Limite l'édition au propriétaire uniquement

### Étape 2 : Tester le système

#### A. Créer un compte
```
1. Ouvrez http://localhost:3001/signup
2. Entrez un email : test@welcomebook.be
3. Entrez un mot de passe : test123
4. Cliquez sur "Créer mon compte"
5. Vous serez redirigé vers /dashboard
```

#### B. Votre dashboard
```
Sur le dashboard, vous verrez :
- Vos statistiques (conseils, photos, catégories)
- Un bouton "Partager" (QR code + lien)
- Un bouton "Éditer" (mode édition)
- L'URL de votre welcomebook personnel
```

#### C. Éditer votre welcomebook
```
1. Cliquez sur "Éditer" ou "Voir mon WelcomeBook"
2. Cliquez sur "Mode édition" en haut à droite
3. Ajoutez, modifiez, supprimez des conseils
4. Personnalisez le design
```

#### D. Partager votre welcomebook
```
1. Retournez sur /dashboard
2. Cliquez sur "Partager"
3. Téléchargez le QR code
4. Copiez le lien
5. Envoyez-le à vos clients !
```

---

## 📋 Architecture du système

### Workflow d'inscription

```
Utilisateur s'inscrit
    ↓
Supabase Auth crée le compte
    ↓
Trigger "on_auth_user_created" s'exécute
    ↓
Création automatique d'un client avec :
    - user_id = ID de l'utilisateur
    - slug = généré depuis l'email (ex: "jean-dupont")
    - subdomain = même que le slug
    - name = "Mon WelcomeBook" (modifiable)
    - couleurs par défaut
    ↓
Redirection vers /dashboard
    ↓
L'utilisateur peut éditer son welcomebook
```

### Structure des permissions (RLS)

```
┌─────────────────────────────────────────────┐
│  LECTURE PUBLIQUE (tous les visiteurs)     │
│  - clients                                   │
│  - tips                                      │
│  - tip_media                                 │
│  - categories                                │
│  - footer_buttons                            │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  ÉCRITURE PROPRIÉTAIRE UNIQUEMENT           │
│  (auth.uid() = client.user_id)              │
│  - Modifier son client                       │
│  - Créer/modifier/supprimer ses tips        │
│  - Gérer ses médias                          │
│  - Gérer ses boutons de footer              │
└─────────────────────────────────────────────┘
```

### URLs générées

```
Email d'inscription : jean.dupont@example.com

Génère automatiquement :
├── Slug : jean-dupont
├── Subdomain : jean-dupont
├── URL locale : localhost:3001/jean-dupont
└── URL production : jean-dupont.welcomebook.be
```

---

## 📁 Fichiers créés

### Nouveaux fichiers

```
supabase/
  └── complete_setup.sql          # Script SQL complet (À EXÉCUTER)

app/
  └── dashboard/
      ├── page.tsx                # Dashboard serveur (protected)
      └── DashboardClient.tsx     # Dashboard client

components/
  └── ShareWelcomeBookModal.tsx   # Modale de partage avec QR code

Documentation:
  └── SETUP_FINAL.md              # Ce fichier
```

### Fichiers modifiés

```
app/login/page.tsx                # Redirection vers /dashboard
app/signup/page.tsx               # Redirection vers /dashboard
package.json                      # Ajout de qrcode et react-qr-code
```

---

## 🎯 Fonctionnalités du Dashboard

### Vue d'ensemble
- **Statistiques** : Nombre de conseils, photos, catégories
- **Actions rapides** : Voir, Partager, Éditer
- **Informations** : Nom, sous-domaine, URL, date de création
- **Guide** : Instructions pour utiliser le welcomebook

### Modale de partage
- **QR Code** : Généré en temps réel, téléchargeable en PNG
- **Lien** : Copie en un clic
- **Email** : Partage direct par email
- **Instructions** : Comment partager avec les clients

---

## 🔧 Configuration avancée

### Personnaliser le nom du welcomebook

Par défaut, le welcomebook s'appelle "Mon WelcomeBook". Pour le changer :

```sql
-- Dans Supabase SQL Editor
UPDATE clients
SET name = 'Villa Paradis'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'votre@email.com');
```

Ou depuis l'application (à implémenter) :
- Ajouter un formulaire dans le dashboard
- Permettre au gestionnaire de modifier le nom

### Gérer plusieurs welcomebooks par utilisateur

Le système actuel permet à un utilisateur d'avoir un seul welcomebook.
Pour permettre plusieurs welcomebooks :

```sql
-- Supprimer la contrainte (si elle existe)
-- ALTER TABLE clients DROP CONSTRAINT IF EXISTS one_welcomebook_per_user;

-- Modifier le trigger pour créer plusieurs clients
-- (Code à adapter selon vos besoins)
```

### Configurer les sous-domaines en production

En production, vous devrez configurer :

1. **DNS Wildcard** : `*.welcomebook.be` → Vercel
2. **Vercel** : Configurer les domaines wildcard
3. **Routing** : Next.js gère déjà les routes dynamiques

---

## 🧪 Tests

### Tester la création automatique

```bash
# 1. Créez un nouveau compte
# 2. Vérifiez dans Supabase que le client a été créé :

SELECT c.name, c.slug, c.subdomain, u.email
FROM clients c
LEFT JOIN auth.users u ON c.user_id = u.id
WHERE u.email = 'test@welcomebook.be';
```

### Tester les permissions

```bash
# 1. Créez 2 comptes différents
# 2. Essayez d'éditer le welcomebook d'un autre utilisateur
# 3. Ça devrait être impossible (RLS bloque)
```

### Tester le QR code

```bash
# 1. Allez sur /dashboard
# 2. Cliquez sur "Partager"
# 3. Téléchargez le QR code
# 4. Scannez-le avec votre téléphone
# 5. Vérifiez que ça ouvre le bon welcomebook
```

---

## 📧 Prochaine étape : Email de bienvenue (optionnel)

Pour envoyer automatiquement un email avec le lien et le QR code :

### Option 1 : Supabase Edge Functions

```typescript
// supabase/functions/send-welcome-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { email, subdomain } = await req.json()

  // Générer le QR code
  // Envoyer l'email via SendGrid, Resend, ou autre

  return new Response(JSON.stringify({ success: true }))
})
```

### Option 2 : Service externe (Resend, SendGrid)

Configurer un webhook ou appeler l'API depuis le frontend après signup.

---

## 🎨 Customisation

### Changer les couleurs par défaut

Dans `complete_setup.sql`, modifiez :

```sql
header_color,
footer_color
) VALUES (
  NEW.id,
  'Mon WelcomeBook',
  generated_slug,
  generated_slug,
  user_email,
  '#4F46E5', -- ← Changez cette couleur (header)
  '#1E1B4B'  -- ← Changez cette couleur (footer)
);
```

### Modifier le nom par défaut

```sql
'Mon WelcomeBook', -- ← Changez ce texte
```

### Slug personnalisé

La fonction `generate_unique_slug` peut être modifiée pour :
- Utiliser le nom complet au lieu de l'email
- Ajouter des préfixes/suffixes
- Utiliser un format différent

---

## ✨ Résumé

Vous avez maintenant un système complet avec :

✅ Authentification (signup/login/logout)
✅ Dashboard gestionnaire
✅ Création automatique du welcomebook
✅ Génération de sous-domaine unique
✅ QR Code et partage
✅ Permissions sécurisées (seul le proprio édite)
✅ Interface moderne et responsive

**Il ne reste qu'une seule chose à faire** :
👉 Exécuter le script `supabase/complete_setup.sql` dans Supabase

Ensuite, créez un compte et testez ! 🚀

---

## 🆘 Problèmes ?

### "Le welcomebook n'a pas été créé"
→ Vérifiez que le trigger `on_auth_user_created` existe :
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

### "Je ne peux pas éditer"
→ Vérifiez que vous êtes bien le propriétaire :
```sql
SELECT c.*, u.email
FROM clients c
LEFT JOIN auth.users u ON c.user_id = u.id
WHERE c.slug = 'votre-slug';
```

### "Le QR code ne s'affiche pas"
→ Vérifiez que les librairies sont installées :
```bash
npm list qrcode react-qr-code
```

---

Pour plus d'infos, consultez :
- [QUICK_START.md](./QUICK_START.md)
- [GUIDE_AUTH.md](./GUIDE_AUTH.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
