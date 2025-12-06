# Configuration Google Ads - Tracking des Conversions

Ce guide explique comment configurer le tracking des conversions Google Ads pour WelcomeApp.

## Objectif

Tracker les **leads** (création de welcomebook réussie) comme conversion dans Google Ads.
La conversion est déclenchée quand un utilisateur arrive sur `/dashboard/welcome` après avoir créé son compte.

## Étape 1 : Créer une action de conversion dans Google Ads

1. Connectez-vous à [Google Ads](https://ads.google.com)
2. Allez dans **Outils et paramètres** → **Mesure** → **Conversions**
3. Cliquez sur **+ Nouvelle action de conversion**
4. Sélectionnez **Site web**
5. Configurez :
   - **Catégorie** : Lead / Inscription
   - **Nom** : "Création WelcomeApp" (ou similaire)
   - **Valeur** : Laissez vide ou mettez une valeur estimée du lead
   - **Comptabilisation** : Une (pour éviter les doublons)
   - **Fenêtre de conversion** : 30 jours (recommandé)
   - **Modèle d'attribution** : Basé sur les données ou Dernier clic
6. Cliquez sur **Créer et continuer**

## Étape 2 : Récupérer les IDs

Après avoir créé l'action de conversion, Google Ads vous donne un code comme celui-ci :

```html
<!-- Event snippet for Création WelcomeApp conversion page -->
<script>
  gtag('event', 'conversion', {'send_to': 'AW-XXXXXXXXX/YYYYYYYYYYYYYYYY'});
</script>
```

Notez :
- **GOOGLE_ADS_ID** : `AW-XXXXXXXXX` (la partie avant le `/`)
- **CONVERSION_LABEL** : `YYYYYYYYYYYYYYYY` (la partie après le `/`)

## Étape 3 : Configurer les variables d'environnement

Ajoutez ces variables dans votre fichier `.env.local` (développement) et dans Vercel (production) :

```env
# Google Ads - Tracking des conversions
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL=YYYYYYYYYYYYYYYY

# (Optionnel) Google Analytics 4 - Si vous voulez aussi du tracking analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Ajouter dans Vercel

1. Allez dans les **Settings** de votre projet Vercel
2. **Environment Variables**
3. Ajoutez les 2 variables (ou 3 si GA4) avec leurs valeurs
4. Redéployez le projet

## Étape 4 : Tester le tracking

### En développement

1. Ajoutez les variables dans `.env.local`
2. Redémarrez le serveur (`npm run dev`)
3. Créez un nouveau compte test
4. Ouvrez la console du navigateur (F12)
5. Vérifiez les logs `[GoogleAds] Envoi conversion:`

### En production

1. Créez un compte test sur welcomeapp.be
2. Dans Google Ads, allez dans **Outils** → **Conversions**
3. Attendez quelques heures (le tracking peut prendre du temps à apparaître)
4. Utilisez **Google Tag Assistant** (extension Chrome) pour vérifier en temps réel

## Étape 5 : Vérifier dans Google Ads

1. Allez dans **Outils et paramètres** → **Conversions**
2. Votre conversion devrait passer de "Non vérifiée" à "Enregistre des conversions"
3. Cela peut prendre jusqu'à 24-48h après la première conversion réelle

## Architecture technique

```
app/layout.tsx
    └── GoogleTagManager.tsx (charge gtag.js)

app/dashboard/welcome/page.tsx
    └── WelcomeOnboarding.tsx
            └── GoogleAdsConversionTracker (déclenche la conversion)
```

### Composants créés

| Fichier | Description |
|---------|-------------|
| `components/GoogleTagManager.tsx` | Charge les scripts Google (gtag.js) |
| `hooks/useGoogleAdsConversion.ts` | Hook + composant pour déclencher les conversions |

### Déduplication

Le système utilise un `transactionId` unique basé sur l'email et le timestamp pour éviter les conversions en double si l'utilisateur rafraîchit la page.

## Troubleshooting

### La conversion ne s'affiche pas

1. Vérifiez que les variables d'environnement sont bien définies
2. Vérifiez la console du navigateur pour les logs `[GoogleAds]`
3. Utilisez Google Tag Assistant pour voir si gtag est chargé
4. Attendez 24-48h (délai normal de Google)

### Erreur "gtag non disponible"

Le script gtag.js n'est pas encore chargé. Vérifiez :
- Les variables d'environnement sont bien `NEXT_PUBLIC_*`
- Le composant `GoogleTagManager` est dans le layout

### Double conversion

Le système a une protection contre les doublons (ref + transactionId). Si vous voyez quand même des doublons :
- Vérifiez que "Comptabilisation" = "Une" dans Google Ads
- Le cookie utilisateur a peut-être été effacé entre les visites

## Ressources

- [Documentation Google Ads Conversion Tracking](https://support.google.com/google-ads/answer/6095821)
- [Google Tag Assistant](https://tagassistant.google.com/)
- [Next.js Script Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/scripts)
