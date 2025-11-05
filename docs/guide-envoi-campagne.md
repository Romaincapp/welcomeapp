# 📧 Guide Rapide : Envoyer votre première campagne email

## 🎯 Étape par étape

### 1️⃣ Accéder à l'interface

```
http://localhost:3001/admin/campaigns
```

Ou depuis le dashboard admin:
1. Allez sur http://localhost:3001/admin
2. Cliquez sur le bouton "📧 Campagnes Email" en haut à droite

---

### 2️⃣ Choisir un template

Cliquez sur l'une des 5 cartes:

| Template | Emoji | Usage idéal |
|----------|-------|-------------|
| **Bienvenue** | 👋 | Nouveaux gestionnaires (J+0) |
| **Réactivation** | 🔄 | Gestionnaires inactifs (>30 jours) |
| **Nouvelle fonctionnalité** | ✨ | Annonce de features (ex: QR Designer) |
| **Newsletter** | 📰 | Newsletter mensuelle/bimensuelle |
| **Rappel conseils** | 💡 | Gestionnaires avec <10 tips |

Le sujet est **pré-rempli automatiquement** selon le template.

---

### 3️⃣ Personnaliser le sujet (optionnel)

Modifiez le champ "Sujet de l'email" si vous voulez personnaliser.

**Exemples de bons sujets:**
- ✅ "🎉 Bienvenue chez WelcomeApp, [Prénom] !"
- ✅ "Nouveauté: Créez vos QR codes en 2 clics"
- ✅ "Ça fait un moment ! Découvrez les nouveautés"
- ❌ "Newsletter" (trop générique)
- ❌ "PROMOTION!!!" (spam-like)

---

### 4️⃣ Sélectionner un segment

Cliquez sur l'une des 6 cartes de segment:

```
👥 Tous les gestionnaires    (3 destinataires)
😴 Inactifs (0 tips)          (1 destinataire)
🌱 Débutants (1-5 tips)       (1 destinataire)
📈 Intermédiaires (6-15 tips) (1 destinataire)
🚀 Avancés (16-30 tips)       (0 destinataire)
⭐ Experts (>30 tips)         (0 destinataire)
```

Le **nombre de destinataires** se met à jour en temps réel.

---

### 5️⃣ Envoyer un email de test

**Recommandé avant d'envoyer à tous !**

1. Cliquez sur "📧 Envoyer un test"
2. Attendez 2-3 secondes
3. Vérifiez votre boîte mail (romainfrancedumoulin@gmail.com)

**Ce que vous devez vérifier:**
- ✅ Le sujet est correct
- ✅ Le template s'affiche bien
- ✅ Les données sont personnalisées (nom, email, slug)
- ✅ Les liens fonctionnent
- ✅ L'email n'est pas dans les spams

⚠️ **Le test est envoyé uniquement à vous** (pas aux gestionnaires).

---

### 6️⃣ Envoyer la vraie campagne

Une fois le test validé:

1. Vérifiez le segment et le nombre de destinataires
2. Cliquez sur "🚀 Envoyer à X destinataire(s)"
3. Confirmez dans la popup de sécurité
4. Attendez la confirmation

**Durée d'envoi:**
- 1-10 emails: <10 secondes
- 11-50 emails: ~30 secondes
- 51-100 emails: ~1 minute
- 101-500 emails: ~5 minutes

Les emails sont envoyés par **batch de 10 toutes les 6 secondes** (rate limiting Resend).

---

### 7️⃣ Vérifier les résultats

Une fois l'envoi terminé, un message de confirmation s'affiche:

```
✅ Campagne envoyée ! 42 email(s) envoyé(s), 0 échec(s)
```

**L'historique se met à jour automatiquement** en bas de la page.

Vous pouvez voir:
- ✅ Nombre d'emails envoyés
- ❌ Nombre d'échecs
- 📅 Date et heure d'envoi
- 📧 Template utilisé
- 👥 Segment ciblé

---

## 🎨 Exemples de campagnes

### **Campagne 1: Bienvenue**

**Quand:** Dès qu'un gestionnaire s'inscrit

**Template:** Bienvenue 👋
**Sujet:** "Bienvenue sur WelcomeApp ! Créez votre premier conseil en 2 minutes"
**Segment:** Tous les gestionnaires (ou Inactifs si nouveaux)

**Objectif:** Onboarding, inciter à créer le 1er tip

---

### **Campagne 2: Annonce QR Designer**

**Quand:** Nouvelle fonctionnalité lancée (ex: QR Designer A4)

**Template:** Nouvelle fonctionnalité ✨
**Sujet:** "🎨 Nouveau: Créez des QR codes imprimables en A4"
**Segment:** Tous les gestionnaires

**Objectif:** Adoption de la nouvelle feature

---

### **Campagne 3: Newsletter mensuelle**

**Quand:** 1x par mois (ex: le 1er du mois)

**Template:** Newsletter 📰
**Sujet:** "Newsletter WelcomeApp - Novembre 2025"
**Segment:** Tous les gestionnaires

**Objectif:** Engagement communauté, partage stats plateforme

---

### **Campagne 4: Relance inactifs**

**Quand:** Gestionnaires avec 0 tips depuis >30 jours

**Template:** Réactivation 🔄
**Sujet:** "Ça fait un moment ! Découvrez toutes les nouveautés"
**Segment:** Inactifs (0 tips)

**Objectif:** Réactiver les churned users

---

### **Campagne 5: Rappel ajout conseils**

**Quand:** Gestionnaires avec <10 tips

**Template:** Rappel conseils 💡
**Sujet:** "Enrichissez votre WelcomeBook: 5 idées de conseils à ajouter"
**Segment:** Débutants (1-5 tips) + Intermédiaires (6-15 tips)

**Objectif:** Augmenter l'engagement, complétion profil

---

## 🚨 Erreurs courantes

### **"Aucun destinataire pour ce segment"**

**Cause:** Le segment sélectionné est vide (ex: Experts avec >30 tips, mais personne n'a >30 tips).

**Solution:** Sélectionnez un segment avec au moins 1 destinataire.

---

### **"Erreur lors de l'envoi"**

**Causes possibles:**
1. Resend API Key invalide ou expirée
2. Limite quotidienne Resend atteinte (100 emails/jour gratuit)
3. Problème de connexion internet

**Solution:** Vérifiez les logs serveur dans la console.

---

### **Email dans les spams**

**Causes:**
1. Domaine `welcomeapp.be` pas encore bien "réchauffé"
2. Premier envoi à ce destinataire
3. Sujet ou contenu trop "marketing"

**Solutions:**
- Demandez aux destinataires de marquer comme "Non spam"
- Évitez les mots spam ("GRATUIT", "PROMO", "!!!")
- Envoyez régulièrement (consistance = confiance)
- Utilisez Resend warm-up (plan payant)

---

## 📊 Bonnes pratiques

### **Fréquence d'envoi**

- ✅ **Newsletter:** 1x/mois ou 2x/mois max
- ✅ **Annonces features:** Quand nouvelle feature (max 1x/semaine)
- ✅ **Bienvenue:** Immédiat (J+0)
- ✅ **Réactivation:** 1x tous les 30-60 jours pour inactifs
- ❌ **Éviter:** >3 emails/semaine (fatigue email)

---

### **Timing optimal**

**Meilleurs jours:** Mardi, Mercredi, Jeudi
**Meilleurs horaires:** 10h-11h ou 14h-15h (heure locale)

**Éviter:**
- Lundis matin (boîte mail surchargée)
- Vendredis après-midi (déconnexion weekend)
- Week-ends (taux d'ouverture faible)

---

### **A/B Testing (manuel pour l'instant)**

Testez 2 sujets différents:

**Test 1:**
- 50% reçoivent: "Bienvenue sur WelcomeApp !"
- 50% reçoivent: "🎉 Votre WelcomeBook vous attend !"

Comparez les taux d'ouverture (Phase 5).

---

### **Segmentation intelligente**

Au lieu d'envoyer à "Tous les gestionnaires":

1. **Nouveaux (<7 jours):** Email bienvenue + onboarding
2. **Actifs récents:** Newsletter + nouvelles features
3. **Inactifs (>30 jours):** Réactivation
4. **Power users (>30 tips):** Features avancées

---

## 🔗 Ressources

- **Documentation complète:** [docs/email-marketing-phase-3-summary.md](./email-marketing-phase-3-summary.md)
- **Resend Dashboard:** https://resend.com/emails
- **Resend Docs:** https://resend.com/docs
- **React Email Docs:** https://react.email/docs

---

## 💡 Prochaines améliorations (Phases 4-5)

**Phase 4: Automations**
- Séquence de bienvenue automatique (J+0, J+3, J+7)
- Relance inactifs automatique tous les 30 jours
- Configurables depuis `/admin/automations`

**Phase 5: Analytics & A/B Testing**
- Taux d'ouverture par campagne
- Taux de clic par template
- A/B testing automatisé sur sujets
- Dashboard analytics dédié

---

**Besoin d'aide?** Consultez le fichier `email-marketing-phase-3-summary.md` pour plus de détails techniques.

Bonne campagne ! 🚀
