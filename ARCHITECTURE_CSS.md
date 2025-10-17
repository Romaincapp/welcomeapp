# Architecture CSS - WelcomeBook

Ce document explique comment le CSS est organisé dans WelcomeBook et comment modifier le style de **tous les welcomebooks en même temps** (clients + demo).

---

## 🎨 Principe : CSS Global vs Personnalisation

### ✅ CSS GLOBAL (Affecte TOUS les welcomebooks)

Tous les welcomebooks utilisent les **mêmes composants React** et le **même CSS**. Cela garantit que la démo et les welcomebooks clients ont exactement le même comportement.

**Fichiers qui affectent TOUS les welcomebooks :**

1. **`app/globals.css`** : CSS global de l'application
   - Variables CSS (`:root`)
   - Styles de base (`body`, etc.)
   - Classes utilitaires (`.scrollbar-hide`, animations, etc.)
   - Overrides de librairies (Leaflet, modales)

2. **`tailwind.config.ts`** : Configuration Tailwind
   - Couleurs globales
   - Thème étendu
   - Plugins

3. **Composants partagés (dans `/components`)** :
   - `Header.tsx` : En-tête de tous les welcomebooks
   - `Footer.tsx` : Pied de page
   - `TipCard.tsx` : Cards de conseils
   - `TipModal.tsx` : Modale de détails
   - `InteractiveMap.tsx` : Carte interactive
   - Etc.

### ⚙️ PERSONNALISATION PAR CLIENT (Via la base de données)

Chaque client peut personnaliser **certains aspects** via la table `clients` :

| Colonne | Description | Exemple |
|---------|-------------|---------|
| `header_color` | Couleur du header | `#4F46E5` |
| `footer_color` | Couleur du footer | `#1E1B4B` |
| `background_image` | Image de fond | `/background-images/villa.jpg` |
| `footer_buttons` | Boutons de contact personnalisés | Table `footer_buttons` |

---

## 📝 Comment modifier le CSS de TOUS les welcomebooks

### Exemple 1 : Changer le style des cards de conseils

**Fichier à modifier :** `components/TipCard.tsx`

```tsx
// Avant
<div className="bg-white rounded-lg shadow-md overflow-hidden">

// Après (bordure plus arrondie et ombre plus forte)
<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
```

**Résultat :** Tous les welcomebooks (demo + clients) auront des cards avec bordures plus arrondies.

---

### Exemple 2 : Ajouter une animation globale aux cards

**Fichier à modifier :** `app/globals.css`

```css
/* Ajouter à la fin du fichier */
@layer utilities {
  .tip-card-hover {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .tip-card-hover:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }
}
```

Puis dans `components/TipCard.tsx` :

```tsx
<div className="bg-white rounded-lg shadow-md overflow-hidden tip-card-hover">
```

**Résultat :** Toutes les cards de tous les welcomebooks auront l'animation au survol.

---

### Exemple 3 : Modifier les couleurs globales du thème

**Fichier à modifier :** `tailwind.config.ts`

```ts
theme: {
  extend: {
    colors: {
      background: 'var(--background)',
      foreground: 'var(--foreground)',
      // Ajouter des couleurs personnalisées
      primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
      },
    },
  },
},
```

Puis utiliser dans les composants :

```tsx
<button className="bg-primary-500 hover:bg-primary-600">
```

**Résultat :** Tous les boutons utilisant `primary-*` auront les nouvelles couleurs.

---

### Exemple 4 : Modifier le style du header pour TOUS

**Fichier à modifier :** `components/Header.tsx`

Chercher la ligne avec le style du header et modifier :

```tsx
// Avant
<header style={{ backgroundColor: client.header_color }}>

// Après (ajouter une bordure en bas)
<header
  style={{ backgroundColor: client.header_color }}
  className="border-b-4 border-white/20"
>
```

**Résultat :** Tous les headers auront une bordure blanche semi-transparente.

---

## 🔍 Architecture des composants

```
app/
├── globals.css              ← CSS GLOBAL (affecte tout)
├── layout.tsx               ← Layout racine
├── page.tsx                 ← Page d'accueil
└── [slug]/
    ├── page.tsx             ← Page dynamique pour chaque welcomebook
    └── WelcomeBookClient.tsx ← Composant principal

components/
├── Header.tsx               ← Header (utilise client.header_color)
├── Footer.tsx               ← Footer (utilise client.footer_color)
├── TipCard.tsx              ← Cards de conseils
├── TipModal.tsx             ← Modale de détails
├── InteractiveMap.tsx       ← Carte Leaflet
├── AddTipModal.tsx          ← Ajouter un conseil
├── EditTipModal.tsx         ← Éditer un conseil
├── CustomizationMenu.tsx    ← Menu de personnalisation
└── ShareWelcomeBookModal.tsx ← Partager le welcomebook
```

---

## 🚀 Workflow de modification CSS

### Pour modifier LE DESIGN DE TOUS LES WELCOMEBOOKS :

1. **Identifier le composant à modifier**
   - Si c'est un style global → `app/globals.css`
   - Si c'est une couleur de thème → `tailwind.config.ts`
   - Si c'est un composant spécifique → `components/NomDuComposant.tsx`

2. **Tester localement**
   ```bash
   npm run dev
   ```
   - Allez sur `http://localhost:3000/demo` pour voir la démo
   - Allez sur `http://localhost:3000/votre-slug-client` pour voir un welcomebook client

3. **Vérifier que le changement affecte bien tous les welcomebooks**
   - Si oui → commit et deploy
   - Si non → vérifier que vous n'avez pas utilisé de styles inline dynamiques

---

## ⚠️ Pièges à éviter

### ❌ NE PAS FAIRE :

```tsx
// Styles différents selon le client (casse l'uniformité)
{client.slug === 'demo' ? (
  <div className="rounded-lg">Demo</div>
) : (
  <div className="rounded-xl">Client</div>
)}
```

### ✅ FAIRE :

```tsx
// Même style pour tous, personnalisation via props/DB
<div className="rounded-lg" style={{ backgroundColor: client.header_color }}>
  {client.name}
</div>
```

---

## 📋 Checklist : Modifier le CSS global

- [ ] Identifier le fichier à modifier (`globals.css`, `tailwind.config.ts`, ou un composant)
- [ ] Faire la modification
- [ ] Tester sur `/demo`
- [ ] Tester sur au moins un welcomebook client
- [ ] Vérifier que la personnalisation par client (couleurs header/footer) fonctionne toujours
- [ ] Commit et deploy

---

## 🎯 Résumé

| Quoi modifier | Où | Effet |
|---------------|-----|-------|
| **Tous les styles de base** | `app/globals.css` | Affecte 100% des welcomebooks |
| **Couleurs du thème** | `tailwind.config.ts` | Affecte 100% des welcomebooks |
| **Style d'un composant** | `components/*.tsx` | Affecte 100% des welcomebooks |
| **Couleur header/footer** | Base de données (`clients` table) | Personnalisation par client |
| **Boutons du footer** | Base de données (`footer_buttons` table) | Personnalisation par client |

**Principe clé :** La démo et les welcomebooks clients utilisent **exactement le même code**. Modifier un composant ou le CSS global affecte automatiquement tous les welcomebooks.
