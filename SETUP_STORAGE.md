# 🪣 Configuration du Storage Supabase

## Problème actuel
L'erreur `400 Bad Request` lors de l'upload d'images indique que le bucket `media` n'existe pas ou n'a pas les bonnes permissions.

## ✅ Solution : Créer le bucket "media"

### Étape 1 : Créer le bucket

1. Va sur le Dashboard Supabase : https://supabase.com/dashboard/project/nimbzitahumdefggtiob/storage/buckets
2. Clique sur **"New bucket"** (ou "Nouveau bucket")
3. Configure le bucket comme suit :
   - **Name** : `media`
   - **Public bucket** : ✅ **OUI** (cocher la case)
   - **File size limit** : `10 MB` (10485760 bytes)
   - **Allowed MIME types** : Laisser vide ou ajouter :
     ```
     image/png, image/jpeg, image/jpg, image/webp, image/gif, video/mp4, video/webm
     ```
4. Clique sur **"Create bucket"**

### Étape 2 : Configurer les politiques RLS (Row Level Security)

1. Va sur : https://supabase.com/dashboard/project/nimbzitahumdefggtiob/storage/policies
2. Sélectionne le bucket **`media`**
3. Ajoute les politiques suivantes :

#### 📖 Politique 1 : Public Read (SELECT)
- **Nom** : `Public Read Access`
- **Policy** : `SELECT`
- **Target roles** : `public`
- **USING expression** :
  ```sql
  true
  ```
- Clique sur **"Review"** puis **"Save policy"**

#### ✍️ Politique 2 : Authenticated Insert (INSERT)
- **Nom** : `Authenticated Users Can Upload`
- **Policy** : `INSERT`
- **Target roles** : `authenticated`
- **WITH CHECK expression** :
  ```sql
  true
  ```
- Clique sur **"Review"** puis **"Save policy"**

#### 🗑️ Politique 3 : Authenticated Delete (DELETE)
- **Nom** : `Authenticated Users Can Delete`
- **Policy** : `DELETE`
- **Target roles** : `authenticated`
- **USING expression** :
  ```sql
  true
  ```
- Clique sur **"Review"** puis **"Save policy"**

#### 🔄 Politique 4 : Authenticated Update (UPDATE)
- **Nom** : `Authenticated Users Can Update`
- **Policy** : `UPDATE`
- **Target roles** : `authenticated`
- **USING expression** :
  ```sql
  true
  ```
- **WITH CHECK expression** :
  ```sql
  true
  ```
- Clique sur **"Review"** puis **"Save policy"**

### Étape 3 : Tester

1. Redémarre le serveur de dev si nécessaire
2. Connecte-toi à ton welcomebook (http://localhost:3000/demo)
3. Active le mode édition
4. Clique sur "Personnaliser"
5. Va dans l'onglet "Arrière-plan"
6. Essaie d'uploader une image

## 🎯 Résultat attendu

Après ces configurations, tu devrais pouvoir :
- ✅ Uploader des images de fond pour les welcomebooks
- ✅ Uploader des images pour les conseils (tips)
- ✅ Voir toutes les images sans être connecté (lecture publique)
- ✅ Les utilisateurs authentifiés peuvent ajouter/modifier/supprimer leurs images

## 🔍 Vérification

Pour vérifier que le bucket est bien configuré :
1. Va sur https://supabase.com/dashboard/project/nimbzitahumdefggtiob/storage/buckets
2. Tu dois voir le bucket **`media`** avec :
   - 🌍 Badge **"Public"**
   - 📊 Taille limite : 10 MB
   - 🔒 4 politiques configurées

## 🚨 Note importante

Le bucket doit être **PUBLIC** pour que :
- Les voyageurs (non connectés) puissent voir les images
- Les images soient accessibles via des URLs publiques
- Next.js puisse charger les images via le composant `<Image>`

La sécurité est assurée par les politiques RLS qui permettent uniquement aux utilisateurs authentifiés de modifier/supprimer les fichiers.
