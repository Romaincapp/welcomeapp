# Workflows Authentification et Gestion de Compte

## ⚠️ RÈGLE IMPÉRATIVE

Cette section DOIT être mise à jour immédiatement après toute modification des workflows d'authentification, de création de compte, ou de gestion de compte. Ne JAMAIS laisser cette documentation devenir obsolète.

---

## 1. 📝 Création de Compte (Signup)

**Fichiers concernés** :
- [app/signup/page.tsx](app/signup/page.tsx) - Formulaire d'inscription
- [lib/actions/create-welcomebook.ts](lib/actions/create-welcomebook.ts) - Server action de création

### Workflow Étape par Étape

```
1. Utilisateur remplit le formulaire (/signup)
   - Nom du logement (ex: "Villa des Lilas")
   - Email (ex: "contact@exemple.com")
   - Mot de passe (min 6 caractères)
   - Aperçu en temps réel du slug généré

2. Soumission du formulaire → handleSignUp()
   ↓
3. Vérification email avec checkEmailExists()
   - SELECT FROM clients WHERE email = ?
   - Si existe → Erreur "Un compte existe déjà"
   - Si n'existe pas → Continue
   ↓
4. supabase.auth.signUp()
   - Crée l'utilisateur dans auth.users
   - emailRedirectTo: /dashboard/welcome
   ↓
5. Délai de synchronisation (1.5s)
   - Attend que la session soit sync côté serveur
   ↓
6. createWelcomebookServerAction(email, propertyName, userId)
   - Vérifie que propertyName n'est pas vide ✅
   - Génère slug depuis propertyName (PAS l'email !)
   - Vérifie unicité du slug (boucle avec counter si nécessaire)
   - Insère dans clients avec :
     * name: propertyName
     * slug: uniqueSlug
     * email: email
     * user_id: userId
     * background_image: '/backgrounds/default-1.jpg'
     * header_color: '#4F46E5'
     * footer_color: '#1E1B4B'
   ↓
7. Redirection vers /dashboard/welcome
   ↓
8. WelcomeOnboarding s'affiche
```

### Vérifications de Sécurité

- ✅ Email vérifié AVANT auth.signUp()
- ✅ Délai de synchronisation session (1.5s)
- ✅ Vérification d'unicité du slug
- ✅ Validation de propertyName non vide
- ✅ RLS policies : INSERT sur clients nécessite authentification

### Logs de Débogage

- `[SIGNUP]` - Événements du formulaire signup
- `[CHECK EMAIL]` - Vérification d'existence email
- `[CREATE WELCOMEBOOK]` - Processus de création du welcomebook

---

## 2. 🎉 Onboarding (après signup)

**Fichiers concernés** :
- [app/dashboard/welcome/page.tsx](app/dashboard/welcome/page.tsx) - Page serveur
- [components/WelcomeOnboarding.tsx](components/WelcomeOnboarding.tsx) - Composant client
- [components/SmartFillModal.tsx](components/SmartFillModal.tsx) - Modal remplissage intelligent
- [components/BackgroundSelector.tsx](components/BackgroundSelector.tsx) - Sélection de background

### Workflow Étape par Étape

```
1. Page /dashboard/welcome
   - Vérifie authentification
   - Récupère client par email
   - Affiche WelcomeOnboarding
   ↓
2. Étape 1 : Bienvenue + Sélection de Background
   - Message de bienvenue avec nom du logement
   - Affichage de l'URL personnalisée (welcomeapp.be/slug)
   - BackgroundSelector : 8 images de fond disponibles
     * Plage, Montagne, Lac, Forêt, Intérieur, 3 classiques
   - Sauvegarde automatique du background sélectionné
   - Proposition de remplissage intelligent (SmartFillModal)
   - Options :
     * "Lancer le remplissage intelligent" → SmartFillModal
     * "Passer cette étape" → Étape 2 (customize)
   ↓
3. Étape 2 : Customize (si skip Smart Fill)
   - Explication des fonctionnalités de personnalisation
   - Options :
     * "Aller au Dashboard" → /dashboard
     * "Personnaliser mon WelcomeApp" → /${slug}
   ↓
4. Étape 3 : Done (si Smart Fill utilisé)
   - Félicitations + checklist des prochaines étapes
   - Options :
     * "Voir le Dashboard" → /dashboard
     * "Voir mon WelcomeApp" → /${slug}
```

### État Persisté

- `step` : 'welcome' | 'smart-fill' | 'customize' | 'done'
- `hasUsedSmartFill` : boolean (pour personnaliser le message final)
- `selectedBackground` : string (image de fond choisie)

**Note** : L'onboarding est accessible à tout moment via `/dashboard/welcome` tant que le client existe. Il n'y a pas de "flag" de completion - c'est une feature volontaire pour permettre de le rejouer.

---

## 3. 🔑 Connexion (Login)

**Fichiers concernés** :
- [app/login/page.tsx](app/login/page.tsx) - Formulaire de connexion
- [lib/auth/auth-helpers.ts](lib/auth/auth-helpers.ts) - Helpers d'authentification

### Workflow Étape par Étape

```
1. Utilisateur remplit le formulaire (/login)
   - Email
   - Mot de passe
   ↓
2. handleLogin() → supabase.auth.signInWithPassword()
   ↓
3. Si succès → Redirection vers /dashboard
   ↓
4. /dashboard (page serveur)
   - Vérifie authentification
   - Récupère client par email (.single())
   - Si client existe → Affiche DashboardClient
   - Si client N'existe PAS → Redirection vers /dashboard/welcome
     (cas rare : utilisateur Auth créé mais welcomebook jamais créé)
```

### Vérifications de Sécurité

- ✅ Supabase Auth gère l'authentification
- ✅ Session stockée dans cookies sécurisés
- ✅ RLS policies protègent les données

### Cas d'Erreur

- Email/password incorrect → Affiche error.message de Supabase
- Compte non vérifié → Supabase gère automatiquement
- Pas de welcomebook → Redirection vers onboarding

---

## 4. 🔐 Réinitialisation de Mot de Passe (Password Reset)

**Fichiers concernés** :
- [app/forgot-password/page.tsx](app/forgot-password/page.tsx) - Formulaire demande de reset
- [app/reset-password/page.tsx](app/reset-password/page.tsx) - Formulaire nouveau mot de passe
- [app/login/page.tsx](app/login/page.tsx) - Lien "Mot de passe oublié ?"
- [lib/actions/password-reset.ts](lib/actions/password-reset.ts) - Server actions (requestPasswordReset, resetPassword, checkPasswordResetCooldown)
- [emails/templates/PasswordChangedEmail.tsx](emails/templates/PasswordChangedEmail.tsx) - Email de confirmation
- [supabase/migrations/20251111000001_password_reset_rate_limiting.sql](supabase/migrations/20251111000001_password_reset_rate_limiting.sql) - Migration SQL

### Workflow Étape par Étape

```
1. Utilisateur oublie son mot de passe
   - Page /login → Clic sur "Mot de passe oublié ?"
   - Redirection vers /forgot-password
   ↓
2. Formulaire /forgot-password
   - Saisie email
   - Vérification rate limit côté client (checkPasswordResetCooldown)
   - Si cooldown actif → Affiche message "Réessayez dans X minutes"
   ↓
3. Soumission → requestPasswordReset(email)
   - Vérification rate limit SQL (check_password_reset_cooldown)
     * Max 4 tentatives/heure
     * Cooldown 15 minutes entre chaque tentative
     * Si >= 4 tentatives → Blocage 1 heure
   - Log de la tentative (log_password_reset_attempt)
     * Stocke : email + timestamp + IP (optionnel) + user_agent (optionnel)
   - Supabase.auth.resetPasswordForEmail(email, { redirectTo: '/reset-password' })
     * Supabase envoie email avec token OTP sécurisé
     * Email envoyé UNIQUEMENT si l'email existe dans auth.users
   - Retour message générique : "Si un compte existe, un email a été envoyé"
     * Sécurité : pas de différence entre email existant/inexistant (évite énumération)
   ↓
4. Email reçu (Supabase Auth natif)
   - Expéditeur : noreply@mail.app.supabase.io
   - Sujet : "Reset Password" (ou template personnalisé)
   - Contenu : Lien cliquable avec token OTP
   - Expiration : 1 heure (configurable dans dashboard Supabase)
   ↓
5. Clic sur le lien email
   - URL : https://welcomeapp.be/reset-password?access_token=xxx&type=recovery
   - Supabase crée automatiquement une session temporaire
   - L'utilisateur est authentifié via le token OTP
   ↓
6. Page /reset-password
   - Vérification session (supabase.auth.getSession())
     * Si pas de session → Affiche "Lien invalide ou expiré"
     * Si session valide → Affiche formulaire
   - Formulaire 2 champs :
     * Nouveau mot de passe (min 6 chars)
     * Confirmation mot de passe
   - Validation temps réel :
     * Indicateur de force (Faible/Moyen/Fort)
     * Vérification correspondance passwords
   ↓
7. Soumission → resetPassword(newPassword)
   - Vérification session utilisateur (supabase.auth.getUser())
   - Validation mot de passe (min 6 chars)
   - Mise à jour via Supabase.auth.updateUser({ password: newPassword })
   - Envoi email de confirmation (sendPasswordChangedEmail)
     * Template React Email personnalisé (PasswordChangedEmail.tsx)
     * Via Resend (compte dans quota mais ~10 emails/mois)
     * Warning : "Si ce n'est pas vous, contactez-nous"
   ↓
8. Succès
   - Message "Mot de passe modifié !"
   - Redirection automatique vers /dashboard après 3 secondes
   - Utilisateur reste authentifié (session créée par le token OTP)
```

### Rate Limiting Détaillé

**Fonction SQL : `check_password_reset_cooldown(p_email TEXT)`**

Stratégie à deux niveaux :

1. **Cooldown 15 minutes** (entre tentatives successives)
   ```
   Tentative 1 : ✅ Autorisée
   Tentative 2 : ❌ Bloquée 15 minutes
   Tentative 3 : ❌ Bloquée 15 minutes
   Tentative 4 : ❌ Bloquée 15 minutes
   ```

2. **Blocage 1 heure** (après 4 tentatives)
   ```
   Si >= 4 tentatives dans la dernière heure :
   → Blocage total de 1 heure depuis la dernière tentative
   ```

**Cleanup automatique** :
- Entrées > 24h supprimées automatiquement
- Fonction `cleanup_password_reset_attempts()`

**UX du rate limiting** :
```typescript
// Message affiché à l'utilisateur
"Trop de tentatives. Veuillez réessayer dans 15 minutes."
"Trop de tentatives. Veuillez réessayer dans 47 minutes." // Si 4ème tentative
```

### Sécurité

✅ **Token OTP sécurisé**
- Généré et géré par Supabase Auth
- One-time use (ne peut être utilisé qu'une fois)
- Expiration automatique après 1 heure
- Hashing côté serveur

✅ **Protection énumération d'emails**
- Message générique ("Si un compte existe...")
- Pas de différence email existant vs inexistant
- Même temps de réponse (pas de timing attack)

✅ **Rate limiting strict**
- Max 4 tentatives/heure par email
- Cooldown 15 minutes entre tentatives
- Logging de toutes les tentatives (audit trail)

✅ **Email de confirmation**
- Notification après changement de mot de passe
- Warning si modification non autorisée
- Lien direct vers /forgot-password pour re-sécuriser

✅ **Validation mot de passe**
- Minimum 6 caractères (règle Supabase par défaut)
- Indicateur de force temps réel (Faible/Moyen/Fort)
- Vérification doublon (nouveau === confirmation)

### Cas d'Erreur

**Email inexistant** :
- Comportement : Message générique "Si un compte existe..."
- Sécurité : Aucun email envoyé (mais utilisateur ne le sait pas)
- Logging : Tentative enregistrée quand même (pour rate limiting)

**Token expiré (> 1h)** :
- Page /reset-password affiche : "Lien invalide ou expiré"
- Bouton : "Demander un nouveau lien" → /forgot-password

**Token déjà utilisé** :
- Supabase bloque automatiquement (one-time use)
- Même message : "Lien invalide ou expiré"

**Trop de tentatives** :
- Message : "Trop de tentatives. Réessayez dans X minutes"
- Compteur temps restant affiché
- Info : "Protection anti-abus : Maximum 4 tentatives par heure"

**Session invalide sur /reset-password** :
- Cause : Cookies bloqués, lien manipulé, ou session expirée
- Message : "Session invalide. Veuillez redemander un lien"

### Vérifications de Sécurité

- ✅ Rate limiting SQL strict (4 tentatives/heure)
- ✅ Messages génériques (pas d'énumération d'emails)
- ✅ Tokens OTP gérés par Supabase (sécurité maximale)
- ✅ Logging de toutes les tentatives (audit trail)
- ✅ Email de confirmation après changement
- ✅ HTTPS obligatoire (redirect URLs en HTTPS en production)
- ✅ Cleanup automatique des logs après 24h

### Configuration Requise

**Supabase Auth Dashboard** :
1. Authentication → URL Configuration → Redirect URLs
   - Ajouter : `https://welcomeapp.be/reset-password` (production)
   - Ajouter : `http://localhost:3000/reset-password` (dev)

2. Authentication → Email Templates → Reset Password
   - Option A : Template par défaut Supabase (gratuit, pas de branding)
   - Option B : Template HTML personnalisé (voir [docs/setup-password-reset.md](docs/setup-password-reset.md))

**Variables d'environnement** :
```bash
NEXT_PUBLIC_SITE_URL=https://welcomeapp.be  # Production
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Dev local
RESEND_API_KEY=re_xxx                       # Pour email de confirmation
```

### Logs de Débogage

- `[PASSWORD RESET]` - Toutes les opérations de reset
- Logs SQL automatiques (table `password_reset_attempts`)
- Vue `password_reset_stats` pour analytics admin

### Documentation Complète

Voir [docs/setup-password-reset.md](docs/setup-password-reset.md) pour :
- Guide de configuration Supabase pas-à-pas
- Template HTML personnalisé
- Tests complets du workflow
- Dépannage
- Sécurité RGPD

---

## 5. 🗑️ Suppression de Compte

**Fichiers concernés** :
- [lib/actions/reset.ts](lib/actions/reset.ts) - `deleteAccount()`
- [components/DashboardClient.tsx](components/DashboardClient.tsx) - Bouton de suppression
- [components/DeleteConfirmDialog.tsx](components/DeleteConfirmDialog.tsx) - Dialog de confirmation

### Workflow Étape par Étape

```
1. Dashboard → Bouton "Supprimer mon compte" → DeleteConfirmDialog
   ↓
2. Confirmation utilisateur → deleteAccount()
   ↓
3. Vérification authentification
   - supabase.auth.getUser()
   - Si pas authentifié → Error('Non authentifié')
   ↓
4. Récupération du client
   - SELECT id, slug FROM clients WHERE email = user.email
   - Si pas trouvé → Continue quand même (cas rare)
   ↓
5. Suppression des fichiers storage
   - deleteClientStorageFiles(supabase, client.id, client.slug)
   - Liste tous les fichiers dans slug/
   - Supprime en batch avec .remove(filePaths)
   ↓
6. Suppression du client en DB
   - DELETE FROM clients WHERE id = client.id
   - CASCADE automatique vers :
     * tips (et leurs tip_media)
     * secure_sections
     * footer_buttons
   ↓
7. Déconnexion
   - supabase.auth.signOut()
   ↓
8. Redirection vers page d'accueil
```

### ⚠️ LIMITATION CRITIQUE

L'utilisateur Auth (auth.users) N'EST PAS supprimé car cela nécessite la `service_role_key` qui ne doit JAMAIS être exposée côté client. L'utilisateur Auth reste dans la base mais ne peut plus se connecter car son welcomebook est supprimé.

### Solution Future Possible

- Créer un webhook Supabase qui supprime l'utilisateur Auth via service_role
- OU Créer une Edge Function avec permissions admin
- OU Accepter cette limitation et documenter clairement

### Vérifications de Sécurité

- ✅ Vérifie que l'utilisateur est authentifié
- ✅ Vérifie que le client appartient à l'utilisateur (email match)
- ✅ Supprime TOUS les fichiers storage (aucun orphelin)
- ✅ Cascade DB automatique via ON DELETE CASCADE

### Logs de Débogage

- `[DELETE]` - Toutes les étapes de la suppression
- `[STORAGE]` - Opérations sur le storage

---

## 6. 🔄 Reset Welcomebook (sans supprimer le compte)

**Fichiers concernés** :
- [lib/actions/reset.ts](lib/actions/reset.ts) - `resetWelcomebook()`
- [components/DashboardClient.tsx](components/DashboardClient.tsx) - Bouton "Réinitialiser"

### Workflow Étape par Étape

```
1. Dashboard → Bouton "Réinitialiser le welcomebook"
   ↓
2. Confirmation utilisateur → resetWelcomebook(clientId)
   ↓
3. Vérification authentification et ownership
   - Récupère client par ID
   - Vérifie que client.email === user.email
   ↓
4. Suppression des fichiers storage
   - deleteClientStorageFiles(supabase, clientId, client.slug)
   - Même logique que deleteAccount()
   ↓
5. Suppression des données en DB
   - DELETE FROM tips WHERE client_id = clientId
     (cascade automatique vers tip_media)
   - DELETE FROM secure_sections WHERE client_id = clientId
   ↓
6. Réinitialisation du client
   - UPDATE clients SET :
     * background_image = '/backgrounds/default-1.jpg'
     * header_color = '#4F46E5'
     * footer_color = '#1E1B4B'
     * header_subtitle = 'Bienvenue dans votre guide personnalisé'
     * ad_iframe_url = NULL
   ↓
7. Revalidation du cache
   - revalidatePath('/dashboard')
```

### Différence avec deleteAccount()

- ✅ Garde le compte utilisateur ET le client en DB
- ✅ Garde l'email et le slug
- ✅ Réinitialise uniquement le contenu (tips, media, secure_section, personnalisation)
- ✅ L'utilisateur reste connecté

### Use Case

Gestionnaire veut repartir de zéro avec le même slug et le même compte, sans perdre son authentification.

---

## 7. 🔍 Vérifications et Redirections (Guards)

**Fichiers concernés** :
- [app/dashboard/page.tsx](app/dashboard/page.tsx)
- [app/dashboard/welcome/page.tsx](app/dashboard/welcome/page.tsx)

### Logique de Redirection

```typescript
// app/dashboard/page.tsx
1. Vérifie authentification
   - Si pas de user → redirect('/login')

2. Vérifie existence du welcomebook
   - SELECT * FROM clients WHERE email = user.email
   - Si pas de client → redirect('/dashboard/welcome')
   - Si client existe → Affiche dashboard

// app/dashboard/welcome/page.tsx
1. Vérifie authentification
   - Si pas de user → redirect('/login')

2. Vérifie existence du welcomebook
   - SELECT * FROM clients WHERE email = user.email
   - Si pas de client → redirect('/dashboard')
     (cas rare : devrait avoir été créé lors du signup)
   - Si client existe → Affiche WelcomeOnboarding
```

### Ordre de Priorité

1. Authentification (sinon → /login)
2. Existence welcomebook (sinon → /dashboard/welcome)
3. Accès au contenu

---

## 8. 📋 Checklist de Maintenance

### Avant CHAQUE modification des workflows

- [ ] Lire cette section complète
- [ ] Comprendre l'impact sur les autres workflows
- [ ] Vérifier les vérifications de sécurité existantes

### Après CHAQUE modification des workflows

- [ ] Mettre à jour ce fichier immédiatement
- [ ] Vérifier que `npm run build` passe sans erreur
- [ ] Tester manuellement le workflow modifié
- [ ] Tester les workflows adjacents (ex: si modification signup, tester aussi login)
- [ ] Vérifier les logs de débogage
- [ ] Mettre à jour README.md si nécessaire

### Tests Critiques à Effectuer Régulièrement

1. Signup complet → Vérifier slug correct + onboarding affiché
2. Login → Vérifier redirection dashboard ou welcome selon cas
3. Suppression compte → Vérifier storage vide + déconnexion
4. Reset welcomebook → Vérifier données supprimées mais compte gardé
5. Vérifier qu'aucun fichier orphelin ne reste dans storage

---

## 9. ⚠️ Règles Importantes

1. **TOUJOURS utiliser `.maybeSingle()` au lieu de `.single()`** (évite erreurs si aucun résultat)
2. **Vérifier que `user.email === email`** dans les server actions
3. **Pattern idempotent** : Rendre les server actions idempotentes (même résultat si appelées plusieurs fois)
4. **Délai de synchronisation** : Toujours attendre 1.5s après `auth.signUp()` avant d'appeler server actions
5. **Tester en navigation privée** : Vérifier les RLS policies avec utilisateur anonyme
6. **Double vérification email** : Toujours vérifier avec `checkEmailExists()` AVANT `auth.signUp()`
7. **Ne JAMAIS supprimer uniquement dans Auth** : Utiliser trigger ou script pour nettoyer `clients` ET storage
