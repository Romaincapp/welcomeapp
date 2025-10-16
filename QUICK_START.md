# Quick Start - WelcomeBook

## Démarrage rapide

### 1. L'application est déjà lancée ! 🎉

Votre serveur de développement tourne sur **http://localhost:3001**

### 2. Configuration Supabase (1 minute)

Pour activer l'authentification et l'édition, exécutez ce SQL dans Supabase :

1. Allez sur https://supabase.com/dashboard/project/nimbzitahumdefggtiob
2. Cliquez sur **SQL Editor** dans le menu de gauche
3. Copiez-collez le contenu de `supabase/setup_auth_policies.sql`
4. Cliquez sur **Run** ▶️

C'est tout ! Les permissions sont configurées.

### 3. Testez l'application

#### A. Créer un compte
```
1. Ouvrez http://localhost:3001/signup
2. Entrez un email (ex: test@welcomebook.be)
3. Entrez un mot de passe (min 6 caractères)
4. Cliquez sur "Créer mon compte"
```

#### B. Se connecter
```
1. Ouvrez http://localhost:3001/login
2. Entrez vos identifiants
3. Vous êtes connecté !
```

#### C. Éditer le welcomebook demo
```
1. Ouvrez http://localhost:3001/demo
2. Cliquez sur "Mode édition" en haut à droite
3. Testez les fonctionnalités :
   - Cliquez sur le bouton "+" pour ajouter un conseil
   - Cliquez sur "Éditer" sur une card
   - Cliquez sur "Supprimer" sur une card
   - Cliquez sur "Paramètres" pour changer les couleurs
```

## Fonctionnalités disponibles

### Mode visiteur (déconnecté)
- ✅ Consulter les welcomebooks
- ✅ Voir les conseils par catégorie
- ✅ Ouvrir les détails d'un conseil (modale)
- ✅ Carte interactive avec marqueurs

### Mode gestionnaire (connecté)
- ✅ Activer le mode édition
- ✅ Ajouter un nouveau conseil
- ✅ Modifier un conseil existant
- ✅ Supprimer un conseil
- ✅ Uploader des images (vers Supabase Storage)
- ✅ Ajouter des URLs d'images
- ✅ Personnaliser les couleurs du header/footer
- ✅ Changer l'arrière-plan

## Structure du projet

```
welcomeapp/
├── app/
│   ├── page.tsx                    # Page d'accueil
│   ├── login/page.tsx              # Page de connexion
│   ├── signup/page.tsx             # Page d'inscription
│   └── [slug]/                     # Pages dynamiques des welcomebooks
│       ├── page.tsx                # Server Component (fetch data)
│       └── WelcomeBookClient.tsx   # Client Component (UI)
│
├── components/
│   ├── AuthButton.tsx              # Bouton login/logout
│   ├── Header.tsx                  # En-tête avec auth
│   ├── AddTipModal.tsx             # Modale d'ajout
│   ├── EditTipModal.tsx            # Modale d'édition
│   ├── DeleteConfirmDialog.tsx     # Confirmation suppression
│   └── ...
│
├── hooks/
│   └── useDevAuth.ts               # Hook d'authentification
│
├── lib/supabase/
│   ├── client.ts                   # Client Supabase (browser)
│   └── server.ts                   # Client Supabase (server)
│
└── supabase/
    └── setup_auth_policies.sql     # Script de configuration
```

## Que faire maintenant ?

### Option 1 : Tester l'édition
- Créez un compte et testez toutes les fonctionnalités d'édition

### Option 2 : Créer votre propre welcomebook
```sql
-- Dans Supabase SQL Editor
INSERT INTO clients (name, slug, email)
VALUES ('Ma Location', 'ma-location', 'moi@email.com');
```
Puis allez sur http://localhost:3001/ma-location

### Option 3 : Personnaliser le design
- Modifiez les couleurs dans `tailwind.config.ts`
- Ajoutez vos propres composants dans `components/`

### Option 4 : Déployer en production
```bash
# 1. Commit vos changements
git add .
git commit -m "Add auth system"

# 2. Déployer sur Vercel
vercel deploy
```

## Problèmes courants

### "Les modifications ne fonctionnent pas"
➡️ Vérifiez que vous avez exécuté le script SQL `setup_auth_policies.sql`

### "Je ne peux pas uploader d'images"
➡️ Vérifiez que le bucket "media" existe et est public dans Supabase Storage

### "L'authentification ne fonctionne pas"
➡️ Vérifiez que l'Email Provider est activé dans Supabase Auth

## Ressources

- [Documentation complète](./GUIDE_AUTH.md)
- [Architecture du projet](./ARCHITECTURE.md)
- [Supabase Dashboard](https://supabase.com/dashboard/project/nimbzitahumdefggtiob)

## Support

Besoin d'aide ? Consultez :
- Le fichier `GUIDE_AUTH.md` pour plus de détails
- La documentation Supabase : https://supabase.com/docs
- La documentation Next.js : https://nextjs.org/docs
