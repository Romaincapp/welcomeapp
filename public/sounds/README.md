# Sons pour les Animations

Ce dossier contient les fichiers audio pour les animations du mode édition.

## Fichiers Requis

### 1. `success.mp3`
- **Usage** : Ajout d'un conseil
- **Durée recommandée** : 100-300ms
- **Style** : Son joyeux, positif (ding, chime)
- **Exemple** : Notification de succès

### 2. `badge.mp3`
- **Usage** : Déblocage de badge
- **Durée recommandée** : 300-500ms
- **Style** : Fanfare courte, achievement unlock
- **Exemple** : Jingle de victoire

### 3. `delete.mp3`
- **Usage** : Suppression d'un conseil (poof)
- **Durée recommandée** : 100-200ms
- **Style** : Poof cartoon, swoosh
- **Exemple** : Effet de disparition

### 4. `flip.mp3`
- **Usage** : Modification d'un conseil (flip 3D)
- **Durée recommandée** : 100-200ms
- **Style** : Whoosh subtil
- **Exemple** : Carte qui se retourne

## Sources Recommandées

- **Freesound.org** (licence Creative Commons)
- **Zapsplat.com** (gratuit avec attribution)
- **Mixkit.co/free-sound-effects** (gratuit, pas d'attribution requise)
- **Pixabay.com/sound-effects** (gratuit)

## Format

- Format : MP3
- Bitrate : 128 kbps (suffisant pour des effets courts)
- Sample rate : 44.1 kHz
- Taille cible : < 10KB par fichier

## Test

Pour tester les sons, ouvrez la console navigateur et tapez :
```javascript
new Audio('/sounds/success.mp3').play()
```

## Désactivation

Les sons peuvent être désactivés dans les paramètres utilisateur (Settings).
