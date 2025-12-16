# Système de Miniatures de Cartes pour Randonnées

## Vue d'ensemble

Ce système génère automatiquement des miniatures de cartes statiques pour les randonnées GPS, optimisant ainsi les coûts API en stockant les images dans Supabase Storage au lieu de les générer à chaque affichage.

### Réduction des coûts
- **Avant** : Génération dynamique à chaque affichage de page (~3000 requêtes/jour max gratuit)
- **Après** : Génération unique lors de la création/modification (~99%+ de réduction)
- **Stockage** : Images PNG compressées (~10-50KB chacune)

## Architecture

### Composants principaux

1. **lib/generate-hike-thumbnail.ts** : Fonctions de génération et gestion des miniatures
2. **components/HikeMapSnapshot.tsx** : Composant d'affichage des miniatures statiques
3. **components/TipCard.tsx** : Affichage des miniatures dans les cartes de conseils
4. **scripts/regenerate-hike-thumbnails.ts** : Script de migration pour randonnées existantes

### Flux de données

```
GPX/KML Upload
    ↓
Waypoints extraits
    ↓
generateAndUploadHikeThumbnail()
    ↓
API Geoapify (carte statique)
    ↓
Supabase Storage (media/hike-thumbnails/)
    ↓
URL stockée dans tips.hike_thumbnail_url
    ↓
Affichage sur TipCard
```

## Configuration

### Variables d'environnement

```bash
# .env.local
NEXT_PUBLIC_GEOAPIFY_API_KEY=your_api_key_here
```

### Base de données

```sql
-- Ajout de la colonne hike_thumbnail_url
ALTER TABLE tips ADD COLUMN IF NOT EXISTS hike_thumbnail_url TEXT;

COMMENT ON COLUMN tips.hike_thumbnail_url IS 'URL de la miniature de carte générée pour les randonnées (stockée dans Supabase Storage)';

CREATE INDEX IF NOT EXISTS idx_tips_hike_thumbnail ON tips(hike_thumbnail_url) WHERE hike_thumbnail_url IS NOT NULL;
```

### Supabase Storage

- **Bucket** : `media`
- **Dossier** : `hike-thumbnails/`
- **Format** : `hike-thumbnail-{tipId}-{timestamp}.png`
- **Permissions** : Public (lecture seule)

## API Geoapify

### Format de l'URL

```
https://maps.geoapify.com/v1/staticmap?
  style=osm-carto
  &width=600
  &height=400
  &center=lonlat:{lng},{lat}
  &zoom={zoom}
  &marker=lonlat:{startLng},{startLat};color:%23059669;size:medium
  &marker=lonlat:{endLng},{endLat};color:%23dc2626;size:medium
  &path=lonlat:{lng1},{lat1}|{lng2},{lat2}|...;linecolor:%232563eb;linewidth:5
  &apiKey={apiKey}
```

### Paramètres

- **Style** : `osm-carto` (OpenStreetMap)
- **Dimensions** : 600x400px
- **Markers** :
  - Départ : Vert (#059669)
  - Arrivée : Rouge (#dc2626)
- **Path** : Bleu électrique (#2563eb), largeur 5px
- **Simplification** : Max 10 points pour éviter URLs trop longues

### Calcul du zoom

```javascript
const maxDiff = Math.max(latDiff, lngDiff)

let zoom = 12
if (maxDiff > 0.5) zoom = 9
else if (maxDiff > 0.2) zoom = 10
else if (maxDiff > 0.1) zoom = 11
else if (maxDiff > 0.05) zoom = 12
else zoom = 13
```

## Utilisation

### 1. Génération automatique (nouveaux tips)

La miniature est générée automatiquement dans :

#### AddTipModal.tsx
```typescript
if (tip && hikeData && hikeData.waypoints && hikeData.waypoints.length > 0) {
  const thumbnailResult = await generateAndUploadHikeThumbnail(hikeData.waypoints, tip.id)

  if (thumbnailResult.success && thumbnailResult.url) {
    await supabase
      .from('tips')
      .update({ hike_thumbnail_url: thumbnailResult.url })
      .eq('id', tip.id)
  }
}
```

#### EditTipModal.tsx
```typescript
// Suppression de l'ancienne miniature
if (oldHikeThumbnailUrl) {
  await deleteHikeThumbnail(oldHikeThumbnailUrl)
}

// Génération de la nouvelle miniature
const thumbnailResult = await generateAndUploadHikeThumbnail(waypoints, tip.id)
```

### 2. Affichage dans TipCard

```typescript
// Priorité : miniature stockée > génération dynamique > aucune
const hikeThumbnailUrl = (tip as any).hike_thumbnail_url
const staticMapUrl = !mainMedia && hasWaypoints ? (
  hikeThumbnailUrl || (hikeData.waypoints ? generateStaticMapUrl(hikeData.waypoints, 400, 300) : null)
) : null
```

### 3. Migration des tips existants

```bash
# Exécuter le script de migration
npx tsx scripts/regenerate-hike-thumbnails.ts
```

Ce script :
- Charge toutes les randonnées avec `hike_data`
- Ignore celles qui ont déjà une miniature
- Génère et upload les miniatures manquantes
- Met à jour la base de données
- Pause de 1 seconde entre chaque génération

## Fonctions principales

### generateAndUploadHikeThumbnail()

```typescript
async function generateAndUploadHikeThumbnail(
  waypoints: HikeWaypoint[],
  tipId: string,
  supabaseClient?: SupabaseClient
): Promise<GenerateThumbnailResult>
```

**Paramètres** :
- `waypoints` : Points GPS de l'itinéraire
- `tipId` : ID du tip pour nommer le fichier
- `supabaseClient` : Client Supabase optionnel (pour scripts avec service role key)

**Retour** :
```typescript
{
  success: boolean
  url?: string      // URL publique de la miniature
  error?: string    // Message d'erreur si échec
}
```

**Processus** :
1. Calcul des bounds (min/max lat/lng)
2. Calcul du centre et du zoom
3. Simplification du path (max 10 points)
4. Génération de l'URL Geoapify
5. Fetch de l'image depuis l'API
6. Upload vers Supabase Storage
7. Retour de l'URL publique

### deleteHikeThumbnail()

```typescript
async function deleteHikeThumbnail(url: string): Promise<void>
```

**Paramètres** :
- `url` : URL complète de la miniature à supprimer

**Processus** :
1. Extraction du path depuis l'URL
2. Suppression du fichier dans Storage
3. Logging du résultat

### generateStaticMapUrl()

```typescript
function generateStaticMapUrl(
  waypoints: HikeWaypoint[],
  width: number = 800,
  height: number = 600
): string
```

**Utilisation** : Génération d'URL à la volée (fallback si pas de miniature stockée)

## Logs et débogage

### Console logs

```javascript
// Génération
[GenerateThumbnail] Fetching image from: https://...
[GenerateThumbnail] Successfully uploaded to: https://...

// Erreurs
[GenerateThumbnail] API Error: {...}
[GenerateThumbnail] Upload error: {...}

// Suppression
[DeleteThumbnail] Successfully deleted: hike-thumbnails/...
```

### Script de migration

```
🗺️  Démarrage de la régénération des miniatures de cartes...
📊 Récupération des randonnées...
📍 23 randonnée(s) trouvée(s)

🔄 [tip-id] Nom de la randonnée - Génération en cours...
✅ [tip-id] Miniature générée: https://...

⏭️  [tip-id] Nom de la randonnée - Miniature déjà existante, ignoré
❌ [tip-id] Échec de génération: error message

🎉 Régénération terminée!
✅ Succès: 23
⏭️  Ignorés: 0
❌ Erreurs: 0
```

## Gestion des erreurs

### Erreurs API Geoapify

```typescript
if (!imageResponse.ok) {
  const errorText = await imageResponse.text()
  console.error('[GenerateThumbnail] API Error:', errorText)
  throw new Error(`Failed to fetch image: ${imageResponse.statusText} - ${errorText}`)
}
```

**Causes possibles** :
- URL trop longue (> limite API)
- Clé API invalide
- Rate limit dépassé
- Coordonnées invalides

### Erreurs Supabase Storage

```typescript
if (error) {
  console.error('[GenerateThumbnail] Upload error:', error)
  return { success: false, error: error.message }
}
```

**Causes possibles** :
- Bucket inexistant
- Permissions RLS (utiliser service role key)
- Quota de stockage dépassé
- Fichier trop volumineux

## Optimisations

### Simplification du path

```typescript
// Réduction à max 10 points pour éviter URLs trop longues
const step = Math.max(1, Math.floor(waypoints.length / 10))
const simplifiedPoints = waypoints.filter((_, i) => i % step === 0 || i === waypoints.length - 1)
```

### Cache

```typescript
cacheControl: '31536000' // 1 an de cache
```

### Pas de duplication

```typescript
// Vérification avant génération
if (tip.hike_thumbnail_url) {
  console.log(`⏭️  Miniature déjà existante, ignoré`)
  continue
}
```

## Maintenance

### Nettoyage des miniatures orphelines

```bash
# À implémenter : script pour supprimer les miniatures dont le tip a été supprimé
# Vérifier media/hike-thumbnails/* vs tips.hike_thumbnail_url
```

### Régénération forcée

Pour forcer la régénération d'une miniature :
1. Supprimer `hike_thumbnail_url` dans la base de données
2. Éditer le tip dans l'interface (déclenchera la régénération)

Ou via script :
```typescript
const result = await generateAndUploadHikeThumbnail(waypoints, tipId, supabase)
await supabase
  .from('tips')
  .update({ hike_thumbnail_url: result.url })
  .eq('id', tipId)
```

## Métriques de succès

### Migration initiale (16 déc 2025)
- **Tips traités** : 23
- **Succès** : 23 (100%)
- **Erreurs** : 0
- **Temps moyen** : ~4 secondes par miniature
- **Taille moyenne** : ~15-30KB par image

### Économies estimées
- **Requêtes API évitées** : ~2000-3000/jour
- **Coût API** : Réduit de 99%+
- **Espace Storage** : ~500KB pour 23 randonnées
- **Performance** : Images servies depuis CDN Supabase

## Références

- [Geoapify Static Maps API](https://apidocs.geoapify.com/docs/maps/static-maps-api/)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- Code source : `lib/generate-hike-thumbnail.ts`
