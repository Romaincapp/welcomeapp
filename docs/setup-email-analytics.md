# Guide de Configuration - Email Marketing Analytics

Ce guide explique comment configurer le système complet d'analytics pour les campagnes email marketing.

---

## 📋 Prérequis

- ✅ Compte Resend actif ([resend.com](https://resend.com))
- ✅ Application déployée sur `https://welcomeapp.be`
- ✅ Accès au dashboard Resend
- ✅ Accès aux variables d'environnement de production (Vercel)

---

## ⚙️ Étape 1 : Appliquer la Migration SQL

La migration SQL doit être appliquée à votre base de données Supabase pour créer les index et fonctions nécessaires.

### Via Supabase Dashboard

1. Ouvrez **Supabase Dashboard** → **SQL Editor**
2. Exécutez le fichier `supabase/migrations/20251116000001_email_events_tracking.sql`
3. Vérifiez qu'il n'y a pas d'erreurs

### Via CLI Supabase

```bash
supabase migration up
```

---

## 🔗 Étape 2 : Configurer le Webhook Resend

### 2.1 Créer le Webhook

1. Connectez-vous à [Resend Dashboard](https://resend.com/dashboard)
2. Allez dans **Settings** → **Webhooks**
3. Cliquez sur **Add Webhook**

### 2.2 Configuration du Webhook

**URL du webhook** :
```
https://welcomeapp.be/api/webhooks/resend
```

**Événements à sélectionner** :
- ✅ `email.sent` - Email envoyé depuis Resend
- ✅ `email.delivered` - Email délivré au serveur destinataire
- ✅ `email.opened` - Email ouvert par le destinataire
- ✅ `email.clicked` - Lien cliqué dans l'email
- ✅ `email.bounced` - Email rejeté (hard/soft bounce)
- ✅ `email.complained` - Marqué comme spam
- ✅ `email.delivery_delayed` - Délivrance retardée (optionnel)

**⚠️ Important** : Sélectionnez TOUS les événements pour un tracking complet.

### 2.3 Copier le Signing Secret

1. Après création du webhook, Resend affiche un **Signing Secret**
2. **Copiez-le** (format : `whsec_xxxxxxxxxxxxx`)
3. Vous en aurez besoin pour l'étape 3

---

## 🔐 Étape 3 : Ajouter la Variable d'Environnement

### Via Vercel Dashboard

1. Ouvrez **Vercel Dashboard** → Votre projet **WelcomeApp**
2. Allez dans **Settings** → **Environment Variables**
3. Cliquez sur **Add New**
4. Ajoutez la variable suivante :

**Name** :
```
RESEND_WEBHOOK_SECRET
```

**Value** :
```
whsec_xxxxxxxxxxxxx
```
*(Remplacez par votre signing secret copié à l'étape 2.3)*

**Environments** : Cochez **Production**

5. Cliquez sur **Save**

### Redéployer l'Application

Après ajout de la variable d'environnement :
1. Allez dans **Deployments**
2. Cliquez sur **Redeploy** sur le dernier déploiement
3. Attendez la fin du déploiement (~2 min)

---

## ✅ Étape 4 : Tester le Webhook

### 4.1 Test avec Resend

1. Retournez dans **Resend Dashboard** → **Webhooks**
2. Cliquez sur votre webhook
3. Cliquez sur **Send Test Event**
4. Sélectionnez `email.sent` ou `email.opened`
5. Cliquez sur **Send**

### 4.2 Vérifier les Logs Vercel

1. Ouvrez **Vercel Dashboard** → **Deployments** → **Functions**
2. Cherchez `/api/webhooks/resend`
3. Vérifiez que vous voyez des logs comme :
   ```
   [Resend Webhook] Événement reçu: email.sent pour xxx
   [Resend Webhook] Événement email.sent enregistré avec succès
   ```

### 4.3 Vérifier Supabase

1. Ouvrez **Supabase Dashboard** → **Table Editor**
2. Allez dans la table `email_events`
3. Vérifiez qu'il y a une nouvelle ligne avec le test event

**Si vous voyez la ligne → ✅ Configuration réussie !**

---

## 📧 Étape 5 : Envoyer une Campagne Test

### 5.1 Créer une Campagne Test

1. Connectez-vous à WelcomeApp en tant qu'admin
2. Allez dans `/admin/campaigns`
3. Créez une campagne avec :
   - **Template** : Welcome
   - **Sujet** : "Test Analytics - Ne pas supprimer"
   - **Segment** : All
   - **Mode Test** : ✅ ON (envoie uniquement à votre email admin)
4. Cliquez sur **Envoyer la Campagne**

### 5.2 Vérifier les Événements

1. Attendez 1-2 minutes
2. Ouvrez l'email reçu dans votre boîte mail
3. Cliquez sur un lien dans l'email
4. Retournez dans `/admin/campaigns`
5. Cliquez sur la campagne test
6. Vérifiez les métriques :
   - ✅ **Envoyés** : 1
   - ✅ **Délivrés** : 1 (après quelques secondes)
   - ✅ **Ouverts** : 1 (après ouverture de l'email)
   - ✅ **Clics** : 1 (après clic sur un lien)

**Si toutes les métriques s'incrémentent → ✅ Système 100% opérationnel !**

---

## 🔍 Étape 6 : Vérifier la Timeline des Événements

1. Dans `/admin/campaigns`, cliquez sur une campagne
2. Scrollez jusqu'à la section **Timeline des Événements**
3. Vous devriez voir :
   - 📧 **Envoyé** (sent)
   - ✅ **Délivré** (delivered)
   - 👁️ **Ouvert** (opened)
   - 🖱️ **Cliqué** (clicked)

Avec timestamps relatifs ("il y a 2 min", "il y a 1h", etc.)

---

## 🐛 Troubleshooting

### ❌ Problème : "Signature webhook invalide"

**Cause** : Le `RESEND_WEBHOOK_SECRET` n'est pas correct ou manquant

**Solution** :
1. Vérifiez que la variable d'environnement est bien configurée dans Vercel
2. Vérifiez qu'il n'y a pas d'espaces avant/après le secret
3. Redéployez l'application après modification

### ❌ Problème : Aucun événement dans `email_events`

**Causes possibles** :
1. Webhook non configuré dans Resend Dashboard
2. URL webhook incorrecte
3. Migration SQL non appliquée

**Solution** :
1. Vérifiez l'URL du webhook : `https://welcomeapp.be/api/webhooks/resend`
2. Testez le webhook avec "Send Test Event" dans Resend
3. Vérifiez les logs Vercel pour voir les erreurs

### ❌ Problème : Métriques à 0% malgré événements

**Cause** : Les vues SQL `campaign_analytics` ne trouvent pas les données

**Solution** :
1. Vérifiez que `email_events.campaign_id` est bien rempli
2. Ouvrez Supabase → SQL Editor
3. Exécutez :
   ```sql
   SELECT * FROM campaign_analytics LIMIT 10;
   ```
4. Si vide, vérifiez que le `campaign_id` est bien passé lors de l'envoi

### ❌ Problème : "campaign_id introuvable" dans les logs webhook

**Cause** : Le webhook reçoit des événements pour des emails qui ne sont pas des campagnes marketing

**Solution** :
- C'est normal ! Les emails transactionnels (welcome email au signup, password reset) n'ont pas de `campaign_id`
- Le webhook insère quand même l'événement avec `campaign_id: null`
- Seuls les emails envoyés via `/admin/campaigns` ont un `campaign_id`

---

## 📊 Utilisation du Dashboard Analytics

### Vue d'Ensemble des Campagnes (`/admin/campaigns`)

**Métriques affichées pour chaque campagne** :
- **Envoyés** : Nombre total d'emails envoyés
- **Délivrés** : Emails arrivés au serveur destinataire (%)
- **Ouverts** : Emails ouverts par les destinataires (%)
- **Clics** : Clics sur les liens dans l'email (%)
- **Rejets** : Bounces (hard/soft)
- **Plaintes** : Marqués comme spam

### Timeline des Événements

Cliquez sur une campagne pour voir la timeline complète :
- Icônes colorées par type d'événement
- Timestamps relatifs ("il y a 2h")
- Email du destinataire
- Détails supplémentaires (lien cliqué, raison du bounce, etc.)

### A/B Testing

Pour les campagnes A/B :
- Comparaison côte à côte des variantes A et B
- Open rate et click rate par variante
- Winner automatique (variante avec meilleur open rate)

---

## 🎯 Cas d'Usage

### 1. Optimiser les Sujets d'Emails

1. Créez une campagne A/B avec 2 sujets différents
2. Attendez 24h
3. Regardez quelle variante a le meilleur open rate
4. Utilisez ce style de sujet pour vos prochaines campagnes

### 2. Identifier les Problèmes de Délivrabilité

Si le **delivery rate < 95%** :
- Vérifiez les bounces dans la timeline
- Si hard bounces : nettoyez votre liste d'emails
- Si soft bounces : réessayez plus tard

Si le **complaint rate > 0.1%** :
- Vérifiez le contenu de l'email (pas de spam)
- Ajoutez un lien d'unsubscribe visible
- Ciblez mieux votre segment

### 3. Améliorer l'Engagement

Si le **open rate < 20%** :
- Testez des sujets plus accrocheurs
- Envoyez à des heures différentes
- Segmentez mieux votre audience

Si le **click rate < 2%** :
- Améliorez vos CTAs (call-to-action)
- Vérifiez que les liens fonctionnent
- Rendez le contenu plus actionnable

---

## ✅ Checklist de Configuration

- [ ] Migration SQL appliquée
- [ ] Webhook Resend créé avec URL correcte
- [ ] Tous les événements sélectionnés dans Resend
- [ ] `RESEND_WEBHOOK_SECRET` configuré dans Vercel
- [ ] Application redéployée
- [ ] Test webhook réussi (Send Test Event)
- [ ] Ligne visible dans `email_events`
- [ ] Campagne test envoyée
- [ ] Métriques visibles dans `/admin/campaigns`
- [ ] Timeline des événements fonctionne

---

## 🆘 Support

Si vous rencontrez des problèmes malgré ce guide :

1. **Vérifiez les logs Vercel** :
   - Allez dans Functions → `/api/webhooks/resend`
   - Cherchez les messages d'erreur

2. **Vérifiez les logs Supabase** :
   - Table Editor → `email_events`
   - Vérifiez qu'il y a des lignes

3. **Testez le webhook manuellement** :
   ```bash
   curl -X GET https://welcomeapp.be/api/webhooks/resend
   ```
   Devrait retourner : `{"status":"ok",...}`

4. **Contactez le support** :
   - GitHub Issues : [github.com/Romaincapp/welcomeapp/issues](https://github.com/Romaincapp/welcomeapp/issues)

---

## 🔮 Prochaines Évolutions

Fonctionnalités prévues dans les prochaines versions :

- [ ] **Dashboard Analytics Avancés** : Page `/admin/campaigns/analytics` avec graphiques Recharts
- [ ] **Segmentation Dynamique** : Filtres avancés par comportement email
- [ ] **Automatisation Avancée** : Triggers basés sur événements (ex: relance si email non ouvert après 3j)
- [ ] **Export CSV** : Export des événements pour analyse externe
- [ ] **Notifications** : Alertes si complaint rate > seuil

---

**Configuration terminée !** 🎉

Vos campagnes email sont maintenant trackées en temps réel avec des analytics complets.
