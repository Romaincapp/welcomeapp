# Amélioration : Sélection de Localisation via Carte Interactive

## 🎯 Fonctionnalité Ajoutée

Dans le **mode édition > Personnaliser > Infos Sensibles**, les gestionnaires peuvent désormais :

✅ **Rechercher une adresse** dans la barre de recherche
✅ **Cliquer directement sur la carte** pour placer le marqueur
✅ **Géocodage inversé automatique** : l'adresse se remplit automatiquement
✅ **Visualisation en temps réel** des coordonnées GPS sélectionnées
✅ **Réinitialisation facile** d'un simple clic

---

## 🛠️ Modifications Techniques

### Fichiers Modifiés

#### 1. [components/MapPicker.tsx](components/MapPicker.tsx)

**Améliorations** :
- ✅ Ajout d'une **barre de recherche d'adresse**
- ✅ Intégration de **l'API Nominatim** (OpenStreetMap) pour le géocodage
- ✅ **Géocodage inversé** : clic sur la carte → adresse automatique
- ✅ Affichage des **coordonnées sélectionnées** en temps réel
- ✅ Bouton **Réinitialiser** pour supprimer la position
- ✅ **Instructions visuelles** pour guider l'utilisateur
- ✅ **Gestion d'erreurs** pour les recherches infructueuses

**Nouvelles Props** :
```typescript
interface MapPickerProps {
  initialLat?: number
  initialLng?: number
  onLocationSelect: (lat: number, lng: number) => void
  onAddressFound?: (address: string) => void  // ← NOUVELLE
}
```

#### 2. [components/CustomizationMenu.tsx](components/CustomizationMenu.tsx)

**Modifications** :
- ✅ **Suppression des champs manuels** latitude/longitude
- ✅ **Intégration du MapPicker** avec recherche d'adresse
- ✅ **Synchronisation automatique** : carte → adresse
- ✅ Champ adresse **modifiable manuellement** si besoin

**Code Avant** :
```typescript
{/* Deux inputs manuels pour lat/lng */}
<input type="number" placeholder="Latitude" />
<input type="number" placeholder="Longitude" />
```

**Code Après** :
```typescript
{/* MapPicker interactif avec recherche */}
<MapPicker
  initialLat={securePropertyCoordinates?.lat}
  initialLng={securePropertyCoordinates?.lng}
  onLocationSelect={(lat, lng) => {
    setSecurePropertyCoordinates({ lat, lng })
  }}
  onAddressFound={(address) => {
    setSecurePropertyAddress(address)
  }}
/>
```

---

## 🎨 Interface Utilisateur

### Nouvelle Section "Localisation"

```
┌─────────────────────────────────────────────────────┐
│ 🗺️ Localisation précise du logement                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ 🔍 Rechercher une adresse...        [Chercher]│   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ℹ️ Astuce : Recherchez une adresse ou cliquez      │
│    directement sur la carte pour placer le         │
│    marqueur à l'emplacement exact.                 │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │                                             │   │
│ │          [CARTE INTERACTIVE]                │   │
│ │              📍 Marqueur                     │   │
│ │                                             │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ✅ Position sélectionnée :                          │
│    Lat: 50.123456 | Lng: 5.678901  [Réinitialiser] │
│                                                     │
│ ℹ️ Utilisez la molette pour zoomer et faites       │
│    glisser pour vous déplacer sur la carte         │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Adresse exacte du logement                          │
├─────────────────────────────────────────────────────┤
│ Rue du Marché 15, 5000 Namur, Belgique            │
│ ℹ️ L'adresse est automatiquement remplie lorsque   │
│    vous sélectionnez une position sur la carte      │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Fonctionnement

### Scénario 1 : Recherche par Adresse

1. **Utilisateur tape** : "Rue du Marché 15, Namur"
2. **Clic sur "Chercher"**
3. **API Nominatim** géocode l'adresse
4. **Carte se centre** sur la position trouvée
5. **Marqueur se place** automatiquement
6. **Coordonnées s'affichent** (Lat/Lng)
7. **Champ adresse se remplit** avec le résultat complet

### Scénario 2 : Clic Direct sur la Carte

1. **Utilisateur clique** n'importe où sur la carte
2. **Marqueur se place** à l'endroit du clic
3. **API reverse geocoding** (Nominatim) interrogée
4. **Champ adresse se remplit** automatiquement
5. **Coordonnées GPS s'affichent**

### Scénario 3 : Modification Manuelle

1. **Utilisateur modifie** le champ adresse manuellement
2. **Coordonnées restent inchangées**
3. **Peut re-rechercher** avec la barre de recherche si besoin

---

## 🔧 API Utilisée : Nominatim (OpenStreetMap)

### Géocodage (Adresse → Coordonnées)

**Endpoint** :
```
https://nominatim.openstreetmap.org/search
```

**Paramètres** :
- `format=json` : Réponse en JSON
- `q={adresse}` : Adresse à géocoder
- `countrycodes=be,fr,nl,de,lu` : Limité aux pays européens
- `limit=1` : Un seul résultat

**Exemple de requête** :
```
https://nominatim.openstreetmap.org/search?format=json&q=Rue+du+Marché+15+Namur&countrycodes=be&limit=1
```

**Exemple de réponse** :
```json
[
  {
    "lat": "50.4673",
    "lon": "4.8719",
    "display_name": "15, Rue du Marché, Namur, 5000, Belgique"
  }
]
```

### Géocodage Inversé (Coordonnées → Adresse)

**Endpoint** :
```
https://nominatim.openstreetmap.org/reverse
```

**Paramètres** :
- `format=json` : Réponse en JSON
- `lat={latitude}` : Latitude
- `lon={longitude}` : Longitude
- `zoom=18` : Niveau de précision
- `addressdetails=1` : Détails de l'adresse

**Exemple de requête** :
```
https://nominatim.openstreetmap.org/reverse?format=json&lat=50.4673&lon=4.8719&zoom=18&addressdetails=1
```

**Exemple de réponse** :
```json
{
  "display_name": "15, Rue du Marché, Centre-ville, Namur, 5000, Wallonie, Belgique",
  "address": {
    "house_number": "15",
    "road": "Rue du Marché",
    "city": "Namur",
    "postcode": "5000",
    "country": "Belgique"
  }
}
```

### Politiques d'Utilisation Nominatim

⚠️ **Important** : Nominatim est un service gratuit avec des limites :

- ✅ **1 requête par seconde maximum**
- ✅ **Usage personnel/petits sites OK**
- ❌ **Pas de cache côté client** (respect du rate limiting)
- ✅ **Attribution OpenStreetMap requise** (déjà présente dans le code)

**Pour un usage en production** :
- Envisager un service payant (Google Maps API, Mapbox, etc.)
- Ou héberger votre propre instance Nominatim

---

## 📋 Guide d'Utilisation pour les Gestionnaires

### Étape 1 : Accéder au Mode Édition

1. Connectez-vous à votre welcomebook
2. Activez le **Mode édition**
3. Cliquez sur **Personnaliser**
4. Allez dans l'onglet **Infos Sensibles** (🔒)

### Étape 2 : Définir la Localisation

**Option A : Recherche par adresse**
1. Tapez l'adresse dans la barre de recherche
2. Cliquez sur **Chercher**
3. Vérifiez le marqueur sur la carte
4. Si la position est correcte, c'est tout !

**Option B : Clic direct**
1. Zoomez sur votre quartier
2. Cliquez exactement sur votre logement
3. L'adresse se remplit automatiquement

**Option C : Ajustement fin**
1. Recherchez l'adresse approximative
2. Zoomez au maximum (molette de la souris)
3. Cliquez pour placer le marqueur précisément

### Étape 3 : Vérifier et Sauvegarder

1. **Vérifiez** les coordonnées affichées
2. **Vérifiez** l'adresse remplie
3. **Modifiez** l'adresse manuellement si besoin
4. Cliquez sur **Enregistrer**

---

## 🧪 Tests à Effectuer

### Test 1 : Recherche d'Adresse Valide

```
Input: "Grand Place, Bruxelles"
Résultat attendu:
- Carte se centre sur la Grand Place
- Marqueur placé
- Coordonnées: ~50.8467, 4.3525
- Adresse: "Grand Place, 1000 Bruxelles, Belgique"
```

### Test 2 : Recherche d'Adresse Introuvable

```
Input: "xyzabc123nonexistent"
Résultat attendu:
- Message d'erreur: "Adresse introuvable. Essayez une autre formulation."
- Carte ne bouge pas
- Pas de marqueur placé
```

### Test 3 : Clic sur la Carte

```
Action: Cliquer au hasard sur la carte
Résultat attendu:
- Marqueur se place
- Coordonnées s'affichent
- Champ adresse se remplit (quelques secondes)
```

### Test 4 : Réinitialisation

```
Action: Cliquer sur "Réinitialiser"
Résultat attendu:
- Marqueur disparaît
- Coordonnées cachées
- Champ adresse garde sa valeur (modification manuelle possible)
```

### Test 5 : Zoom et Déplacement

```
Action:
1. Molette vers le haut (zoom in)
2. Molette vers le bas (zoom out)
3. Clic-glisser pour déplacer
Résultat attendu:
- Carte réagit normalement
- Pas de ralentissements
- Marqueur reste en place
```

---

## 🐛 Débogage

### Problème : La carte ne s'affiche pas

**Causes possibles** :
- Leaflet CSS non chargé
- Dynamic import échoué côté serveur

**Solution** :
```typescript
// Vérifier que le MapPicker est bien chargé dynamiquement
const MapPicker = dynamic(
  () => import('./MapPicker'),
  { ssr: false }  // ← Important !
)
```

### Problème : Erreur "CORS" lors de la recherche

**Cause** : Nominatim bloque les requêtes cross-origin

**Solution** :
- Vérifier que le User-Agent est défini
- Respecter le rate limiting (1 req/sec)
- Envisager un proxy si besoin

### Problème : Adresse ne se remplit pas après clic

**Cause** : Géocodage inversé échoue

**Solution** :
- Vérifier la console pour les erreurs réseau
- Tester manuellement l'API Nominatim
- Ajouter un fallback si l'API échoue

---

## 🎓 Améliorations Futures Possibles

1. **Sauvegarde de favoris** : Enregistrer des adresses fréquentes
2. **Multi-marqueurs** : Placer plusieurs points d'intérêt
3. **Dessin sur la carte** : Tracer un itinéraire
4. **Couches personnalisées** : Satellite, terrain, etc.
5. **Import GPX/KML** : Importer des fichiers de localisation
6. **Street View** : Intégrer Google Street View pour visualiser
7. **API Google Maps** : Alternative payante plus précise

---

## 📚 Ressources

- **React Leaflet** : https://react-leaflet.js.org/
- **Leaflet.js** : https://leafletjs.com/
- **Nominatim API** : https://nominatim.org/release-docs/latest/api/Search/
- **OpenStreetMap** : https://www.openstreetmap.org/

---

## ✅ Résumé

| Avant | Après |
|-------|-------|
| 2 champs manuels (lat, lng) | Carte interactive + recherche |
| Fastidieux à utiliser | Intuitif et rapide |
| Risque d'erreur de saisie | Sélection précise garantie |
| Pas de visualisation | Visualisation en temps réel |
| Adresse séparée | Adresse auto-remplie |

---

**🚀 La sélection de localisation est maintenant beaucoup plus intuitive et professionnelle !**
