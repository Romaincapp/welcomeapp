# Guide d'utilisation - Authentification et Edition

## Système d'authentification mis en place

Votre application dispose maintenant d'un système complet d'authentification et d'édition !

### Pages créées

1. **[/login](http://localhost:3001/login)** - Page de connexion
2. **[/signup](http://localhost:3001/signup)** - Page de création de compte

### Fonctionnalités disponibles

#### Pour les visiteurs
- Consulter les welcomebooks (ex: `/demo`)
- Voir tous les conseils et la carte interactive

#### Pour les gestionnaires connectés
- **Bouton "Mode édition"** en haut à droite pour activer/désactiver l'édition
- **Bouton "+" flottant** pour ajouter un nouveau conseil
- **Boutons "Éditer"** et "Supprimer" sur chaque card de conseil
- **Bouton "Paramètres"** pour personnaliser les couleurs et l'arrière-plan
- **Upload d'images** vers Supabase Storage ou ajout d'URLs d'images
- **Déconnexion** via le bouton rouge

### Configuration Supabase requise

Pour que l'authentification fonctionne, vous devez :

#### 1. Activer l'authentification Email dans Supabase

1. Allez sur [https://supabase.com/dashboard/project/nimbzitahumdefggtiob](https://supabase.com/dashboard/project/nimbzitahumdefggtiob)
2. Cliquez sur **Authentication** dans le menu de gauche
3. Allez dans **Providers**
4. Assurez-vous que **Email** est activé
5. Dans **Configuration** > **Email Templates**, configurez les templates si nécessaire

#### 2. Configurer le Storage pour les images

1. Dans Supabase, allez dans **Storage**
2. Créez un bucket nommé **`media`** s'il n'existe pas
3. Rendez-le public :
   ```sql
   -- Dans SQL Editor
   UPDATE storage.buckets
   SET public = true
   WHERE name = 'media';
   ```

4. Ajoutez les policies de storage :
   ```sql
   -- Lecture publique
   CREATE POLICY "Public can read media"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'media');

   -- Les users authentifiés peuvent uploader
   CREATE POLICY "Authenticated users can upload media"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'media'
     AND auth.role() = 'authenticated'
   );

   -- Les users authentifiés peuvent supprimer leurs uploads
   CREATE POLICY "Authenticated users can delete media"
   ON storage.objects FOR DELETE
   USING (
     bucket_id = 'media'
     AND auth.role() = 'authenticated'
   );
   ```

#### 3. Ajouter les RLS policies pour l'édition

```sql
-- Les utilisateurs authentifiés peuvent créer des tips
CREATE POLICY "Authenticated users can create tips"
ON tips FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Les utilisateurs authentifiés peuvent modifier des tips
CREATE POLICY "Authenticated users can update tips"
ON tips FOR UPDATE
USING (auth.role() = 'authenticated');

-- Les utilisateurs authentifiés peuvent supprimer des tips
CREATE POLICY "Authenticated users can delete tips"
ON tips FOR DELETE
USING (auth.role() = 'authenticated');

-- Même chose pour tip_media
CREATE POLICY "Authenticated users can create tip_media"
ON tip_media FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete tip_media"
ON tip_media FOR DELETE
USING (auth.role() = 'authenticated');
```

### Comment tester

1. **Créer un compte** :
   - Allez sur http://localhost:3001/signup
   - Entrez un email et un mot de passe (min 6 caractères)
   - Cliquez sur "Créer mon compte"

2. **Se connecter** :
   - Allez sur http://localhost:3001/login
   - Entrez vos identifiants
   - Vous serez redirigé vers la page d'accueil

3. **Tester l'édition** :
   - Allez sur http://localhost:3001/demo
   - Cliquez sur "Mode édition" en haut à droite
   - Testez l'ajout, la modification et la suppression de conseils

### Architecture

```
📁 Authentication Flow
├── /login → Page de connexion
├── /signup → Page de création de compte
├── useDevAuth hook → Gère la session Supabase
├── AuthButton → Bouton login/logout dans le header
└── WelcomeBookClient → Active le mode édition si connecté

📁 Edit Mode
├── Bouton "Mode édition" → Active/désactive l'édition
├── AddTipModal → Ajouter un conseil
├── EditTipModal → Modifier un conseil
├── DeleteConfirmDialog → Supprimer un conseil
└── CustomizationMenu → Personnaliser le design
```

### Notes importantes

- **Sécurité** : Les policies RLS protègent les données. Seuls les utilisateurs authentifiés peuvent modifier.
- **Storage** : Les images uploadées sont stockées dans Supabase Storage (`media` bucket).
- **Session** : La session est gérée automatiquement par Supabase Auth (cookies sécurisés).
- **Refresh** : Après chaque modification, la page se rafraîchit automatiquement pour afficher les changements.

### Prochaines étapes possibles

1. **Lier les gestionnaires aux clients** : Ajouter une relation entre `auth.users` et `clients` pour que chaque gestionnaire ne puisse éditer que son welcomebook
2. **Dashboard admin** : Créer une page `/dashboard` pour gérer tous les conseils
3. **Système de rôles** : Ajouter des rôles (admin, éditeur, lecteur)
4. **Analytics** : Tracker les vues et les interactions
5. **QR Code** : Générer un QR code pour partager le welcomebook
