# Règles TypeScript Strict - welcomeapp

## Configuration Actuelle

- ✅ `"strict": true` dans tsconfig.json
- ✅ **Nettoyage effectué** (2025-10-18) : Réduction de 29 → 27 occurrences de `as any`
- ✅ **Build passe sans erreurs** : `npm run build` réussit
- ⚠️ Les `as any` restants sont nécessaires à cause des limitations du système de types de Supabase

---

## 🚨 RÈGLES IMPÉRATIVES

### 1. INTERDICTION STRICTE DE `as any`

❌ **INTERDIT** (sauf workaround Supabase) :
```typescript
const data = result as any  // ❌ JAMAIS
const user: any = getUser()  // ❌ JAMAIS
function process(data: any) { }  // ❌ JAMAIS
```

✅ **AUTORISÉ** (uniquement pour Supabase) :
```typescript
const { data } = await (supabase.from('clients') as any).select('*')
```

**Sanction si règle non respectée** : Le code sera rejeté et devra être réécrit.

---

### 2. Pattern Approuvé pour Supabase (2025-10-18)

✅ **BON** - Types explicites + `as any` uniquement sur `.from()` :
```typescript
import { ClientUpdate } from '@/types'

const updateData: ClientUpdate = {
  background_image: imageUrl
}
const { error } = await (supabase
  .from('clients') as any)
  .update(updateData)
  .eq('id', client.id)
```

❌ **MAUVAIS** - `as any` sur les données :
```typescript
const { error } = await supabase
  .from('clients')
  .update({ background_image: imageUrl } as any)
  .eq('id', client.id)
```

**Fichiers utilisant ce pattern** (28 `as any` total - 2025-10-25) :
- [components/AddTipModal.tsx](components/AddTipModal.tsx) - 4 occurrences (insert categories, tips, tip_media)
- [components/EditTipModal.tsx](components/EditTipModal.tsx) - 5 occurrences (insert categories, update tips, insert tip_media, select tip_media pour suppression)
- [components/CustomizationMenu.tsx](components/CustomizationMenu.tsx) - 3 occurrences (update clients)
- [lib/actions/reorder.ts](lib/actions/reorder.ts) - 3 occurrences (update tips, categories)
- [lib/actions/secure-section.ts](lib/actions/secure-section.ts) - 10 occurrences (select/insert/update/delete secure_sections et clients)
- [lib/create-welcomebook.ts](lib/create-welcomebook.ts) - 2 occurrences (select/insert clients)
- [components/SecureSectionContent.tsx](components/SecureSectionContent.tsx) - 1 occurrence (fix Leaflet - non Supabase)

**Pourquoi `as any` est nécessaire** :
Le client Supabase (browser et serveur) a un bug connu où les types génériques `Database` ne sont pas propagés correctement à travers `.from()`. Le type inféré devient `never`, empêchant toute opération. Cette limitation est documentée dans les issues GitHub de Supabase.

---

## 🛡️ Bonnes Pratiques TypeScript

### 1. Typage Explicite Obligatoire

❌ **MAUVAIS** - Inférence implicite dangereuse :
```typescript
const user = getUser()  // Type inconnu
const items = data.map(x => x.value)  // any[]
function handleClick(e) { }  // any
```

✅ **BON** - Types explicites :
```typescript
const user: User | null = getUser()
const items: string[] = data.map((x: Item) => x.value)
function handleClick(e: React.MouseEvent<HTMLButtonElement>) { }
```

---

### 2. Utiliser `unknown` pour les Données Inconnues

❌ **MAUVAIS** :
```typescript
const response = await fetch('/api/data')
const data = await response.json() as any
console.log(data.user.name)  // Runtime error possible
```

✅ **BON** - Validation avec type guard :
```typescript
const response = await fetch('/api/data')
const data: unknown = await response.json()

if (isUserData(data)) {
  console.log(data.user.name)  // Type-safe ✅
}

function isUserData(data: unknown): data is { user: { name: string } } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'user' in data &&
    typeof (data as any).user === 'object' &&
    'name' in (data as any).user
  )
}
```

---

### 3. Non-Null Assertions (`!`) à Éviter

❌ **MAUVAIS** - Force et peut crasher :
```typescript
const user = users.find(u => u.id === id)!
console.log(user.name)  // Crash si undefined
```

✅ **BON** - Vérification explicite :
```typescript
const user = users.find(u => u.id === id)
if (!user) {
  throw new Error('User not found')
}
console.log(user.name)  // Type-safe ✅
```

---

### 4. Optional Chaining et Nullish Coalescing

❌ **MAUVAIS** :
```typescript
const name = user && user.profile && user.profile.name || 'Unknown'
```

✅ **BON** :
```typescript
const name = user?.profile?.name ?? 'Unknown'
```

---

### 5. Types pour les Props React

❌ **MAUVAIS** :
```typescript
function Button({ onClick, label }) {  // Props implicites
  return <button onClick={onClick}>{label}</button>
}
```

✅ **BON** :
```typescript
interface ButtonProps {
  onClick: () => void
  label: string
  disabled?: boolean
}

function Button({ onClick, label, disabled = false }: ButtonProps) {
  return <button onClick={onClick} disabled={disabled}>{label}</button>
}
```

---

### 6. Validation des Données Externes

Toujours valider les données venant de :
- Formulaires utilisateur
- APIs externes
- LocalStorage / Cookies
- URL params

✅ **BON** - Exemple avec Zod (ou type guard manuel) :
```typescript
import { z } from 'zod'

const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1)
})

function handleFormSubmit(formData: unknown) {
  const result = UserSchema.safeParse(formData)

  if (!result.success) {
    console.error('Invalid data:', result.error)
    return
  }

  const user = result.data  // Type-safe ✅
  saveUser(user)
}
```

---

### 7. Éviter les `@ts-ignore` et `@ts-expect-error`

❌ **INTERDIT** :
```typescript
// @ts-ignore
const value = data.unknownField
```

✅ **BON** - Corriger le type ou créer un type guard :
```typescript
if ('unknownField' in data && typeof data.unknownField === 'string') {
  const value = data.unknownField
}
```

---

### 8. Typage des Erreurs

❌ **MAUVAIS** :
```typescript
try {
  await fetchData()
} catch (error) {
  console.log(error.message)  // error est `unknown`
}
```

✅ **BON** :
```typescript
try {
  await fetchData()
} catch (error) {
  if (error instanceof Error) {
    console.log(error.message)
  } else {
    console.log('Unknown error:', error)
  }
}
```

---

### 9. Créer des Types Réutilisables

✅ **BON** - Centraliser dans `types/index.ts` :
```typescript
// types/index.ts
export interface User {
  id: string
  email: string
  name: string
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }
```

---

### 10. UTILISER les types de `database.types.ts`

Pour les queries Supabase, toujours utiliser `Database['public']['Tables']['nom_table']['Row']`

✅ **BON** :
```typescript
import { Database } from '@/types/database.types'
type Client = Database['public']['Tables']['clients']['Row']

const { data } = await supabase.from('clients').select('*').single()
if (data) {
  const client: Client = data
}
```

❌ **MAUVAIS** :
```typescript
const client = data as any
```

---

### 11. Créer des Type Guards

✅ **BON** - Exemple pour valider des données inconnues :
```typescript
function isValidClient(data: unknown): data is Client {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'slug' in data &&
    typeof data.slug === 'string'
  )
}

// Utilisation
if (isValidClient(data)) {
  // TypeScript sait maintenant que data est un Client
  console.log(data.slug)
}
```

---

### 12. METTRE À JOUR `database.types.ts` IMMÉDIATEMENT

Dès qu'une table ou un champ change dans la DB :
- Avant de coder les fonctionnalités qui utilisent ces données
- Lancer `npm run build` pour vérifier les erreurs TypeScript
- Utiliser `supabase gen types typescript` pour regénérer les types depuis la DB réelle

```bash
supabase gen types typescript --project-id nimbzitahumdefggtiob > types/database.types.ts
```

---

### 13. NE JAMAIS ignorer les erreurs TypeScript

- Si TypeScript se plaint, c'est qu'il y a un vrai problème
- Corriger le type plutôt que de forcer avec `@ts-ignore` ou `as any`
- Si vraiment bloqué, demander de l'aide avant d'utiliser `as any`

---

## 🚨 Checklist TypeScript Avant Chaque Commit

- [ ] `npm run build` passe sans erreur
- [ ] Aucun `as any` ajouté (sauf workaround Supabase)
- [ ] Toutes les fonctions ont des types de retour explicites
- [ ] Les props React sont typées avec des interfaces
- [ ] Les données externes sont validées
- [ ] Pas de `@ts-ignore` ou `@ts-expect-error`
- [ ] Types réutilisables créés dans `types/index.ts` si nécessaire
- [ ] `types/database.types.ts` synchronisé avec la DB

---

## Pourquoi c'est Crucial

✅ Évite les bugs en production :
- `undefined is not a function`
- `cannot read property of undefined`
- Erreurs de typage à l'exécution

✅ Permet de détecter les incohérences entre la DB et le code AVANT le runtime

✅ Facilite la maintenance et le refactoring

✅ Auto-complétion correcte dans l'éditeur (IntelliSense)

✅ Détecte les champs manquants ou mal typés

---

## Exemples de Bugs Évités par TypeScript Strict

### Bug évité #1 : Type guard manquant
```typescript
// ❌ MAUVAIS - Crash si data est undefined
function processUser(data: any) {
  console.log(data.user.name)  // CRASH !
}

// ✅ BON - Type guard protège
function processUser(data: unknown) {
  if (isUserData(data)) {
    console.log(data.user.name)  // Type-safe ✅
  }
}
```

### Bug évité #2 : .single() au lieu de .maybeSingle()
```typescript
// ❌ MAUVAIS - Lance une erreur si aucun résultat
const { data } = await supabase
  .from('clients')
  .select('*')
  .eq('email', email)
  .single()  // ❌ Erreur si vide !

// ✅ BON - Retourne null si aucun résultat
const { data } = await supabase
  .from('clients')
  .select('*')
  .eq('email', email)
  .maybeSingle()  // ✅ null si vide
```

### Bug évité #3 : Propriété manquante après changement DB
```typescript
// Après ajout du champ `header_subtitle` dans la DB

// ❌ MAUVAIS - TypeScript ne détecte pas
const client: any = await getClient()
console.log(client.header_subtitle)  // undefined !

// ✅ BON - TypeScript force à gérer
import { Database } from '@/types/database.types'
type Client = Database['public']['Tables']['clients']['Row']

const client: Client = await getClient()
console.log(client.header_subtitle ?? 'Default')  // Type-safe ✅
```

---

## Ressources

- **Documentation TypeScript** : https://www.typescriptlang.org/docs/
- **Zod (validation)** : https://zod.dev/
- **Issue Supabase types** : https://github.com/supabase/supabase-js/issues/...
