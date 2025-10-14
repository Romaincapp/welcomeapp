# Dépannage de l'authentification Supabase

## Problème : "Failed to create user: Database error creating new user"

Cette erreur se produit généralement pour l'une de ces raisons :

### Solution 1 : Vérifier la configuration Email dans Supabase

1. **Allez dans votre dashboard** : https://supabase.com/dashboard/project/nimbzitahumdefggtiob

2. **Cliquez sur Authentication → Providers**

3. **Vérifiez "Email" :**
   - Email doit être **activé** (toggle ON)
   - **"Confirm email"** : Pour le développement, **désactivez cette option**
   - Cela permettra aux utilisateurs de se connecter sans confirmation d'email

4. **Sauvegardez les changements**

### Solution 2 : Utiliser la page d'inscription

Au lieu de créer l'utilisateur manuellement, utilisez la page d'inscription que j'ai créée :

1. Lancez l'app : `npm run dev`
2. Visitez : http://localhost:3000/signup
3. Créez un compte avec :
   - Email : `test@welcomebook.be`
   - Password : `Test123456!`
4. Vous serez automatiquement redirigé vers `/demo` et connecté

### Solution 3 : Vérifier les paramètres Email Auth

1. **Authentication → Settings → Email Templates**

2. Vérifiez que les templates sont configurés (ils le sont par défaut)

3. **Authentication → URL Configuration**
   - Site URL : `http://localhost:3000`
   - Redirect URLs : Ajoutez `http://localhost:3000/**`

### Solution 4 : Désactiver la confirmation d'email (pour dev)

1. **Authentication → Providers → Email**

2. **Décochez "Enable email confirmations"**

3. Cela permet de créer des comptes sans avoir besoin de confirmer l'email

### Solution 5 : Utiliser un Provider OAuth (alternative)

Si l'email ne fonctionne toujours pas, vous pouvez utiliser GitHub ou Google :

1. **Authentication → Providers**
2. Activez **GitHub** ou **Google**
3. Suivez les instructions pour configurer l'OAuth
4. Les utilisateurs pourront se connecter avec leur compte GitHub/Google

## Test rapide

Après avoir configuré l'authentification :

```bash
# Relancer le serveur
npm run dev

# Aller sur la page d'inscription
http://localhost:3000/signup

# Créer un compte
Email: test@welcomebook.be
Password: Test123456!

# Tester la connexion sur /demo
```

## Vérification dans la console

Vous pouvez aussi tester l'inscription via la console du navigateur (F12) :

```javascript
// Ouvrir /demo et ouvrir la console (F12)
const { data, error } = await supabase.auth.signUp({
  email: 'test@welcomebook.be',
  password: 'Test123456!'
})

console.log('Résultat:', data, error)
```

## Configuration recommandée pour le développement

Dans **Authentication → Settings** :

- ✅ Enable Email Provider
- ❌ Disable Email Confirmations (pour dev)
- ✅ Enable Email OTP (optionnel)
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/**`

## Si rien ne fonctionne

Créez un nouveau projet Supabase pour tester. Parfois, les paramètres d'un ancien projet peuvent causer des problèmes.

Ou contactez-moi avec une capture d'écran de l'erreur complète et je vous aiderai !
