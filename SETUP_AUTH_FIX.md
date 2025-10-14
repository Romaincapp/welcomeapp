# Fix Authentification Supabase - Guide Complet

## 🎯 Problème : Erreur 500 lors de la création d'utilisateur

Cette erreur vient généralement de la configuration email de Supabase.

## ✅ Solution 1 : Configuration via l'interface (Recommandée)

### Étape 1 : Désactiver la confirmation d'email

1. Allez sur : https://supabase.com/dashboard/project/nimbzitahumdefggtiob/auth/providers

2. Cliquez sur **"Email"**

3. **Décochez "Confirm email"** (c'est crucial !)

4. **Vérifiez que "Enable sign ups" est coché**

5. Cliquez sur **"Save"**

### Étape 2 : Vérifier les URLs

1. Allez sur : https://supabase.com/dashboard/project/nimbzitahumdefggtiob/auth/url-configuration

2. Configurez :
   - **Site URL** : `http://localhost:3000`
   - **Redirect URLs** : Ajoutez `http://localhost:3000/**`

3. **Sauvegardez**

### Étape 3 : Créer l'utilisateur via l'interface

1. Allez sur : https://supabase.com/dashboard/project/nimbzitahumdefggtiob/auth/users

2. Cliquez sur **"Add user"** → **"Create new user"**

3. Remplissez :
   - Email : `test@welcomebook.be`
   - Password : `Test123456!`
   - **Auto Confirm User** : ✅ **COCHEZ !**

4. Si ça ne marche toujours pas, passez à la Solution 2

## ✅ Solution 2 : Script avec clé Service Role

### Étape 1 : Récupérer la clé service_role

1. Allez sur : https://supabase.com/dashboard/project/nimbzitahumdefggtiob/settings/api

2. Cherchez **"service_role key"** (section "Project API keys")

3. **Cliquez sur "Reveal"** et copiez la clé

⚠️ **ATTENTION** : Cette clé donne tous les droits ! Ne la commitez JAMAIS dans Git !

### Étape 2 : Ajouter la clé dans .env.local

Ouvrez `.env.local` et ajoutez :

```env
NEXT_PUBLIC_SUPABASE_URL=https://nimbzitahumdefggtiob.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_actuelle
SUPABASE_SERVICE_KEY=votre_cle_service_role_ici
```

### Étape 3 : Exécuter le script

```bash
# Installer les dépendances si nécessaire
npm install

# Exécuter le script
node scripts/create-user.js
```

Vous devriez voir :
```
✅ Utilisateur créé avec succès !
📧 Email: test@welcomebook.be
🔑 Password: Test123456!
```

## ✅ Solution 3 : Tester via la page d'inscription

Si les solutions précédentes ne marchent pas, utilisez la page d'inscription :

```bash
npm run dev
```

Visitez : http://localhost:3000/signup

Créez un compte normalement. Si ça marche, le problème venait de l'interface admin de Supabase.

## 🔍 Diagnostic : Vérifier que l'Auth fonctionne

Dans votre navigateur sur http://localhost:3000/demo, ouvrez la console (F12) et tapez :

```javascript
// Test 1 : Vérifier la connexion à Supabase
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

// Test 2 : Tester l'inscription (changez l'email à chaque fois)
const { data, error } = await supabase.auth.signUp({
  email: 'test2@welcomebook.be',
  password: 'Test123456!'
})
console.log('Résultat:', data, error)
```

Si vous voyez une erreur détaillée, partagez-la moi !

## 🐛 Erreurs courantes

### "Email rate limit exceeded"
- Trop de tentatives
- Attendez 1 heure ou changez d'email

### "Invalid email"
- Vérifiez le format de l'email
- Essayez avec un email différent

### "User already registered"
- L'utilisateur existe déjà
- Essayez de vous connecter au lieu de créer un compte
- Ou utilisez un autre email

### "Database error"
- Le schéma auth n'est pas correctement initialisé
- Contactez le support Supabase
- Ou créez un nouveau projet Supabase (parfois plus rapide)

## 🎯 Solution de dernier recours : Nouveau projet

Si RIEN ne fonctionne :

1. Créez un **nouveau projet Supabase**
2. Copiez la nouvelle URL et les nouvelles clés dans `.env.local`
3. Réexécutez le script SQL de base de données (`supabase/schema.sql`)
4. Créez l'utilisateur via l'interface du nouveau projet

Les nouveaux projets Supabase ont souvent une meilleure configuration par défaut.

## 📞 Besoin d'aide ?

Si rien ne marche :
1. Envoyez-moi une capture d'écran de l'erreur exacte
2. Envoyez une capture de votre config dans Auth → Providers → Email
3. On trouvera une solution !
