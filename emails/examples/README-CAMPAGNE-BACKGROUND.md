# 🎨 Campagne Email : Éditeur d'Arrière-plans v2

Guide rapide pour envoyer l'email d'annonce de la nouvelle fonctionnalité.

---

## 📧 Template Créé

**Fichier** : `emails/templates/BackgroundEditorAnnouncement.tsx`

**Type** : Email d'annonce de fonctionnalité
**Cible** : Tous les gestionnaires actifs
**Objectif** : 40% d'adoption de la feature en 7 jours

---

## 🚀 Comment Envoyer la Campagne

### Option 1 : Via Dashboard Admin (Recommandé)

1. **Connectez-vous** : [https://welcomeapp.be/admin/campaigns](https://welcomeapp.be/admin/campaigns)

2. **Créez une nouvelle campagne** :
   - Nom : `Lancement Éditeur Arrière-plans v2`
   - Template : `BackgroundEditorAnnouncement`

3. **Configurez les sujets A/B** :
   - **Variante A** : `🎨 Nouveau : Créez des fonds parfaits en 30 secondes`
   - **Variante B** : `✨ Recadrage, galerie et effets Instagram pour vos arrière-plans`

4. **Sélectionnez l'audience** :
   - Tous les gestionnaires actifs
   - Optionnel : Filtrer ceux qui n'ont pas modifié leur fond depuis 30j

5. **Activez l'A/B Testing** :
   - Split : 50/50
   - Métrique gagnante : `open_rate`

6. **Planifiez l'envoi** :
   - Jour : Mardi ou Jeudi
   - Heure : 9h-11h (meilleur taux d'ouverture)

7. **Cliquez "Envoyer"** 🚀

---

### Option 2 : Via API (Pour les développeurs)

```bash
curl -X POST https://welcomeapp.be/api/admin/send-campaign \
  -H "Content-Type: application/json" \
  -d '{
    "campaignName": "Lancement Éditeur Arrière-plans v2",
    "template": "BackgroundEditorAnnouncement",
    "subjectA": "🎨 Nouveau : Créez des fonds parfaits en 30 secondes",
    "subjectB": "✨ Recadrage, galerie et effets Instagram pour vos arrière-plans",
    "abTestEnabled": true,
    "audienceFilter": {
      "status": "active"
    }
  }'
```

---

## 📊 KPIs à Surveiller

| Métrique | Objectif | Comment suivre |
|----------|----------|----------------|
| **Open Rate** | > 35% | Dashboard Analytics → Campaigns |
| **Click Rate** | > 8% | Bouton "Essayer maintenant" |
| **Adoption Feature** | > 40% en 7j | Dashboard Admin → Feature Usage |
| **Feedbacks** | Surveiller | Réponses à l'email |

---

## 📅 Timeline Suggérée

### Jour J (Mardi 10h)
- ✅ Envoyer la campagne
- ✅ Publier sur réseaux sociaux (optionnel)
- ✅ Surveiller taux d'ouverture initial

### J+1 (Mercredi)
- ✅ Analyser stats (open/click rate)
- ✅ Lire feedbacks utilisateurs
- ✅ Corriger bugs signalés

### J+3 (Vendredi)
- ✅ Relancer ceux qui n'ont pas ouvert
- ✅ Analyser taux d'adoption feature

### J+7 (Mardi suivant)
- ✅ Bilan final campagne
- ✅ Compiler retours
- ✅ Planifier V3 basée sur feedbacks

---

## 📝 Contenu de l'Email

### Structure
1. **Badge "NOUVEAU"** (vert)
2. **Titre** : 🎨 Personnalisez vos arrière-plans comme un pro
3. **Introduction** : Présentation de la refonte
4. **3 Nouveautés phares** :
   - ✂️ Recadrage Intelligent (6 ratios)
   - 🖼️ Galerie de Fonds Pros (8 images)
   - 🎬 Effets Instagram-Style (carousel)
5. **4 Bénéfices** :
   - Gain de temps (30 sec)
   - Économie stockage (~70%)
   - Rendu professionnel
   - Zéro compétence design
6. **CTA** : "Essayer maintenant" → Dashboard
7. **Guide 5 étapes** : Comment utiliser
8. **Astuces Pro** : Tips pour réussir
9. **Feedback** : Encourager les retours
10. **P.S.** : Gratuit et dispo immédiatement

---

## 🎯 Segments d'Audience

### Actifs (Priorité 1)
- **Critère** : Ajouté un tip dans les 30j
- **Open rate attendu** : 40-45%
- **Action** : Envoi standard

### Endormis (Priorité 2)
- **Critère** : Inactifs depuis 60j+
- **Open rate attendu** : 20-25%
- **Action** : Sujet plus accrocheur

### Nouveaux (Priorité 3)
- **Critère** : Inscrits < 14j
- **Open rate attendu** : 45-50%
- **Action** : Ajouter contexte d'accès

---

## ✍️ Sujets Alternatifs (Inspiration)

Si vous voulez tester d'autres sujets :

- `🎨 Vos arrière-plans méritent mieux (et c'est gratuit)`
- `✨ Recadrez comme un pro en 3 clics`
- `📸 8 fonds pros + crop intelligent = WelcomeApp parfait`
- `🚀 L'éditeur d'arrière-plans que vous attendiez`
- `💎 Transformez vos fonds en 30 secondes (sans Photoshop)`

---

## 🔧 Paramètres d'Envoi

```typescript
// Props du template BackgroundEditorAnnouncement
{
  managerName: string;        // Nom du gestionnaire
  managerEmail: string;       // Email du gestionnaire
  unsubscribeToken?: string;  // Token de désabonnement (auto-généré)
}
```

---

## 📈 Analyse Post-Campagne

### Métriques Resend
- **Sent** : Nombre d'emails envoyés
- **Delivered** : Taux de délivrabilité
- **Opened** : Taux d'ouverture
- **Clicked** : Clics sur "Essayer maintenant"
- **Bounced** : Rebonds (surveiller < 2%)
- **Complained** : Plaintes spam (surveiller < 0.1%)

### Métriques Feature
- **Dashboard Admin** → Feature Usage
- Combien ont utilisé le crop ?
- Combien ont sélectionné un fond prédéfini ?
- Effets les plus populaires ?

---

## ❓ FAQ

**Q : Combien de gestionnaires vont recevoir l'email ?**
R : Dépend du filtre audience. Tous les actifs = ~100% de la base.

**Q : Quel est le coût d'envoi ?**
R : Resend Free tier = 3000 emails/mois. Si dépassé, prévoir upgrade.

**Q : Comment analyser les résultats A/B ?**
R : Dashboard Admin → Campaigns → Voir "AB Test Comparison"

**Q : Puis-je relancer ceux qui n'ont pas ouvert ?**
R : Oui, J+3, avec un sujet différent (ex: "Vous avez manqué ça...")

**Q : Et si je veux tester en local avant d'envoyer ?**
R : Dashboard Admin → Preview Mode → Entrez votre email de test

---

## 🎉 Checklist Avant Envoi

- [ ] Template vérifié dans Preview Mode
- [ ] Sujets A/B finalisés
- [ ] Audience filtrée correctement
- [ ] A/B Testing activé (50/50, open_rate)
- [ ] Jour/Heure optimale planifiée (Mardi/Jeudi 9-11h)
- [ ] KPIs définis (open > 35%, click > 8%)
- [ ] Timeline de suivi notée (J+1, J+3, J+7)
- [ ] Équipe avertie pour gérer les feedbacks

---

**Prêt à envoyer ? C'est parti ! 🚀**
