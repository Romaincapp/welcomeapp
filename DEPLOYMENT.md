# Guide de Déploiement Vercel - WelcomeApp

## Prérequis
- Un compte Vercel (gratuit sur [vercel.com](https://vercel.com))
- Un projet Supabase configuré (ID: nimbzitahumdefggtiob)
- Un repository GitHub avec votre code

## Étapes de Déploiement

### 1. Préparer le Repository GitHub

```bash
# Ajouter le fichier .env.example au repository
git add .env.example
git commit -m "Add environment variables template"
git push origin main
```

**⚠️ IMPORTANT** : Vérifiez que `.env.local` n'est PAS dans votre commit (il doit être dans .gitignore)

### 2. Déployer sur Vercel

#### Option A: Via l'interface Vercel (Recommandé)

1. Allez sur [vercel.com](https://vercel.com) et connectez-vous
2. Cliquez sur **"Add New Project"**
3. Importez votre repository GitHub `Romaincapp/welcomeapp`
4. Vercel détectera automatiquement Next.js
5. **Ne cliquez pas encore sur Deploy !**

#### Option B: Via CLI Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel
```

### 3. Configurer les Variables d'Environnement sur Vercel

**IMPORTANT** : Avant de déployer, ajoutez ces variables d'environnement :

1. Dans Vercel, allez dans **Project Settings → Environment Variables**
2. Ajoutez les 3 variables suivantes :

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://nimbzitahumdefggtiob.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development |

> Les valeurs exactes sont dans votre fichier `.env.local` (ne partagez jamais ces clés publiquement)

3. Cliquez sur **Save**

### 4. Déployer l'Application

1. Retournez sur l'onglet **Deployments**
2. Cliquez sur **Deploy** ou **Redeploy** si déjà déployé
3. Attendez 1-2 minutes que le build se termine

### 5. Configuration du Domaine (Optionnel)

#### Pour utiliser welcomebook.be :

1. Dans Vercel, allez dans **Settings → Domains**
2. Ajoutez votre domaine : `welcomebook.be`
3. Configurez les DNS chez votre registrar :
   ```
   Type: A
   Name: @
   Value: 76.76.21.21 (IP de Vercel)

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

#### Pour les URLs dynamiques (`welcomebook.be/[slug]`) :

Les routes dynamiques fonctionneront automatiquement une fois le domaine configuré !

### 6. Vérification Post-Déploiement

Testez ces URLs :
- `https://your-app.vercel.app` (page d'accueil)
- `https://your-app.vercel.app/login` (page de connexion)
- `https://your-app.vercel.app/signup` (page d'inscription)
- `https://your-app.vercel.app/dashboard` (tableau de bord)

### 7. Configuration Supabase (RLS)

Assurez-vous que les Row Level Security (RLS) policies sont activées :

```sql
-- Vérifier dans Supabase Dashboard → Database → Policies
-- Les tables suivantes doivent avoir des policies :
- clients (lecture publique, écriture propriétaire uniquement)
- tips (lecture publique, écriture propriétaire uniquement)
- categories (lecture publique)
- tip_media (lecture publique, écriture propriétaire uniquement)
```

## Mise à Jour de l'Application

Pour déployer des modifications :

```bash
git add .
git commit -m "Description des changements"
git push origin main
```

Vercel redéploiera automatiquement à chaque push sur `main` !

## URLs de l'Application

- **Production** : `https://your-app.vercel.app` (ou votre domaine personnalisé)
- **Dashboard Vercel** : [vercel.com/dashboard](https://vercel.com/dashboard)
- **Supabase Dashboard** : [supabase.com/dashboard/project/nimbzitahumdefggtiob](https://supabase.com/dashboard/project/nimbzitahumdefggtiob)

## Dépannage

### Erreur de Build
- Vérifiez les logs dans Vercel Dashboard → Deployments → Logs
- Assurez-vous que toutes les variables d'environnement sont configurées

### Erreur Supabase
- Vérifiez que les URLs et clés sont correctes
- Vérifiez les policies RLS dans Supabase

### Erreur 404 sur les routes dynamiques
- Vérifiez que le fichier `app/[slug]/page.tsx` existe
- Vérifiez les logs de déploiement

## Support

- Documentation Vercel : [vercel.com/docs](https://vercel.com/docs)
- Documentation Next.js : [nextjs.org/docs](https://nextjs.org/docs)
- Documentation Supabase : [supabase.com/docs](https://supabase.com/docs)
