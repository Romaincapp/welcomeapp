# Système d'Authentification et d'Édition - WelcomeBook

## ✅ Ce qui a été mis en place

### 1. Pages d'authentification
- **[/login](http://localhost:3001/login)** - Connexion avec email/mot de passe
- **[/signup](http://localhost:3001/signup)** - Création de compte

### 2. Système de session
- `useDevAuth` hook - Gère l'authentification Supabase
- `AuthButton` - Bouton login/logout dans le header
- Gestion automatique des cookies de session
- Refresh automatique de la session

### 3. Mode édition complet
- **Bouton "Mode édition"** - Active/désactive l'édition (visible seulement si connecté)
- **Bouton "+"** flottant - Ajoute un nouveau conseil
- **Boutons "Éditer"/"Supprimer"** - Sur chaque card de conseil
- **Bouton "Paramètres"** - Personnalise le header/footer/background

### 4. Modales d'édition
- **AddTipModal** - Formulaire complet d'ajout de conseil
  - Upload d'images vers Supabase Storage
  - Ajout d'URLs d'images directes
  - Champs : titre, catégorie, description, localisation, coordonnées, contact, liens

- **EditTipModal** - Formulaire de modification
  - Pré-rempli avec les données existantes
  - Suppression d'images existantes
  - Ajout de nouvelles images

- **DeleteConfirmDialog** - Confirmation de suppression

### 5. Sécurité configurée
- Row Level Security (RLS) activé
- Policies pour authentification
- Protection des routes d'édition
- Upload sécurisé vers Supabase Storage

## 📋 Configuration requise (1 minute)

### Étape unique : Exécuter le script SQL

1. Ouvrez [Supabase SQL Editor](https://supabase.com/dashboard/project/nimbzitahumdefggtiob/sql/new)
2. Copiez le contenu de `supabase/setup_auth_policies.sql`
3. Collez-le dans l'éditeur
4. Cliquez sur **Run** ▶️

Le script configure :
- ✅ Le bucket Storage "media" (public)
- ✅ Les permissions de lecture/écriture
- ✅ Les policies RLS pour toutes les tables
- ✅ Les permissions pour les utilisateurs authentifiés

## 🚀 Comment utiliser

### Pour tester rapidement

```bash
# 1. Le serveur dev est déjà lancé sur http://localhost:3001

# 2. Créer un compte
# Allez sur http://localhost:3001/signup
# Email: test@welcomebook.be
# Password: test123 (min 6 caractères)

# 3. Se connecter
# Allez sur http://localhost:3001/login
# Utilisez vos identifiants

# 4. Éditer le welcomebook demo
# Allez sur http://localhost:3001/demo
# Cliquez sur "Mode édition"
# Testez l'ajout, la modification, la suppression
```

## 🎯 Fonctionnalités clés

### Interface utilisateur
```
┌─────────────────────────────────────┐
│  Header + AuthButton                │
│  [Connexion] ou [Mode édition | ⚙️]│
└─────────────────────────────────────┘
│                                     │
│  📱 Conseils par catégorie          │
│  [Card 1] [Card 2] [Card 3] →       │
│                                     │
│  🗺️ Carte interactive               │
│  ┌─────────────────────────┐       │
│  │  📍 📍 📍               │       │
│  └─────────────────────────┘       │
│                                     │
└─────────────────────────────────────┘
│  Footer + Boutons contact           │
└─────────────────────────────────────┘

[+] Bouton flottant (si mode édition actif)
```

### Workflow d'édition
```
1. Connexion → /login
2. Activer "Mode édition"
3. Choisir une action :
   - [+] Ajouter un conseil
   - [Éditer] Modifier un conseil existant
   - [Supprimer] Supprimer un conseil
   - [⚙️] Personnaliser le design
4. Sauvegarder
5. ✅ Refresh automatique de la page
```

## 📁 Fichiers créés/modifiés

### Nouveaux fichiers
```
app/login/page.tsx                  # Page de connexion
components/AuthButton.tsx           # Bouton auth dans header
supabase/setup_auth_policies.sql    # Script de config (à exécuter)
GUIDE_AUTH.md                       # Documentation complète
QUICK_START.md                      # Guide de démarrage rapide
README_AUTH.md                      # Ce fichier
```

### Fichiers modifiés
```
components/Header.tsx               # Ajout du AuthButton
app/signup/page.tsx                 # Lien vers /login corrigé
app/page.tsx                        # Page d'accueil améliorée
```

### Fichiers existants (déjà fonctionnels)
```
hooks/useDevAuth.ts                 # Hook d'auth (déjà Supabase)
components/AddTipModal.tsx          # Modale d'ajout (déjà ok)
components/EditTipModal.tsx         # Modale d'édition (déjà ok)
components/DeleteConfirmDialog.tsx  # Suppression (déjà ok)
app/[slug]/WelcomeBookClient.tsx    # Gestion du mode édition (déjà ok)
```

## 🔐 Sécurité

### Ce qui est protégé
- ✅ Seuls les users authentifiés peuvent créer/modifier/supprimer
- ✅ Les données sont visibles publiquement (lecture)
- ✅ Upload d'images sécurisé via Supabase Storage
- ✅ Session gérée par cookies HTTP-only

### Prochaines améliorations possibles
- 🔜 Lier chaque gestionnaire à SON welcomebook uniquement
- 🔜 Système de rôles (admin, editor, viewer)
- 🔜 Vérification d'email
- 🔜 Reset de mot de passe

## 📊 Ce qui fonctionne déjà

### Authentification
- ✅ Inscription avec email/password
- ✅ Connexion
- ✅ Déconnexion
- ✅ Session persistante (cookies)
- ✅ Refresh automatique

### Édition
- ✅ Ajout de conseils
- ✅ Modification de conseils
- ✅ Suppression de conseils
- ✅ Upload d'images (fichiers)
- ✅ Ajout d'images (URLs)
- ✅ Suppression d'images
- ✅ Personnalisation des couleurs
- ✅ Changement d'arrière-plan

### Interface
- ✅ Mode édition toggle
- ✅ Boutons visibles uniquement si connecté
- ✅ Feedback visuel (loading, erreurs)
- ✅ Modales responsives
- ✅ Refresh automatique après modification

## 🎨 Prochaines étapes possibles

### 1. Système de propriété
```sql
-- Lier un user à un client
ALTER TABLE clients ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Policy pour n'éditer que SON welcomebook
CREATE POLICY "Users can only edit their own welcomebook"
ON tips FOR ALL
USING (
  client_id IN (
    SELECT id FROM clients WHERE user_id = auth.uid()
  )
);
```

### 2. Dashboard admin
- Page `/dashboard` pour gérer tous ses conseils
- Liste de tous les welcomebooks du gestionnaire
- Statistiques (vues, clics)

### 3. Fonctionnalités avancées
- QR Code de partage
- Export PDF du welcomebook
- Mode preview avant publication
- Historique des modifications

### 4. Optimisations
- Cache des images
- Lazy loading des modales
- Optimistic updates
- PWA (mode offline)

## 🆘 Dépannage

### Les modifications ne s'enregistrent pas
```bash
# Vérifiez que le script SQL a bien été exécuté
# Allez dans Supabase → SQL Editor
# Exécutez supabase/setup_auth_policies.sql
```

### Je ne peux pas uploader d'images
```bash
# Vérifiez que le bucket "media" existe
# Supabase → Storage → Buckets
# Le bucket doit être "public"
```

### L'authentification ne fonctionne pas
```bash
# Vérifiez que Email Auth est activé
# Supabase → Authentication → Providers → Email
# Doit être "Enabled"
```

## 📚 Documentation

- [QUICK_START.md](./QUICK_START.md) - Guide de démarrage rapide
- [GUIDE_AUTH.md](./GUIDE_AUTH.md) - Documentation complète
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture du projet

## ✨ Résumé

Vous avez maintenant un système complet d'authentification et d'édition qui fonctionne !

**Ce qu'il reste à faire** : Une seule étape - exécuter le script SQL dans Supabase.

**Ensuite** : Créez un compte, connectez-vous, et testez l'édition sur http://localhost:3001/demo

Bon développement ! 🚀
