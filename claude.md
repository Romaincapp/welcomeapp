# welcomeapp

---

## 🚨 RÈGLE ABSOLUE - À LIRE AVANT TOUTE MODIFICATION 🚨

**⚠️⚠️⚠️ IMPÉRATIF ⚠️⚠️⚠️**

**TOUTE modification du code DOIT être documentée dans ce fichier IMMÉDIATEMENT.**

**Sections à mettre à jour OBLIGATOIREMENT :**

1. **Modifications des workflows authentification/compte** → Mettre à jour [.claude/workflows-auth.md](.claude/workflows-auth.md)
2. **Modifications de la base de données** → Mettre à jour [.claude/database.md](.claude/database.md) ET `types/database.types.ts`
3. **Ajout/suppression de fonctionnalités** → Mettre à jour [docs/changelog-features.md](docs/changelog-features.md) ET `README.md`
4. **Correction de bugs** → Ajouter dans [docs/historique-bugs.md](docs/historique-bugs.md)
5. **Modifications TypeScript/types** → Mettre à jour [.claude/typescript-rules.md](.claude/typescript-rules.md)

**Workflow OBLIGATOIRE :**
```
AVANT toute modification → Lire CLAUDE.md + README.md + .claude/database.md
PENDANT → Suivre les règles TypeScript Strict
APRÈS → Mettre à jour docs + npm run build
```

**Si tu ne suis pas ces règles, tu introduiras des BUGS. Ce fichier est la source de vérité du projet.**

---

## ⚡ LES 20 RÈGLES ESSENTIELLES

### 🚨 **Règles Critiques (Top 5)**

1. **Documentation immédiate** : TOUTE modification du code DOIT être documentée IMMÉDIATEMENT
2. **Workflow obligatoire** : Lire docs AVANT → Suivre TypeScript Strict PENDANT → Mettre à jour docs + `npm run build` APRÈS
3. **Interdiction stricte de `as any`** : Ne JAMAIS utiliser sauf workaround Supabase avec pattern approuvé (voir [.claude/typescript-rules.md](.claude/typescript-rules.md))
4. **`npm run build` sans erreur** : Doit passer sans erreur TypeScript avant chaque commit
5. **Migration SQL obligatoire** : Créer une migration pour TOUT changement de DB + mettre à jour `types/database.types.ts`

### 🔒 **TypeScript (6 règles)**

6. **Typage explicite obligatoire** : Pas d'inférence implicite dangereuse
7. **`unknown` pour données inconnues** : Toujours utiliser `unknown` + type guard (jamais `any`)
8. **Pas de `@ts-ignore`** : Interdiction de `@ts-ignore` ou `@ts-expect-error`
9. **Validation données externes** : Toujours valider (API, formulaires) avec type guards
10. **Error handling typé** : Gérer les erreurs avec type narrowing (`instanceof Error`)
11. **Types réutilisables** : Créer des types dans `types/index.ts`

### 🗄️ **Base de Données (4 règles)**

12. **`.maybeSingle()` TOUJOURS** : Utiliser `.maybeSingle()` au lieu de `.single()` (évite erreurs si aucun résultat)
13. **Regénérer types DB** : `supabase gen types typescript` si changement DB
14. **Vérifier triggers PostgreSQL** : Lors de debugging mystérieux, toujours vérifier les triggers
15. **Ne jamais supprimer dans Auth uniquement** : Ne JAMAIS supprimer manuellement uniquement dans `auth.users` (créer trigger ou script)

### 🔐 **Authentification & Sécurité (3 règles)**

16. **Tester en navigation privée** : TOUJOURS tester en navigation privée pour vérifier RLS policies
17. **Vérifier ownership** : Toujours vérifier `user.email === email` dans les server actions
18. **Pattern idempotent** : Rendre les server actions idempotentes (même résultat si appelées plusieurs fois)

### ⚡ **Performance & UX (2 règles)**

19. **Lazy loading images** : `loading="lazy"` + `quality={60-80}` pour optimiser
20. **Traduction côté client** : Utiliser `useClientTranslation` pour header subtitle + buttons

---

## 📚 Documentation Détaillée

**Architecture & Stack :**
- [.claude/stack.md](.claude/stack.md) - Stack technique (Next.js 14, Supabase, Tailwind, etc.)
- [.claude/database.md](.claude/database.md) - Schéma DB complet, migrations, RLS policies

**Règles de Développement :**
- [.claude/typescript-rules.md](.claude/typescript-rules.md) - Règles TypeScript détaillées + exemples
- [.claude/workflows-auth.md](.claude/workflows-auth.md) - Workflows authentification détaillés (signup, login, reset, etc.)

**Historique & Maintenance :**
- [docs/historique-bugs.md](docs/historique-bugs.md) - Archive des 9 bugs critiques corrigés
- [docs/changelog-features.md](docs/changelog-features.md) - Archive des 12 features majeures
- [docs/cahier-des-charges-initial.md](docs/cahier-des-charges-initial.md) - Conversations initiales (archive)

---

## ✅ État Actuel du Projet (dernière MAJ : 2025-11-02)

**Base de données** : 5 tables (clients, tips, categories, tip_media, secure_sections)
**Migrations** : 17 migrations appliquées
**Build** : ✅ Sans erreur TypeScript
**`as any`** : 28 occurrences (Supabase workaround uniquement)

**Dernières features** :
- ✅ **Optimisation Dashboard Mobile** (2025-11-02) - Actions principales ("Voir, Éditer, Partager") en premier, badges en scroll horizontal avec snap scrolling, Danger Zone déplacée hors du conteneur gradient pour meilleure visibilité
- ✅ **Réorganisation UI mode édition** (2025-11-02) - Suppression des boutons flottants encombrants (top-right + bottom-right), ajout lien "Espace gestionnaire" dans footer, nouveau menu dropdown "+" dans header (mode édition) avec toutes les actions (Ajouter conseil, Remplissage auto, Personnaliser, Dashboard, Paramètres, Quitter édition, Déconnexion). Hiérarchie z-index: menu z-70 > header z-50. UX épurée sans encombrer l'interface voyageur.
- ✅ PWA installable avec manifest dynamique (2025-11-01)
- ✅ **Header mode compact avec détection de scroll** (2025-11-01) - Header `fixed` (pas `sticky` à cause de `overflow-x: hidden`), se compacte au scroll > 100px, transitions fluides, spacer dynamique, z-index correct (header z-50)
- ✅ **Suppression suggestion fond d'écran SmartFillModal** (2025-11-01) - Économie d'appels API Google Places
- ✅ Traduction côté client gratuite (Browser API + MyMemory fallback) (2025-10-28)
- ✅ Smart Fill + gamification (checklist dynamique, badges) (2025-10-27)

**Prochaines priorités** :
1. Tester Smart Fill en production avec vrais gestionnaires
2. Monitorer métriques badges/checklist (taux de complétion)
3. Recueillir feedback utilisateurs sur gamification

---

## 🔗 Liens Rapides

- **README.md** : Guide utilisateur et installation
- **supabase/schema.sql** : Schéma SQL principal
- **types/database.types.ts** : Types TypeScript générés depuis la DB
- **supabase/migrations/** : Historique des migrations (17 fichiers)
