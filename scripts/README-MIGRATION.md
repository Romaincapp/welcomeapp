# Migration des URLs Proxy vers Supabase Storage

## Contexte

Ce script migre automatiquement les images Google Places (URLs proxy `/api/places/photo?photo_reference=...`) vers Supabase Storage (URLs permanentes).

**Problème résolu** : Les URLs proxy Google expirent après quelques heures/jours. Ce script télécharge les images et les réupload vers Supabase Storage pour avoir des URLs permanentes.

---

## Prérequis

1. **Variables d'environnement** (dans `.env.local`) :
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://nimbzitahumdefggtiob.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<votre_service_key>
   ```

2. **Service Role Key** :
   - Aller sur Supabase Dashboard → Project Settings → API
   - Copier la `service_role` key (commence par `eyJ...`)
   - ⚠️ **ATTENTION** : Cette clé bypass les RLS policies, ne jamais la commit !

---

## Utilisation

### Option 1 : Migrer UNIQUEMENT un gestionnaire spécifique

```bash
npx tsx scripts/migrate-proxy-urls-to-storage.ts jumeau_7@hotmail.com
```

**Résultat** : Migre seulement les 6 images du gestionnaire `jumeau_7@hotmail.com`

### Option 2 : Migrer TOUS les gestionnaires

```bash
npx tsx scripts/migrate-proxy-urls-to-storage.ts
```

**Résultat** : Migre TOUTES les URLs proxy trouvées dans la base de données

---

## Ce que fait le script

Pour chaque image avec URL proxy :

1. ✅ **Télécharge** l'image depuis `/api/places/photo?photo_reference=...`
2. ✅ **Vérifie** que c'est bien une image (type MIME)
3. ✅ **Upload** vers Supabase Storage bucket `media` → `tips/[tipId]-migrated-[timestamp].jpg`
4. ✅ **Récupère** l'URL publique permanente
5. ✅ **Met à jour** la table `tip_media` avec la nouvelle URL
6. ✅ **Log** chaque étape avec émojis clairs

---

## Exemple de sortie

```
🚀 Démarrage de la migration des URLs proxy vers Supabase Storage

🎯 Filtre: uniquement pour jumeau_7@hotmail.com

📋 Recherche des médias avec URLs proxy...
📦 6 média(s) à migrer

[1/6] Migration de "DinoPark Algar"
   Client: jumeau_7@hotmail.com
   Media ID: 669f7986-2794-48de-b321-c1ba40c1a5b9
  📥 Téléchargement depuis: https://welcomeapp.be/api/places/photo?photo_reference=...
  ✅ Téléchargé: image/jpeg, 1.2 MB
  📤 Upload vers Storage: tips/a0e32317-aff8-45f7-8153-b6b03c7dfe9f-migrated-1732109876543.jpg
  ✅ URL permanente: https://nimbzitahumdefggtiob.supabase.co/storage/v1/object/public/media/tips/...
  🔄 Mise à jour base de données...
  ✅ Base de données mise à jour
  🎉 Migration réussie!

[2/6] Migration de "Grizzly's World"
   ...

============================================================
📊 RÉSUMÉ DE LA MIGRATION
============================================================
✅ Réussies  : 6
❌ Échouées  : 0
⚠️ Ignorées  : 0
📦 Total     : 6
============================================================

🎉 Migration terminée avec succès!
💡 Les images sont maintenant stockées de manière permanente dans Supabase Storage
```

---

## Gestion des erreurs

Le script gère automatiquement :

- ❌ **Téléchargement échoué** : Skip + continue avec l'image suivante
- ❌ **Upload échoué** : Skip + continue
- ❌ **Update DB échoué** : Skip + continue
- ✅ **Délai 500ms** entre chaque image pour ne pas surcharger l'API
- ✅ **Log détaillé** de chaque erreur

---

## Vérification post-migration

### 1. Vérifier en SQL

```sql
-- Vérifier que les URLs sont bien mises à jour
SELECT
  tm.url,
  CASE
    WHEN tm.url LIKE '/api/places/photo%' THEN '❌ PROXY (PAS MIGRÉ)'
    WHEN tm.url LIKE 'https://nimbzitahumdefggtiob.supabase.co%' THEN '✅ SUPABASE (MIGRÉ)'
    ELSE '⚠️ AUTRE'
  END AS status
FROM tip_media tm
JOIN tips t ON tm.tip_id = t.id
JOIN clients c ON t.client_id = c.id
WHERE c.email = 'jumeau_7@hotmail.com';
```

**Résultat attendu** : Toutes les URLs doivent afficher `✅ SUPABASE (MIGRÉ)`

### 2. Vérifier dans le welcomebook

Ouvrir : `https://welcomeapp.be/los-gemelos-del-penon`

**Résultat attendu** : Toutes les images doivent s'afficher correctement

---

## Rollback (si problème)

Si la migration échoue, les anciennes URLs proxy sont conservées jusqu'à ce que la mise à jour DB réussisse.

**Aucun risque de perte de données** : Le script ne supprime jamais rien, il ne fait qu'UPDATE les URLs.

---

## Notes techniques

- **Service Key** : Utilise `SUPABASE_SERVICE_ROLE_KEY` pour bypass les RLS policies
- **Bucket** : Upload vers `media` (bucket public)
- **Path** : `tips/[tipId]-migrated-[timestamp].[ext]`
- **Cache** : `Cache-Control: 3600` (1 heure)
- **Sécurité** : Valide que le blob est bien une image avant upload

---

## Troubleshooting

### Erreur "Variables d'environnement manquantes"

```bash
❌ Variables d'environnement manquantes :
   SUPABASE_SERVICE_ROLE_KEY
```

**Solution** : Ajouter `SUPABASE_SERVICE_ROLE_KEY` dans `.env.local`

### Erreur "404 Not Found" lors du téléchargement

```
❌ Erreur HTTP 404: Not Found
```

**Cause** : L'URL proxy Google a expiré (photo_reference invalide)

**Solution** : Ces images ne peuvent pas être récupérées. Le gestionnaire devra les réimporter manuellement.

### Erreur "Upload failed"

```
❌ Erreur upload Storage: { message: "..." }
```

**Causes possibles** :
- Quota Storage Supabase dépassé
- Permissions bucket incorrectes
- Nom de fichier en conflit

**Solution** : Vérifier les logs Supabase Dashboard → Storage
