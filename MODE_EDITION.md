# Guide du Mode Édition

## 🚀 Démarrage rapide

### 1. Créer un utilisateur test

**Via l'interface Supabase** (recommandé) :

1. Allez dans votre [Dashboard Supabase](https://supabase.com/dashboard/project/nimbzitahumdefggtiob)
2. Cliquez sur **Authentication** → **Users**
3. Cliquez sur **"Add user"** → **"Create new user"**
4. Remplissez :
   - **Email** : `test@welcomebook.be`
   - **Password** : `Test123456!`
   - **Auto Confirm User** : ✅ Cochez la case
5. Cliquez sur **"Create user"**

### 2. Tester le mode édition

1. Lancez l'application : `npm run dev`
2. Visitez http://localhost:3000/demo
3. Cliquez sur **"Connexion gestionnaire"** en haut à droite
4. Connectez-vous avec :
   - Email : `test@welcomebook.be`
   - Password : `Test123456!`
5. Cliquez sur **"Mode édition"**

## ✨ Fonctionnalités du mode édition

### Boutons visibles en mode édition

#### 1. Bouton "Mode édition"
- **Position** : En haut à droite
- **Fonction** : Active/désactive le mode édition
- **État** :
  - Blanc quand désactivé
  - Bleu indigo quand activé

#### 2. Bouton "Éditer" sur les cards
- **Position** : En haut à droite de chaque card de conseil
- **Icône** : Crayon (Edit)
- **Fonction** : Ouvre le formulaire d'édition du conseil
- **Visibilité** : Uniquement en mode édition

#### 3. Bouton flottant "+"
- **Position** : En bas à droite, flottant
- **Fonction** : Ajouter un nouveau conseil
- **Visibilité** : Uniquement en mode édition
- **Style** : Bouton rond bleu avec icône +

### Prochaines étapes (à implémenter)

- [x] Authentification basique
- [x] Bouton de connexion
- [x] Mode édition avec toggle
- [x] Boutons d'édition sur les cards
- [x] Bouton flottant d'ajout
- [ ] Modal d'édition du header/footer
- [ ] Formulaire d'ajout/édition de conseils
- [ ] Upload d'images
- [ ] Suppression de conseils

## 🔧 Architecture technique

### Authentification

L'authentification utilise **Supabase Auth** avec :
- `AuthProvider` : Context React pour gérer l'état de l'utilisateur
- `useAuth()` : Hook pour accéder à l'utilisateur connecté
- `LoginModal` : Modal de connexion simple

### État du mode édition

```tsx
const { user } = useAuth()  // Utilisateur connecté ou null
const [editMode, setEditMode] = useState(false)  // Mode édition activé
const isEditMode = !!(user && editMode)  // true si connecté ET mode activé
```

### Composants modifiés

- **WelcomeBookClient** : Gère l'état d'authentification et du mode édition
- **Header** : Prop `isEditMode` pour afficher des boutons d'édition
- **Footer** : Prop `isEditMode` pour afficher des boutons d'édition
- **TipCard** : Prop `isEditMode` pour afficher le bouton d'édition

## 📝 Exemple de flux utilisateur

1. **Visiteur non connecté** :
   - Voit le bouton "Connexion gestionnaire"
   - Peut consulter les conseils normalement
   - Pas de boutons d'édition visibles

2. **Gestionnaire connecté (mode normal)** :
   - Voit le bouton "Mode édition" (désactivé)
   - Peut consulter les conseils normalement
   - Pas de boutons d'édition visibles encore

3. **Gestionnaire connecté (mode édition)** :
   - Le bouton devient "Quitter l'édition" (bleu)
   - Voit les boutons "Éditer" sur chaque card
   - Voit le bouton flottant "+" pour ajouter
   - Peut modifier le header/footer (à implémenter)

## 🔐 Sécurité

### État actuel (Développement)

- ✅ Authentification fonctionnelle
- ✅ UI conditionnelle basée sur l'auth
- ⚠️ Pas de vérification côté serveur pour les mutations
- ⚠️ Tous les utilisateurs authentifiés peuvent éditer

### À implémenter (Production)

1. **Row Level Security (RLS)**
   ```sql
   -- Politique pour permettre aux gestionnaires de modifier uniquement leurs clients
   CREATE POLICY "Users can update own client"
   ON clients FOR UPDATE
   USING (auth.uid() = user_id);
   ```

2. **Lier les utilisateurs aux clients**
   ```sql
   ALTER TABLE clients ADD COLUMN user_id UUID REFERENCES auth.users(id);
   ```

3. **Server Actions sécurisées**
   ```ts
   export async function updateTip(tipId: string, data: TipUpdate) {
     const supabase = await createServerSupabaseClient()
     const { data: { user } } = await supabase.auth.getUser()

     if (!user) throw new Error('Non autorisé')

     // Vérifier que l'utilisateur possède le client
     const { data: tip } = await supabase
       .from('tips')
       .select('client:clients(user_id)')
       .eq('id', tipId)
       .single()

     if (tip.client.user_id !== user.id) {
       throw new Error('Non autorisé')
     }

     // Effectuer la mise à jour
     return await supabase
       .from('tips')
       .update(data)
       .eq('id', tipId)
   }
   ```

## 🐛 Dépannage

### Je ne peux pas me connecter

1. Vérifiez que l'utilisateur existe dans **Authentication** → **Users**
2. Vérifiez que **"Email confirm"** est activé (icône verte)
3. Vérifiez l'email et le mot de passe

### Le mode édition ne s'active pas

1. Vérifiez la console du navigateur (F12)
2. L'utilisateur doit être connecté d'abord
3. Rafraîchissez la page après connexion

### Les boutons d'édition ne s'affichent pas

1. Vérifiez que vous avez activé le "Mode édition"
2. Le bouton doit être bleu indigo quand activé
3. Vérifiez la console pour des erreurs

## 📚 Ressources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
