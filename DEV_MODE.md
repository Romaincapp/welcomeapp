# Mode Développement - Authentification Simplifiée

## 🚀 Test rapide du mode édition (SANS Supabase Auth)

Comme Supabase Auth pose des problèmes de configuration, j'ai créé un mode développement simplifié qui fonctionne immédiatement !

### Comment tester maintenant :

1. **Lancez l'app** (si ce n'est pas déjà fait) :
   ```bash
   npm run dev
   ```

2. **Visitez** : http://localhost:3000/demo

3. **Cliquez sur "Connexion gestionnaire"** (en haut à droite)

4. **Entrez le mot de passe de développement** :
   ```
   admin123
   ```

5. **Cliquez sur "Mode édition"** → Le bouton devient bleu !

6. **Vous voyez maintenant** :
   - ✅ Boutons "Éditer" sur toutes les cards
   - ✅ Bouton flottant "+" en bas à droite

## ⚙️ Comment ça fonctionne

Le mode développement utilise `localStorage` pour simuler l'authentification :
- Pas besoin de Supabase Auth configuré
- Pas besoin de créer d'utilisateur
- Fonctionne immédiatement

### Fichiers ajoutés :

- `components/DevLoginModal.tsx` - Modal de connexion simplifiée
- `hooks/useDevAuth.ts` - Hook d'authentification locale
- Le mot de passe est stocké dans localStorage

## 🔄 Basculer vers Supabase Auth plus tard

Quand vous aurez configuré Supabase Auth correctement :

1. Dans `WelcomeBookClient.tsx`, remplacez :
   ```tsx
   import DevLoginModal from '@/components/DevLoginModal'
   import { useDevAuth } from '@/hooks/useDevAuth'
   ```

   Par :
   ```tsx
   import LoginModal from '@/components/LoginModal'
   import { useAuth } from '@/components/AuthProvider'
   ```

2. Remplacez :
   ```tsx
   const { user, login } = useDevAuth()
   ```

   Par :
   ```tsx
   const { user } = useAuth()
   ```

3. Remplacez :
   ```tsx
   <DevLoginModal ... />
   ```

   Par :
   ```tsx
   <LoginModal ... />
   ```

## 📋 Prochaines étapes

Maintenant que l'authentification fonctionne, on peut continuer avec :

1. ✅ Mode édition activé
2. ⏭️ Formulaire d'ajout/édition de conseils
3. ⏭️ Upload d'images
4. ⏭️ Édition du header/footer

## 🐛 Si le mode édition ne s'active pas

1. Ouvrez la console du navigateur (F12)
2. Tapez : `localStorage.clear()`
3. Rafraîchissez la page
4. Reconnectez-vous avec `admin123`

## ⚠️ Note de sécurité

Ce mode développement est **uniquement pour le développement local**.
Ne le déployez JAMAIS en production !

Pour la production, vous devrez :
- Configurer correctement Supabase Auth
- Ou utiliser un autre système d'authentification
- Implémenter des permissions appropriées (RLS)
