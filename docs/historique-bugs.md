# Historique des Bugs Critiques Corrigés

Cette archive contient tous les bugs critiques corrigés depuis le lancement du projet. Les bugs sont documentés avec symptôme, cause racine, solution et prévention.

---

## Bug #1 : Slug basé sur l'email au lieu du nom du logement (2025-10-25)

**Symptôme** : Lors de la création d'un compte avec le nom "Demo", le slug généré était "test" (basé sur l'email) au lieu de "demo".

**Cause racine** : `createWelcomebookServerAction` utilisait `.single()` au lieu de `.maybeSingle()`, ce qui lançait une erreur quand aucun résultat n'était trouvé.

**Solution** : Utiliser `.maybeSingle()` pour vérifier l'existence d'un compte.

**Fichiers modifiés** :
- [lib/actions/create-welcomebook.ts](lib/actions/create-welcomebook.ts)

**Prévention** : Toujours utiliser `.maybeSingle()` au lieu de `.single()`.

---

## Bug #2 : Compte orphelin dans `clients` après suppression manuelle dans Auth (2025-10-25)

**Symptôme** : Après suppression d'un utilisateur via le dashboard Supabase Auth, tentative de recréation avec le même email échouait avec "Un compte existe déjà".

**Cause racine** : Suppression manuelle uniquement dans `auth.users` sans supprimer l'entrée correspondante dans `clients`.

**Solution immédiate** : Script `delete-client.mjs` pour nettoyer les clients orphelins.

**Solution long terme** : Créer un trigger PostgreSQL qui supprime automatiquement le client quand l'utilisateur Auth est supprimé.

**Prévention** : Ne JAMAIS supprimer manuellement uniquement dans `auth.users`. Toujours utiliser le bouton "Supprimer mon compte" dans le dashboard.

---

## Bug #3 : Inscription impossible ("User already exists") même pour un nouvel email (2025-10-26)

**Symptôme** : Lors de la première tentative d'inscription avec un email complètement nouveau, erreur "User already exists".

**Cause racine** : Problème de synchronisation de session entre client et serveur. `createWelcomebookServerAction()` était appelée immédiatement après `auth.signUp()`, mais la session n'était pas encore synchronisée côté serveur.

**Solution** :
1. Nouvelle function `checkEmailExists()` - Vérification AVANT `auth.signUp()`
2. `createWelcomebookServerAction()` accepte `userId` en paramètre (pas de vérification auth côté serveur)
3. Délai de 1.5s après `auth.signUp()` pour synchronisation session

**Fichiers modifiés** :
- [lib/actions/create-welcomebook.ts](lib/actions/create-welcomebook.ts)
- [app/signup/page.tsx](app/signup/page.tsx)

**Prévention** : Toujours attendre 1.5s après `auth.signUp()` avant d'appeler server actions. Vérifier email AVANT `auth.signUp()`.

---

## Bug #4 : `checkEmailExists()` ne capturait pas les erreurs de requête (2025-10-26)

**Symptôme** : Même après le fix du Bug #3, erreur "Un compte existe déjà" pour un email nouveau.

**Cause racine** : `checkEmailExists()` ne capturait pas l'erreur retournée par Supabase. Si la requête échouait, le code retournait `exists: false` au lieu de propager l'erreur.

**Solution** : Capturer explicitement `error` et le propager via `throw`.

```typescript
const { data: clientData, error: checkError } = await supabase
  .from('clients')
  .select('slug')
  .eq('email', email)
  .maybeSingle()

if (checkError) {
  throw new Error(`Erreur lors de la vérification de l'email: ${checkError.message}`)
}
```

**Prévention** : TOUJOURS capturer `error` dans les queries Supabase et vérifier avant d'utiliser `data`.

---

## Bug #5 : Double vérification d'email avec contextes RLS différents (2025-10-26)

**Symptôme** : Lors de l'inscription avec un email jamais utilisé, message "Email disponible ✅" mais ensuite "Un compte existe déjà".

**Cause racine** : Deux vérifications d'existence d'email avec des contextes d'authentification différents :
- `checkEmailExists()` - Appelée depuis le client (anonyme)
- `createWelcomebookServerAction()` - Appelée depuis le serveur (authentifiée)

À cause des RLS policies différentes, les deux fonctions ne voyaient pas les mêmes données.

**Solution** : Suppression de la double vérification dans `createWelcomebookServerAction()`. Faire confiance à la vérification initiale.

**Prévention** : Éviter les vérifications redondantes avec des contextes d'authentification différents.

---

## Bug #6 : Double-appel Server Actions en mode dev causant erreur duplicate key (2025-10-27)

**Symptôme** : Lors de l'inscription, tous les indicateurs verts mais erreur "duplicate key value violates unique constraint \"clients_email_unique\"".

**Cause racine** : React Strict Mode en mode développement exécute les Server Actions DEUX FOIS. Le 1er appel créait le client, le 2ème lançait une erreur duplicate key.

**Solution** :
1. Protection côté client avec `useRef` (survit aux re-renders)
2. Protection côté serveur avec pattern idempotent (détecte duplicate key → récupère client existant → retourne success)

**Fichiers modifiés** :
- [app/signup/page.tsx](app/signup/page.tsx)
- [lib/actions/create-welcomebook.ts](lib/actions/create-welcomebook.ts)

**Prévention** : Rendre les Server Actions idempotentes (même résultat si appelées plusieurs fois).

---

## Bug #7 : Background par défaut non défini à la création du compte (2025-10-27)

**Symptôme** : Lors de la création d'un nouveau compte, `background_image: null` au lieu de l'image par défaut.

**Cause racine** : La colonne `background_image` dans la table `clients` n'avait pas de valeur DEFAULT au niveau de la base de données.

**Solution** : Ajout de `DEFAULT '/backgrounds/default-1.jpg'` dans le schéma + migration SQL.

**Fichiers modifiés** :
- [supabase/schema.sql](supabase/schema.sql)
- [supabase/migrations/20251027000002_add_default_background.sql](supabase/migrations/20251027000002_add_default_background.sql)

**Prévention** : TOUJOURS définir des valeurs DEFAULT au niveau DB pour les champs critiques.

---

## Bug #8 : Trigger PostgreSQL `handle_new_user` créait automatiquement des clients avec données incorrectes (2025-10-27)

**Symptôme** : Lors de l'inscription avec "Villa Belle Vue Ardennes", le client créé avait `name: "Mon WelcomeBook"` et `slug: "test-final"`.

**Cause racine** : Un trigger PostgreSQL caché sur `auth.users` créait automatiquement un client avec des données hardcodées IMMÉDIATEMENT après `auth.signUp()`, AVANT que `createWelcomebookServerAction()` ne soit appelée.

**Solution** : Suppression complète du trigger et de sa fonction.

**Migration** : [supabase/migrations/20251027000003_remove_handle_new_user_trigger.sql](supabase/migrations/20251027000003_remove_handle_new_user_trigger.sql)

**Prévention** :
- TOUJOURS vérifier les triggers PostgreSQL lors de debugging mystérieux
- NE JAMAIS créer de triggers qui dupliquent la logique métier du code applicatif
- Utiliser `SELECT trigger_name FROM information_schema.triggers` pour lister les triggers actifs

---

## Bug #9 : RLS policy bloquait l'affichage du bouton "Infos d'arrivée" pour les visiteurs (2025-10-30)

**Symptôme** : Sur les welcomeapps, le bouton "Infos d'arrivée" n'apparaissait pas pour les visiteurs, alors que les sections sécurisées existaient dans la DB.

**Cause racine** : La RLS policy sur `secure_sections` bloquait complètement l'accès aux visiteurs anonymes. La requête pour vérifier l'existence de la section sécurisée était bloquée.

**Solution** : Nouvelle RLS policy autorisant la lecture pour tous (avec `USING (true)`). La sécurité est maintenue par la vérification du code dans le modal.

**Migration** : [supabase/migrations/20251030_fix_secure_section_visibility.sql](supabase/migrations/20251030_fix_secure_section_visibility.sql)

**Amélioration UX** : Changement de l'icône Lock 🔒 → Info ℹ️ pour rendre le bouton plus accueillant.

**Prévention** :
- TOUJOURS tester en navigation privée (utilisateur anonyme)
- VÉRIFIER les RLS policies lors du développement de fonctionnalités accessibles aux visiteurs
- Utiliser `USING (true)` pour les données de "découverte", protéger le contenu sensible au niveau applicatif

---

## Bug #10 : Clé API Google exposée dans les URLs de photos retournées au client (2025-11-15)

**Symptôme** : La clé API Google Places était visible dans le code source et les outils de développement du navigateur lors de l'édition de tips.

**Cause racine** : Deux routes API retournaient des URLs de photos Google Places avec la clé API en paramètre :
- [app/api/places/details/route.ts:120](app/api/places/details/route.ts) - `https://maps.googleapis.com/...&key=${GOOGLE_PLACES_API_KEY}`
- [app/api/places/nearby/route.ts:146](app/api/places/nearby/route.ts) - Même problème

**Solution** : Création d'une route API proxy pour servir les photos :
1. Nouvelle route [app/api/places/photo/route.ts](app/api/places/photo/route.ts) - Proxy côté serveur pour récupérer les photos
2. Modification de `/api/places/details` - Retour uniquement de `/api/places/photo?photo_reference=XXX`
3. Modification de `/api/places/nearby` - Utilisation du proxy au lieu de l'URL directe
4. Cache HTTP agressif (1 an) car les photos ne changent jamais

**Sécurité** :
- ✅ Clé API Google nunca exposée au client
- ✅ Toutes les requêtes à Google Places API passent par le serveur
- ✅ Headers `Cache-Control: public, max-age=31536000, immutable` pour performance

**Prévention** :
- **NE JAMAIS** retourner d'URLs avec des clés API au client
- **TOUJOURS** créer des routes proxy pour les ressources nécessitant authentification
- **VÉRIFIER** régulièrement que les clés API ne sont pas exposées dans le code source ou les réponses API

---

## Bug #11 : Stats de vues à 0 dans le tableau des gestionnaires (/admin/managers) (2025-11-17)

**Symptôme** : Toutes les colonnes "Vues" et "Clics" affichaient systématiquement 0 dans le tableau récapitulatif des gestionnaires (`/admin/managers`), alors que la section "Top Welcomebooks" affichait correctement les stats de vues.

**Cause racine** : La vue SQL `manager_categories` était incomplète. Elle ne calculait que `total_tips`, mais ne contenait pas les LEFT JOIN LATERAL pour calculer `total_views` et `total_clicks` depuis la table `analytics_events`. Le TypeScript affichait `manager.total_views || 0` qui retournait toujours 0 car le champ n'existait pas dans les données SQL.

**Solution** : Création de la migration [20251117000001_fix_manager_categories_views.sql](supabase/migrations/20251117000001_fix_manager_categories_views.sql) pour corriger la vue SQL `manager_categories` :
1. Ajout LEFT JOIN LATERAL pour `total_media` (depuis `tip_media`)
2. Ajout LEFT JOIN LATERAL pour `total_views` (depuis `analytics_events WHERE event_type = 'view'`)
3. Ajout LEFT JOIN LATERAL pour `total_clicks` (depuis `analytics_events WHERE event_type = 'click'`)
4. Copie de la logique exacte de `top_welcomebooks` qui fonctionnait déjà correctement

**Fichiers modifiés** :
- [supabase/migrations/20251117000001_fix_manager_categories_views.sql](supabase/migrations/20251117000001_fix_manager_categories_views.sql) - Migration SQL

**Impact** :
- 0 changement de code TypeScript nécessaire (interface `Manager` était déjà prête)
- Les index existants (`idx_analytics_events_client_id`, `idx_analytics_events_event_type`) assurent des queries rapides
- Build size: 0 B (uniquement SQL)

**Prévention** :
- Toujours vérifier que les vues SQL incluent TOUS les champs attendus par les interfaces TypeScript
- Tester les requêtes SQL manuellement avant de créer une vue
- Documenter les dépendances entre vues SQL et interfaces TypeScript
- Utiliser des vues existantes comme référence (comme `top_welcomebooks`) pour éviter de réinventer

---

## Statistiques

- **Total de bugs critiques corrigés** : 11
- **Période** : 2025-10-25 à 2025-11-17
- **Bugs liés à l'authentification** : 6 (Bugs #1-#6)
- **Bugs liés à la DB** : 3 (Bugs #7-#8, #11)
- **Bugs liés aux RLS policies** : 1 (Bug #9)
- **Bugs liés à la sécurité** : 1 (Bug #10)

---

## Leçons Apprises

1. **Toujours utiliser `.maybeSingle()` au lieu de `.single()`**
2. **Vérifier les triggers PostgreSQL** lors de debugging mystérieux
3. **Rendre les Server Actions idempotentes** (React Strict Mode)
4. **Vérifier `error` dans TOUTES les queries Supabase**
5. **Tester en navigation privée** pour vérifier RLS policies
6. **Définir des valeurs DEFAULT au niveau DB** pour les champs critiques
7. **Double vérification email AVANT `auth.signUp()`**
8. **Délai de synchronisation** après `auth.signUp()` (1.5s)
9. **Ne JAMAIS exposer de clés API dans les URLs retournées au client** - Toujours créer des routes proxy
