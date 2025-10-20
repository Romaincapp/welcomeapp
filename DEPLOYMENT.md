# Guide de Déploiement Vercel

## Problème rencontré

Erreur à la fin du déploiement :
```
An unexpected error happened when running this build.
```

Cette erreur apparaît après le build (qui réussit) lors du déploiement des outputs (~5min de timeout).

## Solutions implémentées

### 1. Configuration Vercel optimisée (`vercel.json`)

- **Région européenne** : `fra1` pour réduire la latence
- **Timeout API** : 30s pour les routes `/api/places/*`
- **Variables d'environnement** : Utilisation de secrets Vercel

### 2. Optimisations Next.js (`next.config.js`)

- Compression activée
- Formats d'image modernes (AVIF, WebP)
- Headers de sécurité
- ETags activés

### 3. `.vercelignore` créé

Exclusion des fichiers inutiles du déploiement.

## Étapes de déploiement

### 1. Vérifier les variables d'environnement dans Vercel

Dashboard Vercel > Settings > Environment Variables :

```
NEXT_PUBLIC_SUPABASE_URL=https://nimbzitahumdefggtiob.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<votre_clé>
SUPABASE_SERVICE_ROLE_KEY=<votre_clé>
GOOGLE_PLACES_API_KEY=<votre_clé>
```

⚠️ **Important** : Cocher "Production", "Preview" et "Development" pour chaque variable.

### 2. Redéployer

```bash
git add .
git commit -m "fix: optimisation déploiement Vercel"
git push
```

Ou via le dashboard Vercel : **Deployments** > bouton **"Redeploy"** sur le dernier déploiement.

### 3. Si l'erreur persiste

#### Option A : Redéployer depuis le dashboard
1. Aller dans **Deployments**
2. Cliquer sur les **3 points** du dernier déploiement
3. Sélectionner **"Redeploy"**
4. Décocher "Use existing build cache"

#### Option B : Contacter le support Vercel
Le message "We have been notified" signifie que Vercel est au courant. Vérifier :
- [Vercel Status](https://www.vercel-status.com/)
- [Support Vercel](https://vercel.com/help)

#### Option C : Vérifier les limites du plan
- **Hobby Plan** : 100GB bandwidth, 100GB-Hours compute
- **Pro Plan** : 1TB bandwidth, 1000GB-Hours compute

Si vous dépassez, upgrade nécessaire ou attendre le reset mensuel.

## Optimisations supplémentaires (si le problème persiste)

### 1. Réduire la taille du build

```bash
# Analyser la taille des bundles
npm install -D @next/bundle-analyzer
```

Ajouter dans `next.config.js` :
```js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)
```

Puis :
```bash
ANALYZE=true npm run build
```

### 2. Split code par route

Déjà activé par défaut avec Next.js 14 App Router.

### 3. Réduire les dépendances

Vérifier les grosses librairies :
```bash
npm install -D webpack-bundle-analyzer
```

## Alternatives si Vercel ne fonctionne pas

1. **Netlify** - Très similaire à Vercel
2. **Railway** - Support PostgreSQL natif
3. **Render** - Gratuit pour les static sites
4. **Cloudflare Pages** - CDN ultra-rapide

## Notes

- Le build **réussit** localement et sur Vercel
- L'erreur se produit pendant le **déploiement des outputs**
- Timeout de ~5 minutes suggère un problème réseau/région
- Configuration `vercel.json` devrait résoudre le problème

## Support

Si le problème persiste après avoir essayé toutes les solutions :
1. Vérifier [Vercel Status](https://www.vercel-status.com/)
2. Contacter [Vercel Support](https://vercel.com/help)
3. Poster sur [Vercel Community](https://github.com/vercel/vercel/discussions)
