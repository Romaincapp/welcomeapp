# Authentification - Configuration terminée

## Ce qui a été configuré

### 1. Base de données Supabase

✅ **Table `public.users`** créée et synchronisée avec `auth.users`
✅ **Colonne `user_id`** ajoutée dans la table `clients` pour lier les utilisateurs aux welcomebooks
✅ **Trigger automatique** pour synchroniser `auth.users` avec `public.users`
✅ **Politiques RLS** configurées pour la sécurité

### 2. Utilisateur test créé

- **Email** : `romainfrancedumoulin@gmail.com`
- **ID** : `ece3f8f0-8be3-468d-9ed1-b2ba9c4a868d`
- **Lié au client** : "Villa des Ardennes" (slug: `demo`)

### 3. Code d'authentification

✅ **Hook `useDevAuth`** ([hooks/useDevAuth.ts](hooks/useDevAuth.ts)) :
   - Remplacé le système factice par Supabase Auth
   - Gère la session utilisateur avec `supabase.auth.getSession()`
   - Fonctions `login(email, password)` et `logout()`

✅ **Modal de connexion** ([components/DevLoginModal.tsx](components/DevLoginModal.tsx)) :
   - Interface email + mot de passe
   - Gestion des erreurs
   - État de chargement pendant la connexion

✅ **WelcomeBookClient** ([app/[slug]/WelcomeBookClient.tsx](app/[slug]/WelcomeBookClient.tsx)) :
   - Intégration de l'authentification
   - Bouton "Connexion gestionnaire" pour les utilisateurs non connectés
   - Bouton "Mode édition" pour les gestionnaires connectés

## Architecture de l'authentification

```
Utilisateur non connecté
    ↓
Clique sur "Connexion gestionnaire"
    ↓
Modal de login s'ouvre
    ↓
Entre email + mot de passe
    ↓
Supabase Auth vérifie les identifiants
    ↓
Si succès → Session créée
    ↓
Mode édition activé automatiquement
    ↓
Boutons d'édition visibles sur les cards
```

## Principe de fonctionnement

### Pour les voyageurs (visiteurs)
- **Pas de compte nécessaire**
- Accès en lecture seule à `/demo` (ou `/[slug]`)
- Peuvent voir tous les conseils, la carte, les boutons de contact

### Pour les gestionnaires (propriétaires)
- **Doivent se connecter** avec email + mot de passe
- Une fois connectés, peuvent activer le "Mode édition"
- En mode édition :
  - Boutons "Éditer" et "Supprimer" apparaissent sur les cards
  - Bouton "+" flottant pour ajouter des conseils
  - Menu hamburger pour personnaliser le design (à implémenter)

## Sécurité (RLS)

Les politiques Row Level Security sont configurées pour :

1. **Lecture publique** : Tout le monde peut voir les welcomebooks
2. **Écriture restreinte** : Seul le propriétaire (user_id === client.user_id) peut éditer son welcomebook

```sql
-- Politique d'édition (déjà créée)
CREATE POLICY "Users can manage their own client"
  ON public.clients
  FOR ALL
  USING (auth.uid() = user_id);
```

## Prochaines étapes

### À implémenter :

1. **Vérification de propriété**
   - Vérifier que l'utilisateur connecté possède bien le welcomebook qu'il essaie d'éditer
   - Masquer le bouton "Mode édition" si l'utilisateur n'est pas propriétaire

2. **Fonctionnalités d'édition**
   - Modal pour ajouter un nouveau conseil
   - Modal pour éditer un conseil existant
   - Modal pour supprimer un conseil
   - Upload d'images vers Supabase Storage

3. **Personnalisation du design**
   - Modal pour changer les couleurs (header, footer)
   - Upload d'image de fond
   - Édition des boutons du footer

4. **Gestion des utilisateurs**
   - Page d'inscription pour les nouveaux gestionnaires
   - Récupération de mot de passe oublié
   - Page de profil pour gérer son compte

## Tester l'authentification

1. Démarrer le serveur de développement :
```bash
npm run dev
```

2. Ouvrir le navigateur sur : `http://localhost:3000/demo`

3. Cliquer sur **"Connexion gestionnaire"**

4. Entrer les identifiants :
   - Email : `romainfrancedumoulin@gmail.com`
   - Mot de passe : (le mot de passe que vous avez défini dans Supabase Dashboard)

5. Une fois connecté, cliquer sur **"Mode édition"**

6. Les boutons d'édition devraient apparaître sur les cards

## Scripts utiles

### Vérifier les utilisateurs

```bash
npx tsx scripts/list-users.ts
```

### Vérifier les tables

```bash
npx tsx scripts/check-tables.ts
```

### Lier un utilisateur à un client

```bash
npx tsx scripts/link-user-to-client.ts
```

## Dépannage

### L'utilisateur ne peut pas se connecter

1. Vérifier que l'email est confirmé dans Supabase Dashboard
2. Vérifier que le mot de passe est correct
3. Vérifier les logs de Supabase Dashboard → Auth → Logs

### Le mode édition ne fonctionne pas

1. Vérifier que l'utilisateur est bien connecté (ouvrir la console et taper `localStorage`)
2. Vérifier que `user_id` dans la table `clients` correspond bien à l'ID de l'utilisateur
3. Vérifier les politiques RLS dans Supabase Dashboard → Database → Policies

### Erreur "public.users does not exist"

Si cette erreur réapparaît, réexécuter le script SQL :
- Dashboard Supabase → SQL Editor → Coller le contenu de [supabase/fix-users-table.sql](supabase/fix-users-table.sql)

## Ressources

- [Documentation Supabase Auth](https://supabase.com/docs/guides/auth)
- [Documentation Next.js SSR](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
