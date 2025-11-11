# 🔐 Configuration du Système de Réinitialisation de Mot de Passe

Guide complet pour configurer le système "Mot de passe oublié" dans Supabase Auth.

---

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Configuration Supabase Auth Dashboard](#configuration-supabase-auth-dashboard)
3. [Personnalisation du Template Email](#personnalisation-du-template-email)
4. [Test du Workflow](#test-du-workflow)
5. [Dépannage](#dépannage)
6. [Sécurité](#sécurité)

---

## 🎯 Prérequis

Avant de commencer, assurez-vous que :

- ✅ Vous avez accès au [Supabase Dashboard](https://supabase.com/dashboard)
- ✅ Vous connaissez le Project ID de votre projet WelcomeApp
- ✅ La migration SQL `20251111000001_password_reset_rate_limiting.sql` a été appliquée
- ✅ Les variables d'environnement sont configurées :
  - `NEXT_PUBLIC_SITE_URL=https://welcomeapp.be` (production)
  - `NEXT_PUBLIC_SITE_URL=http://localhost:3000` (développement local)

---

## ⚙️ Configuration Supabase Auth Dashboard

### Étape 1 : Accéder aux Paramètres d'Authentification

1. Connectez-vous au [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet **WelcomeApp**
3. Dans le menu latéral gauche, cliquez sur **Authentication** (icône 🔐)
4. Cliquez sur l'onglet **URL Configuration**

### Étape 2 : Configurer la Redirect URL

Dans la section **Redirect URLs**, ajoutez les URLs suivantes :

#### URL de Production
```
https://welcomeapp.be/reset-password
```

#### URL de Développement (optionnel)
```
http://localhost:3000/reset-password
```

**Important** :
- Cliquez sur le bouton **"Add URL"** pour chaque URL
- Les URLs doivent être **identiques** à celles configurées dans `requestPasswordReset()` (fichier `lib/actions/password-reset.ts`)
- Supabase redirigera automatiquement vers cette URL après que l'utilisateur clique sur le lien dans l'email

### Étape 3 : Vérifier les Paramètres Email

1. Toujours dans **Authentication**, cliquez sur l'onglet **Email Templates**
2. Dans le menu déroulant, sélectionnez **"Reset Password"**

Vous devriez voir le template par défaut de Supabase. **Deux options s'offrent à vous :**

#### Option A : Utiliser le Template Supabase par Défaut (Recommandé)

**Avantages** :
- ✅ Gratuit (ne compte pas dans le quota Resend)
- ✅ Fonctionne immédiatement
- ✅ Sécurisé (tokens OTP gérés par Supabase)

**Inconvénient** :
- ❌ Design basique (pas de branding WelcomeApp)

**Action** : Aucune modification nécessaire. Passez à l'étape 4.

#### Option B : Personnaliser le Template (Branding WelcomeApp)

**Avantages** :
- ✅ Design cohérent avec votre branding
- ✅ Meilleure UX pour vos utilisateurs

**Inconvénient** :
- ❌ Nécessite de cocher "Confirm email" (peut ralentir le workflow)

**Action** : Voir section [Personnalisation du Template Email](#personnalisation-du-template-email) ci-dessous.

### Étape 4 : Vérifier les Rate Limits (Optionnel)

1. Cliquez sur l'onglet **Rate Limits** (sous Authentication)
2. Vérifiez les limites suivantes :

| Action | Limite par défaut | Recommandation WelcomeApp |
|--------|-------------------|---------------------------|
| **Password Recovery** | 30 requêtes/heure | ✅ OK (notre rate limit SQL est plus strict : 4/heure) |
| **Email Signup** | 30 requêtes/heure | ✅ OK |
| **Token Refresh** | 30 requêtes/heure | ✅ OK |

**Note** : Notre système de rate limiting SQL (fonction `check_password_reset_cooldown`) est **plus strict** que celui de Supabase (4 tentatives/heure vs 30/heure). Cela garantit une meilleure protection contre les abus.

### Étape 5 : Sauvegarder les Modifications

1. En bas de chaque section modifiée, cliquez sur **"Save"**
2. Attendez la confirmation **"Settings updated successfully"**

---

## 🎨 Personnalisation du Template Email

Si vous avez choisi l'**Option B** (template personnalisé), suivez ces étapes :

### Template HTML Personnalisé

1. Dans **Authentication > Email Templates > Reset Password**
2. Activez **"Use custom template"**
3. Collez le code HTML suivant dans l'éditeur :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation de mot de passe - WelcomeApp</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Container principal -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

          <!-- Header avec logo -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); border-radius: 12px 12px 0 0;">
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0;">
                🔐 Réinitialisation de mot de passe
              </h1>
            </td>
          </tr>

          <!-- Corps de l'email -->
          <tr>
            <td style="padding: 40px;">

              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Bonjour,
              </p>

              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Vous avez demandé à réinitialiser votre mot de passe <strong>WelcomeApp</strong>.
              </p>

              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe. <strong>Ce lien est valide pendant 1 heure.</strong>
              </p>

              <!-- Bouton CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="{{ .ConfirmationURL }}"
                       style="display: inline-block; background-color: #4F46E5; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.3);">
                      Réinitialiser mon mot de passe
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Lien texte (fallback) -->
              <p style="color: #9ca3af; font-size: 14px; line-height: 1.5; margin: 20px 0 0; text-align: center;">
                Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :
                <br>
                <a href="{{ .ConfirmationURL }}" style="color: #4F46E5; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>

            </td>
          </tr>

          <!-- Section sécurité -->
          <tr>
            <td style="padding: 0 40px 40px; border-top: 1px solid #e5e7eb;">

              <div style="background-color: #fef2f2; border: 2px solid #fca5a5; border-radius: 8px; padding: 20px; margin-top: 30px;">
                <p style="color: #dc2626; font-size: 14px; font-weight: 600; margin: 0 0 8px;">
                  ⚠️ Vous n'avez pas demandé cette réinitialisation ?
                </p>
                <p style="color: #991b1b; font-size: 13px; line-height: 1.5; margin: 0;">
                  Ignorez cet email en toute sécurité. Aucune modification ne sera apportée à votre compte tant que vous ne cliquez pas sur le lien ci-dessus.
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0 0 8px;">
                Cet email a été envoyé par <strong>WelcomeApp</strong>
                <br>
                La plateforme de guides personnalisés pour locations de vacances
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0;">
                <a href="https://welcomeapp.be" style="color: #4F46E5; text-decoration: none;">welcomeapp.be</a>
                ·
                <a href="mailto:contact@welcomeapp.be" style="color: #4F46E5; text-decoration: none;">contact@welcomeapp.be</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

### Variables Supabase Disponibles

Le template ci-dessus utilise la variable **`{{ .ConfirmationURL }}`** qui est automatiquement remplacée par Supabase par le lien sécurisé de réinitialisation.

**Variables disponibles** :
- `{{ .ConfirmationURL }}` - URL complète avec token OTP (ex: `https://welcomeapp.be/reset-password?token=xxx`)
- `{{ .Token }}` - Token OTP brut (rarement utilisé directement)
- `{{ .Email }}` - Email de l'utilisateur
- `{{ .SiteURL }}` - URL de base du site

### Sauvegarde

1. Cliquez sur **"Save"** en bas de la page
2. Testez le template en cliquant sur **"Send test email"**

---

## ✅ Test du Workflow

### Test Complet (Production ou Staging)

1. **Demander un reset de mot de passe**
   ```
   URL : https://welcomeapp.be/forgot-password
   Action : Saisir un email existant dans la base de données
   Résultat attendu : Message "Email envoyé !" + email reçu dans la boîte de réception
   ```

2. **Vérifier l'email reçu**
   ```
   Expéditeur : noreply@mail.app.supabase.io (ou noreply@welcomeapp.be si SMTP custom)
   Sujet : "Reset Password" ou "Réinitialisation de mot de passe"
   Contenu : Bouton "Réinitialiser mon mot de passe" cliquable
   ```

3. **Cliquer sur le lien**
   ```
   URL cible : https://welcomeapp.be/reset-password?access_token=xxx
   Résultat attendu : Redirection vers la page avec formulaire de nouveau mot de passe
   ```

4. **Saisir le nouveau mot de passe**
   ```
   Champs : "Nouveau mot de passe" (min 6 chars) + "Confirmer"
   Validation : Indicateur de force (Faible/Moyen/Fort)
   Résultat attendu : Message "Mot de passe modifié !" + email de confirmation envoyé
   ```

5. **Vérifier l'email de confirmation**
   ```
   Expéditeur : WelcomeApp <hello@welcomeapp.be>
   Sujet : "Votre mot de passe a été modifié"
   Template : PasswordChangedEmail.tsx (React Email)
   ```

6. **Se connecter avec le nouveau mot de passe**
   ```
   URL : https://welcomeapp.be/login
   Action : Saisir email + nouveau mot de passe
   Résultat attendu : Connexion réussie + redirection vers /dashboard
   ```

### Test du Rate Limiting

1. **Tester 5 tentatives successives**
   ```bash
   # Saisir le même email 5 fois de suite sur /forgot-password
   # Tentative 1 : ✅ Succès
   # Tentative 2 : ✅ Succès (cooldown 15 min)
   # Tentative 3 : ✅ Succès (cooldown 15 min)
   # Tentative 4 : ✅ Succès (cooldown 15 min)
   # Tentative 5 : ❌ Erreur "Trop de tentatives. Réessayez dans X minutes."
   ```

2. **Vérifier le message d'erreur**
   ```
   Message attendu : "Trop de tentatives. Veuillez réessayer dans X minute(s)."
   Rate limiting : Protection anti-abus affichée
   ```

3. **Attendre 1 heure et réessayer**
   ```
   Après 60 minutes : Nouvelle tentative autorisée
   ```

### Test du Lien Expiré

1. **Demander un reset**
2. **Attendre 1 heure + 5 minutes** (délai d'expiration Supabase par défaut : 1h)
3. **Cliquer sur le lien**
   ```
   Résultat attendu : Page d'erreur "Lien invalide ou expiré"
   Bouton : "Demander un nouveau lien"
   ```

### Test avec Email Inexistant

1. **Saisir un email qui n'existe pas** (ex: `test-inexistant-12345@welcomeapp.be`)
2. **Soumettre le formulaire**
   ```
   Résultat attendu : Message générique "Si un compte existe, un email a été envoyé"
   Sécurité : Aucune information révélée sur l'existence ou non de l'email
   Comportement : Aucun email envoyé (mais l'utilisateur ne le sait pas)
   ```

---

## 🔧 Dépannage

### Problème 1 : "Redirect URL not allowed"

**Symptôme** : Erreur après avoir cliqué sur le lien de reset
```
Error: redirect_url_not_allowed
```

**Solution** :
1. Vérifier que l'URL est bien ajoutée dans **Authentication > URL Configuration > Redirect URLs**
2. Vérifier que l'URL est **identique** à celle dans `requestPasswordReset()` :
   ```typescript
   redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`
   ```
3. Redémarrer le serveur Next.js après modification des variables d'environnement

### Problème 2 : Aucun email reçu

**Causes possibles** :
1. **Email dans les spams** : Vérifier le dossier spam/junk
2. **Email inexistant** : L'email n'existe pas dans `auth.users` (comportement normal : message générique affiché)
3. **Quota Supabase dépassé** : Vérifier le dashboard Supabase > Settings > Usage
4. **SMTP non configuré** : Si custom SMTP, vérifier les credentials

**Solution** :
```sql
-- Vérifier si l'email existe dans auth.users
SELECT email, created_at
FROM auth.users
WHERE email = 'test@example.com';

-- Vérifier les logs de reset
SELECT email, attempted_at, COUNT(*)
FROM password_reset_attempts
WHERE email = 'test@example.com'
GROUP BY email, attempted_at
ORDER BY attempted_at DESC;
```

### Problème 3 : "Session invalide ou expirée"

**Symptôme** : Message d'erreur sur la page `/reset-password`

**Causes** :
1. Lien déjà utilisé (token OTP one-time use)
2. Token expiré (> 1 heure)
3. Cookies bloqués par le navigateur

**Solution** :
1. Demander un nouveau lien via `/forgot-password`
2. Activer les cookies dans le navigateur (Third-party cookies pour Supabase)
3. Tester en navigation privée

### Problème 4 : Rate limiting trop strict

**Symptôme** : Blocage après 1 seule tentative

**Cause** : Horloge serveur incorrecte ou bug dans la fonction SQL

**Solution** :
```sql
-- Nettoyer manuellement les tentatives pour un email
DELETE FROM password_reset_attempts
WHERE email = 'test@example.com';

-- Vérifier la fonction de cooldown
SELECT * FROM check_password_reset_cooldown('test@example.com');
```

### Problème 5 : Build TypeScript échoue

**Symptôme** : Erreur `Property 'PasswordResetResult' does not exist`

**Solution** :
1. Vérifier que les types sont bien exportés dans `types/index.ts`
2. Redémarrer le serveur TypeScript : `Ctrl+Shift+P` > "TypeScript: Restart TS Server"
3. Exécuter `npm run build` pour vérifier

---

## 🔒 Sécurité

### Bonnes Pratiques Implémentées

✅ **Rate limiting SQL strict**
- Maximum 4 tentatives par heure
- Cooldown de 15 minutes entre chaque tentative
- Blocage automatique après 4 tentatives pendant 1 heure

✅ **Messages génériques**
- Aucune information révélée sur l'existence d'un email
- Message identique pour email existant ou inexistant

✅ **Tokens OTP sécurisés**
- Gérés par Supabase Auth (one-time use)
- Expiration automatique après 1 heure
- Hashing côté serveur

✅ **Logging des tentatives**
- Table `password_reset_attempts` : email + timestamp + IP
- Audit trail pour détecter les abus
- Cleanup automatique après 24 heures

✅ **Email de confirmation**
- Notification après changement de mot de passe
- Warning : "Si ce n'est pas vous, contactez-nous"
- Lien direct vers `/forgot-password`

✅ **Protection HTTPS**
- Redirect URLs en HTTPS uniquement en production
- Cookies httpOnly + secure
- CSP headers Next.js

### Vecteurs d'Attaque Couverts

| Attaque | Protection |
|---------|-----------|
| **Bruteforce** | Rate limiting 4/heure + cooldown 15 min |
| **Énumération d'emails** | Messages génériques (pas de différence email existant/inexistant) |
| **Replay attack** | Tokens OTP one-time use (Supabase) |
| **Token stealing** | Expiration 1 heure + HTTPS obligatoire |
| **Account takeover** | Email de confirmation + ownership check |
| **DDoS email** | Rate limiting Supabase (30 req/h) + rate limiting SQL (4 req/h) |

### Conformité RGPD

✅ **Données collectées** :
- Email (nécessaire pour l'authentification)
- IP address (optionnel, pour sécurité)
- User agent (optionnel, pour sécurité)

✅ **Durée de conservation** :
- Tokens de reset : 1 heure (expiration automatique)
- Logs de tentatives : 24 heures (cleanup automatique)

✅ **Droit à l'oubli** :
- Suppression automatique des logs après 24h
- Fonction `deleteAccount()` supprime toutes les données utilisateur

---

## 📚 Ressources Complémentaires

### Documentation Officielle

- [Supabase Auth - Password Reset](https://supabase.com/docs/guides/auth/passwords#password-reset)
- [Supabase Auth - Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Next.js - Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [React Email - Documentation](https://react.email/docs/introduction)

### Fichiers du Projet

- Migration SQL : `supabase/migrations/20251111000001_password_reset_rate_limiting.sql`
- Server Actions : `lib/actions/password-reset.ts`
- Page Forgot Password : `app/forgot-password/page.tsx`
- Page Reset Password : `app/reset-password/page.tsx`
- Template Email : `emails/templates/PasswordChangedEmail.tsx`
- Workflows Auth : `.claude/workflows-auth.md`

### Support

**Questions ou problèmes ?**
- Email : contact@welcomeapp.be
- GitHub Issues : [anthropics/claude-code/issues](https://github.com/anthropics/claude-code/issues)

---

✅ **Configuration terminée !** Votre système de réinitialisation de mot de passe est maintenant opérationnel et sécurisé.
