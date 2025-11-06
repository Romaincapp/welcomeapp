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
- [docs/changelog-features.md](docs/changelog-features.md) - Archive des 19 features majeures
- [docs/cahier-des-charges-initial.md](docs/cahier-des-charges-initial.md) - Conversations initiales (archive)

---

## ✅ État Actuel du Projet (dernière MAJ : 2025-11-06)

**Base de données** : 8 tables (clients, tips, categories, tip_media, secure_sections, qr_code_designs, email_events, unsubscribe_tokens) + 2 tables email marketing (email_campaigns, email_automations) + 6 vues SQL admin (platform_overview_stats, signups_evolution, top_welcomebooks, manager_categories, campaign_analytics, ab_test_comparison, unsubscribe_stats)
**Migrations** : 23 migrations appliquées (+ 2 nouvelles migrations email : 20251106_email_analytics_ab_testing.sql + 20251107_email_unsubscribe.sql)
**Build** : ✅ Sans erreur TypeScript
**`as any`** : 41 occurrences (Supabase workaround uniquement - 4 dans qr-design.ts + 1 dans share-tracking.ts + 8 dans lib/actions/admin pour views SQL)
**shadcn/ui** : ✅ Installé (Button, Card, Badge, Alert, Dialog, Chart, Tabs, Label, Switch, Textarea, Input, Popover, Select, ColorPicker, Table, DropdownMenu, AlertDialog)

**Dernières features** :
- ✅ **Lightbox d'Images pour les Tips** (2025-11-06) - Visualisation en grand format des images avec navigation intuitive. Nouveau composant `ImageLightbox.tsx` utilisant Radix UI Dialog. Clic sur image dans TipModal → ouverture plein écran. Navigation : boutons prev/next, flèches clavier (← →), pagination dots cliquables. Fermeture : bouton X, Escape, clic sur fond. Compteur position (1/5, 2/5...), support images ET vidéos. Overlay `bg-black/95` + `backdrop-blur-sm`. Icône Maximize2 au survol de l'image (indicateur hover). Next.js Image avec `quality={85}` et `priority`. TypeScript strict sans `any`. Interface `ImageLightboxProps` dans types/index.ts. Calcul intelligent de l'index lors du filtrage des images uniquement (exclut vidéos). z-index 60 pour superposition sur TipModal. Design responsive mobile/desktop. Build size: +8 KB (composant léger, 0 dépendance externe). Cas d'usage: Voyageurs admirent photos de lieux/restaurants en haute qualité, expérience immersive pour conseils visuels.
- ✅ **Système d'Unsubscribe Sécurisé** (2025-11-06) - Système complet de désabonnement conforme RGPD avec tokens sécurisés. Migration SQL `20251107_email_unsubscribe.sql` : champs `email_unsubscribed` et `email_unsubscribed_at` dans `clients`, table `unsubscribe_tokens` avec hashing SHA256 (expiration 90 jours, one-time use), 3 fonctions SQL (`generate_unsubscribe_token()`, `validate_unsubscribe_token()`, `cleanup_expired_unsubscribe_tokens()`), vue `unsubscribe_stats` pour analytics. API Route `/api/unsubscribe/[token]` avec pages HTML stylées (succès/erreur/expiré/déjà utilisé). Génération automatique de tokens uniques pour chaque destinataire lors d'envoi email. Modification des 5 templates React Email (`WelcomeEmail`, `InactiveReactivation`, `FeatureAnnouncement`, `Newsletter`, `TipsReminder`) + composant partagé `EmailLayout` pour inclure lien d'unsubscribe sécurisé. Pattern token : génération 32 chars hex → hash SHA256 pour stockage → validation + désabonnement automatique. Sécurité : RLS policies empêchent accès direct aux tokens, validation côté serveur, logging événements. Build size: 0 B (API route native). Conformité RGPD : distinction emails transactionnels (toujours envoyés) vs marketing (opt-out possible), page de confirmation claire, processus en 1 clic.
- ✅ **Email Marketing Analytics & A/B Testing** (2025-11-06) - Système complet d'analytics email et tests A/B automatiques. Migration SQL `20251106_email_analytics_ab_testing.sql` : champs A/B testing dans `email_campaigns` (`ab_test_enabled`, `ab_test_variant`, `ab_test_subject_a/b`, `ab_test_winner`), table `email_events` pour tracking granulaire (sent/delivered/opened/clicked/bounced/complained), 2 vues SQL (`campaign_analytics` avec métriques calculées : delivery_rate, open_rate, click_rate ; `ab_test_comparison` pour comparer variantes), fonction `calculate_ab_test_winner()` détermine automatiquement variante gagnante. Modification `/api/admin/send-campaign` pour A/B testing : split 50/50 aléatoire des destinataires, création de 2 campagnes séparées (variantes A/B), suivi indépendant des performances. Server actions `lib/actions/admin/campaign-analytics.ts` avec 7 fonctions : `getCampaignAnalytics()`, `getABTestComparison()`, `getCampaignEvents()`, `calculateABTestWinner()`, `getAllCampaignsAnalytics()`, `getCampaignsOverviewStats()`, `getTopCampaignsByOpenRate()`. Pattern `as any` approuvé pour vues SQL (2 occurrences). Build size: 0 B (backend uniquement). Cas d'usage : Optimiser sujets emails avec tests A/B automatiques, mesurer ROI campagnes marketing, identifier meilleurs performing emails, améliorer stratégie email basée sur data.
- ✅ **Dashboard Modérateur** (2025-11-04) - Système complet de modération et supervision pour l'admin (romainfrancedumoulin@gmail.com). 2 nouvelles migrations SQL (20+21) : RLS policies admin (fonction `is_admin()` + policies sur toutes les tables) + 4 vues SQL (platform_overview_stats, signups_evolution, top_welcomebooks, manager_categories). 5 routes : `/admin` (stats globales), `/admin/managers` (liste + filtres + search), `/admin/managers/[id]` (détails + modération), `/admin/analytics` (analytics avancés). Helper `lib/auth/admin.ts` avec `isAdmin()`, `getAdminUser()`, `requireAdmin()`. Server actions: `lib/actions/admin/stats.ts` (stats plateforme), `managers.ts` (CRUD + export CSV emails), `moderation.ts` (suppression comptes/tips), `analytics.ts` (exploitation analytics_events). Bouton "Mode Modérateur" dans dashboard normal (visible uniquement pour admin). Features: Vue d'ensemble plateforme avec metrics cards (clients, tips, vues, partages, PWA installs), évolution signups (90 jours), top 10 welcomebooks. Liste gestionnaires avec search/filtres par catégorie (Inactif/Débutant/Intermédiaire/Avancé/Expert), export CSV emails pour marketing. Détails gestionnaire avec analytics (vues, clics, partages, PWA), liste tips, actions modération (supprimer tip, supprimer compte, contacter via mailto). Analytics avancés : répartition événements par type/device, top langues/pays visiteurs, sessions récentes. UI shadcn/ui cohérente (Table, Select, DropdownMenu, AlertDialog). Build size: +30 KB. Hard-coded admin email (pas de système de rôles complexe). Pattern `as any` approuvé pour Supabase views (6 occurrences). Contrôle total : lecture, modification, suppression de tout contenu + comptes. Export CSV natif navigateur (0 dépendance). Cas d'usage: Supervision plateforme, aide aux gestionnaires, modération contenu, export emails pour campagnes marketing.
- ✅ **Tâche "Partager" cochée automatiquement** (2025-11-04) - Tracking automatique de l'action de partage dans la checklist du dashboard. Nouveau champ `has_shared` (boolean) dans la table `clients` (19ème migration). Server action `markAsShared(clientId)` avec ownership check et idempotence. Modal ShareWelcomeBookModal appelle markAsShared() lors de 3 actions : copie lien, téléchargement QR, ou partage email. ChecklistManager utilise `client.has_shared` pour cocher dynamiquement la tâche. Build size: 0 B (aucune dépendance). UX améliorée : les gestionnaires voient leur progression réelle, toutes les tâches de la checklist sont maintenant trackées.
- ✅ **QR Code Designer A4 Imprimable** (2025-11-03) - Éditeur complet de QR codes personnalisés pour impression professionnelle. Modal plein écran avec 3 onglets (Contenu/Style/Logo), 4 thèmes modernes, orientation A4 (Portrait/Paysage), upload de logo, ColorPicker pour personnaliser le QR, pré-remplissage automatique depuis données client, export PDF natif (window.print), sauvegarde DB avec versions/brouillons. Table `qr_code_designs` (18ème migration) + server actions CRUD. Nouvelle Quick Action dans dashboard. Build size: +12 KB (shadcn tabs/label/switch/textarea). Cas d'usage: Gestionnaires créent affiches A4 stylisées à afficher dans locations de vacances.
- ✅ **Icônes PWA dynamiques** (2025-11-03) - Génération d'icônes PWA uniques par welcomebook basées sur l'arrière-plan ou la couleur du header. API Route Edge `/api/icon/[slug]/[size]` avec Next.js ImageResponse. Tailles 192x192 et 512x512. Compatible desktop et Android. Build size: 0 B (génération dynamique).
- ✅ **Dashboard Analytics avec shadcn/ui** (2025-11-03) - Page `/dashboard/analytics` complète avec graphiques interactifs (Line Chart évolution tips, Bar Chart par catégorie), Metrics Cards en Bento grid (design trends 2025), suggestions intelligentes avec benchmarks. Section "Aperçu Analytics" ajoutée sur dashboard principal. Recharts intégré via shadcn/ui Chart components. Build size: 114 KB. MVP fonctionnel sans migration SQL (utilise données existantes: created_at, ratings Google Places).
- ✅ **Optimisation Dashboard Mobile** (2025-11-02) - Actions principales ("Voir, Éditer, Partager") en premier, badges en scroll horizontal avec snap scrolling, Danger Zone déplacée hors du conteneur gradient pour meilleure visibilité
- ✅ **Réorganisation UI mode édition** (2025-11-02) - Suppression des boutons flottants encombrants (top-right + bottom-right), ajout lien "Espace gestionnaire" dans footer, nouveau menu dropdown "+" dans header (mode édition) avec toutes les actions (Ajouter conseil, Remplissage auto, Personnaliser, Dashboard, Paramètres, Quitter édition, Déconnexion). Hiérarchie z-index: menu z-70 > header z-50. UX épurée sans encombrer l'interface voyageur.
- ✅ PWA installable avec manifest dynamique (2025-11-01)
- ✅ **Header mode compact avec détection de scroll** (2025-11-01) - Header `fixed` (pas `sticky` à cause de `overflow-x: hidden`), se compacte au scroll > 100px, transitions fluides, spacer dynamique, z-index correct (header z-50)
- ✅ **Suppression suggestion fond d'écran SmartFillModal** (2025-11-01) - Économie d'appels API Google Places
- ✅ Traduction côté client gratuite (Browser API + MyMemory fallback) (2025-10-28)
- ✅ Smart Fill + gamification (checklist dynamique, badges) (2025-10-27)

**Prochaines priorités** :
1. **Dashboard Email Marketing** : Interface admin pour visualiser analytics campagnes (graphiques open rate, click rate, A/B test results)
2. **Webhooks Resend** : Intégrer webhooks pour tracking événements emails en temps réel (opens, clicks, bounces)
3. **Automatisation avancée** : Triggers basés sur comportement (ex: relance si email non ouvert après X jours)
4. **Segmentation dynamique** : Filtres avancés pour ciblage précis (location, engagement, dernière visite)
5. Tester campagnes email en production avec vrais gestionnaires
6. Monitorer taux d'unsubscribe et ajuster stratégie email

---

## 🔗 Liens Rapides

- **README.md** : Guide utilisateur et installation
- **supabase/schema.sql** : Schéma SQL principal
- **types/database.types.ts** : Types TypeScript générés depuis la DB
- **supabase/migrations/** : Historique des migrations (23 fichiers)
