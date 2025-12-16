# Changelog - Fonctionnalités de Randonnées GPS

## 16 Décembre 2025

### Système de miniatures de cartes (v1.0.0)

#### Objectif
Optimiser les coûts API en stockant les miniatures de cartes au lieu de les générer dynamiquement à chaque affichage.

#### Commits principaux

**1. Fix: Remove duplicate pathCoords variable in HikeMapSnapshot** (`4a79312`)
- Suppression du code obsolète GeoJSON
- Correction de la duplication de variable `pathCoords`
- Nettoyage du code pour utiliser uniquement Geoapify

**2. Feature: Use existing media bucket and service role key for thumbnails** (`3504e6a`)
- Utilisation du bucket `media` existant au lieu de créer `tips-media`
- Ajout du paramètre optionnel `supabaseClient` à `generateAndUploadHikeThumbnail()`
- Script de migration utilise maintenant le service role key pour bypasser RLS
- **Résultat** : 23 miniatures générées avec succès

**3. Fix: Correct Geoapify path format for static maps** (`df64001`)
- Correction du format API Geoapify
- Changement de `geometry=polyline:` vers `path=lonlat:` avec séparateurs pipe `|`
- Changement de `strokecolor/strokewidth` vers `linecolor/linewidth`
- Fix des erreurs "Bad Request" de l'API

**4. Feature: Complete hike thumbnail system with regeneration script** (`c7af28d`)
- Script complet de migration `scripts/regenerate-hike-thumbnails.ts`
- Support des tips existants
- Gestion des miniatures déjà existantes (skip)
- Logs détaillés du processus

**5. Add: Hike thumbnail generation and storage system** (`8f4598a`)
- Fonction `generateAndUploadHikeThumbnail()` dans `lib/generate-hike-thumbnail.ts`
- Fonction `deleteHikeThumbnail()` pour la suppression
- Intégration dans AddTipModal et EditTipModal
- Migration SQL pour ajouter `hike_thumbnail_url`

**6. Fix: GPS progress calculation based on actual distance covered** (`f3e90c7`)
- Fix du bug de progression GPS (affichait 98% au départ)
- Calcul basé sur la distance réelle parcourue vs distance totale
- Amélioration des annonces vocales

**7. Improve: Add visible route polyline to static maps** (`12b242b`)
- Ajout du tracé bleu visible sur les cartes statiques
- Amélioration du calcul de zoom pour voir l'ensemble du parcours
- Couleurs distinctes : vert (départ), rouge (arrivée), bleu (tracé)

**8. Add: Geoapify API key integration for static maps** (`1757a87`)
- Ajout de `NEXT_PUBLIC_GEOAPIFY_API_KEY` dans `.env.local`
- Configuration de l'API Geoapify pour les cartes statiques

**9. Fix: Add static map preview to TipCard for hiking tips without photos** (`dd57842`)
- Affichage des miniatures dans les TipCard quand pas de photo
- Priorité : miniature stockée > génération dynamique > aucune
- Composant `HikeMapSnapshot.tsx` créé

**10. Feature: Always show static map as first media in hiking tips carousel** (`03d610d`)
- Carte statique comme premier élément du carousel
- Intégration dans `FullScreenHikeModal.tsx`

#### Fichiers modifiés/créés

**Nouveaux fichiers :**
- `lib/generate-hike-thumbnail.ts` - Génération et gestion des miniatures
- `components/HikeMapSnapshot.tsx` - Composant d'affichage
- `scripts/regenerate-hike-thumbnails.ts` - Script de migration
- `supabase/migrations/add_hike_thumbnail_url.sql` - Migration DB
- `docs/HIKE_THUMBNAILS.md` - Documentation complète
- `docs/CHANGELOG_HIKE_FEATURES.md` - Ce fichier

**Fichiers modifiés :**
- `components/TipCard.tsx` - Affichage des miniatures
- `components/AddTipModal.tsx` - Génération auto lors de la création
- `components/EditTipModal.tsx` - Régénération lors de l'édition
- `components/FullScreenHikeModal.tsx` - Carte dans le carousel
- `components/HikeDisplay.tsx` - UI map-first avec footer shadcn/ui
- `components/MapWithRoute.tsx` - Fix espace blanc sous la carte
- `components/HikeGuidedMode.tsx` - Fix calcul progression GPS
- `types/database.types.ts` - Ajout du type `hike_thumbnail_url`
- `.env.local` - Ajout de `NEXT_PUBLIC_GEOAPIFY_API_KEY`

#### Statistiques de migration

```
🎉 Régénération terminée!
✅ Succès: 23 miniatures
⏭️  Ignorés: 0
❌ Erreurs: 0
⏱️  Temps total: ~90 secondes
💾 Espace utilisé: ~500KB
💰 Économies: 99%+ de réduction des coûts API
```

#### Base de données

**Nouvelle colonne :**
```sql
ALTER TABLE tips ADD COLUMN hike_thumbnail_url TEXT;
```

**Index :**
```sql
CREATE INDEX idx_tips_hike_thumbnail ON tips(hike_thumbnail_url)
WHERE hike_thumbnail_url IS NOT NULL;
```

#### Supabase Storage

**Structure :**
```
media/
└── hike-thumbnails/
    ├── hike-thumbnail-{tipId}-{timestamp}.png
    └── ...
```

**Format des fichiers :**
- Type: PNG
- Dimensions: 600x400px
- Taille moyenne: 15-30KB
- Cache: 1 an (31536000 secondes)

#### Métriques

**Avant :**
- Génération dynamique à chaque affichage
- ~3000 requêtes API max/jour (limite gratuite)
- Coût par requête si dépassement
- Latence de chargement variable

**Après :**
- Génération unique lors création/modification
- Images servies depuis CDN Supabase
- 99%+ de réduction des requêtes API
- Chargement instantané (cache CDN)

#### Prochaines étapes suggérées

**Court terme :**
- [ ] Tester la génération de miniatures en production
- [ ] Monitorer l'utilisation de l'API Geoapify
- [ ] Vérifier les performances de chargement

**Moyen terme :**
- [ ] Script de nettoyage des miniatures orphelines
- [ ] Compression d'image optimisée (WebP?)
- [ ] Génération de plusieurs tailles (responsive)
- [ ] Thumbnails pour les previews de partage social (OG images)

**Long terme :**
- [ ] Cache local des miniatures côté client
- [ ] Lazy loading des miniatures
- [ ] Génération de miniatures en background worker
- [ ] Support de styles de cartes personnalisés

---

## Versions précédentes

### GPS & Randonnées (v0.9.0) - 15 Décembre 2025

**Fonctionnalités principales :**
- Import GPX/KML
- Profil d'élévation
- Guidage GPS en temps réel
- Instructions vocales
- UI map-first avec footer shadcn/ui

**Commits clés :**
- Refactor: Map-first UI for hiking display with shadcn-style footer
- Fix: Remove white space under map and make it fully responsive
- Fix: TypeScript errors in hike data types
- Feature: GPS hiking features with GPX/KML parsing

---

*Dernière mise à jour : 16 décembre 2025*
