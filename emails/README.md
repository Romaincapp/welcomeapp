# Email Templates (React Email)

Ce dossier contient tous les templates d'emails pour les campagnes marketing de WelcomeApp.

## Structure

```
/emails
  ├── README.md                     # Ce fichier
  ├── index.ts                      # Exports de tous les templates
  ├── _components/                  # Composants réutilisables
  │   ├── EmailLayout.tsx           # Layout de base (header, footer, styles)
  │   └── EmailButton.tsx           # Bouton CTA personnalisé
  └── templates/                    # Templates d'emails
      ├── WelcomeEmail.tsx          # Bienvenue nouveaux gestionnaires
      ├── InactiveReactivation.tsx  # Relance gestionnaires inactifs
      ├── FeatureAnnouncement.tsx   # Annonce nouvelles fonctionnalités
      ├── Newsletter.tsx            # Newsletter mensuelle
      └── TipsReminder.tsx          # Rappel d'ajouter des tips
```

## Utilisation

### Import d'un template

```typescript
import { WelcomeEmail } from '@/emails';

// Dans une API Route
const emailHtml = render(WelcomeEmail({
  managerName: 'Jean',
  slug: 'ma-villa-corse'
}));
```

### Créer un nouveau template

1. Créer un fichier dans `templates/` (ex: `NewTemplate.tsx`)
2. Utiliser `EmailLayout` comme base
3. Exporter le composant dans `index.ts`
4. Typer les props avec TypeScript

### Preview en local

```bash
# Lancer le serveur de preview React Email
npm run email:dev

# Exporter tous les emails en HTML
npm run email:export
```

## Conventions

- **Nommage** : PascalCase pour les fichiers (ex: `WelcomeEmail.tsx`)
- **Props** : Toujours typer avec une interface (ex: `WelcomeEmailProps`)
- **Styling** : Inline styles uniquement (compatibilité email clients)
- **Images** : Toujours hébergées en externe (pas de base64)
- **Liens** : Toujours HTTPS + paramètres UTM pour tracking

## Compatibilité

Tous les templates sont testés sur :
- Gmail (desktop + mobile)
- Outlook (desktop + web)
- Apple Mail (macOS + iOS)
- Yahoo Mail
- ProtonMail

## Documentation

- React Email: https://react.email/docs
- Resend: https://resend.com/docs
