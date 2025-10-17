# Section Sécurisée - Guide d'Implémentation

## Récapitulatif de la Fonctionnalité

Une nouvelle fonctionnalité a été ajoutée pour permettre aux gestionnaires de locations de partager des **informations sensibles** de manière sécurisée avec leurs voyageurs ayant une réservation confirmée.

### Informations Protégées

La section sécurisée peut contenir :
- **Localisation exacte** du logement (adresse + carte interactive)
- **Horaires** de check-in et check-out
- **Informations WiFi** (SSID + mot de passe)
- **Instructions d'arrivée** détaillées
- **Informations parking**
- **Informations complémentaires**

### Sécurité

- ✅ **Code d'accès** défini par le gestionnaire
- ✅ **Hachage bcrypt** du code (sécurité maximale)
- ✅ **Rappel de sécurité** dans l'interface : partager uniquement avec les personnes ayant une réservation
- ✅ **Recommandation** de mettre à jour le code régulièrement

---

## 📋 Étapes de Déploiement

### 1. Exécuter la Migration SQL

Connectez-vous à votre interface Supabase et exécutez le SQL suivant dans l'éditeur SQL :

**Fichier** : `supabase/migrations/20251017_add_secure_sections.sql`

```sql
-- Copiez tout le contenu du fichier de migration ici
```

Ou utilisez la Supabase CLI :

```bash
# Si vous avez Supabase CLI installé
npx supabase db push
```

### 2. Vérifier que la Table est Créée

Dans l'interface Supabase, vérifiez que la table `secure_sections` existe avec :
- ✅ Les colonnes correctes
- ✅ Les RLS policies activées
- ✅ L'index sur `client_id`
- ✅ Le trigger `update_secure_sections_updated_at`

### 3. Tester en Développement

```bash
npm run dev
```

#### Test Complet :

1. **Se connecter en tant que gestionnaire** :
   - Cliquez sur "Connexion gestionnaire"
   - Entrez vos identifiants

2. **Activer le mode édition** :
   - Cliquez sur "Mode édition"

3. **Ouvrir le menu de personnalisation** :
   - Cliquez sur "Personnaliser"

4. **Accéder à l'onglet "Infos Sensibles"** :
   - 4ème onglet avec l'icône 🔒

5. **Remplir les informations** :
   - Définir un **code d'accès** (ex: "DEMO2024")
   - Remplir les champs souhaités :
     - Heures de check-in/out
     - Adresse exacte
     - Coordonnées GPS (latitude, longitude)
     - WiFi SSID et mot de passe
     - Instructions d'arrivée
     - Informations parking
     - Infos complémentaires

6. **Sauvegarder** :
   - Cliquez sur "Enregistrer"
   - La page devrait se rafraîchir

7. **Se déconnecter** :
   - Cliquez sur "Déconnexion"

8. **Tester l'accès visiteur** :
   - En bas de la page, une nouvelle section "Informations Réservation" devrait apparaître
   - Un formulaire demande le code d'accès
   - Entrez le code défini précédemment
   - Les informations devraient s'afficher avec une carte interactive

9. **Tester le verrouillage** :
   - Cliquez sur "Verrouiller"
   - Le formulaire de code devrait réapparaître

---

## 🧪 Scénarios de Test Détaillés

### Scénario 1 : Création d'une Section Sécurisée

1. Login en tant que propriétaire ✅
2. Mode édition activé ✅
3. Personnaliser → Infos Sensibles ✅
4. Définir code "TEST123" ✅
5. Remplir tous les champs ✅
6. Sauvegarder ✅
7. Vérifier en DB que l'entrée existe avec hash bcrypt ✅

### Scénario 2 : Modification Sans Changer le Code

1. Login en tant que propriétaire ✅
2. Mode édition activé ✅
3. Personnaliser → Infos Sensibles ✅
4. Laisser le champ "Code d'accès" **vide** ✅
5. Modifier d'autres champs (ex: adresse) ✅
6. Sauvegarder ✅
7. Vérifier que le code précédent fonctionne toujours ✅

### Scénario 3 : Changement de Code

1. Login en tant que propriétaire ✅
2. Mode édition activé ✅
3. Personnaliser → Infos Sensibles ✅
4. Entrer un **nouveau code** (ex: "NOUVEAU2024") ✅
5. Sauvegarder ✅
6. Se déconnecter et tester avec l'ancien code → ❌ Devrait échouer
7. Tester avec le nouveau code → ✅ Devrait fonctionner

### Scénario 4 : Suppression de la Section

1. Login en tant que propriétaire ✅
2. Mode édition activé ✅
3. Personnaliser → Infos Sensibles ✅
4. Cliquer sur "Supprimer la section sécurisée" ✅
5. Confirmer ✅
6. Se déconnecter ✅
7. Vérifier que la section n'apparaît plus sur la page publique ✅

### Scénario 5 : Tentative d'Accès avec Mauvais Code

1. Se déconnecter (ou mode visiteur) ✅
2. Aller en bas de page → Section "Informations Réservation" ✅
3. Entrer un code incorrect (ex: "WRONGCODE") ✅
4. Message d'erreur : "Code d'accès incorrect" ✅

---

## 🛠️ Architecture Technique

### Fichiers Créés/Modifiés

#### Nouveaux Fichiers :

1. **Migration** :
   - `supabase/migrations/20251017_add_secure_sections.sql`

2. **Server Actions** :
   - `lib/actions/secure-section.ts`
     - `verifySecureAccess()` - Vérifie le code
     - `getSecureSection()` - Propriétaire uniquement
     - `getSecureSectionPublic()` - Avec code valide
     - `upsertSecureSection()` - Créer/mettre à jour
     - `deleteSecureSection()` - Supprimer

3. **Composants** :
   - `components/SecureAccessForm.tsx` - Formulaire de code
   - `components/SecureSectionContent.tsx` - Affichage des infos
   - `components/SecureSection.tsx` - Wrapper principal

#### Fichiers Modifiés :

1. **Types** :
   - `types/index.ts` - Ajout des types `SecureSection`, `SecureSectionData`, `SecureSectionWithDetails`

2. **Personnalisation** :
   - `components/CustomizationMenu.tsx` - Ajout de l'onglet "Infos Sensibles"

3. **Page Client** :
   - `app/[slug]/page.tsx` - Chargement des données sécurisées
   - `app/[slug]/WelcomeBookClient.tsx` - Affichage du composant SecureSection

4. **Packages** :
   - `package.json` - Ajout de `bcryptjs` et `@types/bcryptjs`

---

## 🔐 Sécurité Implémentée

### Hachage des Mots de Passe
- Utilisation de **bcryptjs** avec un salt factor de 10
- Le code en clair n'est **jamais stocké** en base de données
- Seul le hash bcrypt est conservé

### Row Level Security (RLS)
- ✅ **SELECT** : Seulement le propriétaire (via email matching)
- ✅ **INSERT** : Seulement le propriétaire
- ✅ **UPDATE** : Seulement le propriétaire
- ✅ **DELETE** : Seulement le propriétaire

### Validation Côté Serveur
- Toutes les opérations sensibles passent par des **Server Actions**
- Vérification de l'ownership avant toute modification
- Le client ne reçoit jamais le hash du code

### Accès Public Sécurisé
- L'accès visiteur passe par `getSecureSectionPublic()`
- Vérifie le code avec bcrypt avant de retourner les données
- Ne retourne jamais le hash du code

---

## 📊 Structure de la Base de Données

### Table `secure_sections`

| Colonne                  | Type      | Description                           |
|--------------------------|-----------|---------------------------------------|
| `id`                     | UUID      | Identifiant unique                    |
| `client_id`              | UUID      | Référence au client (UNIQUE)          |
| `access_code_hash`       | TEXT      | Hash bcrypt du code d'accès           |
| `check_in_time`          | TEXT      | Heure de check-in (ex: "15:00")       |
| `check_out_time`         | TEXT      | Heure de check-out (ex: "11:00")      |
| `arrival_instructions`   | TEXT      | Instructions d'arrivée                |
| `property_address`       | TEXT      | Adresse exacte du logement            |
| `property_coordinates`   | JSONB     | `{"lat": 50.xxx, "lng": 5.xxx}`       |
| `wifi_ssid`              | TEXT      | Nom du réseau WiFi                    |
| `wifi_password`          | TEXT      | Mot de passe WiFi                     |
| `parking_info`           | TEXT      | Informations de parking               |
| `additional_info`        | TEXT      | Informations complémentaires          |
| `created_at`             | TIMESTAMP | Date de création                      |
| `updated_at`             | TIMESTAMP | Date de dernière modification         |

---

## 🚀 Déploiement en Production

### Checklist Avant Déploiement

- [ ] Migration SQL exécutée sur Supabase production
- [ ] Table `secure_sections` créée avec succès
- [ ] RLS policies vérifiées et activées
- [ ] Tests en local réussis (tous les scénarios)
- [ ] Variables d'environnement correctement configurées
- [ ] Build Next.js sans erreurs (`npm run build`)

### Commandes de Déploiement

```bash
# 1. Build le projet
npm run build

# 2. Tester le build localement
npm run start

# 3. Déployer (selon votre plateforme)
# Vercel :
vercel --prod

# Ou commit + push sur GitHub (si auto-deploy activé)
git add .
git commit -m "Add secure section feature"
git push
```

---

## 📞 Support & Dépannage

### Problèmes Courants

#### 1. "Table secure_sections does not exist"
**Solution** : Exécutez la migration SQL dans Supabase

#### 2. "bcryptjs module not found"
**Solution** :
```bash
npm install bcryptjs @types/bcryptjs
```

#### 3. "Non autorisé" lors de la sauvegarde
**Solution** :
- Vérifiez que vous êtes bien connecté
- Vérifiez que l'email de l'utilisateur connecté correspond au client
- Vérifiez les RLS policies dans Supabase

#### 4. "Code d'accès incorrect" même avec le bon code
**Solution** :
- Vérifiez que bcryptjs est bien installé
- Vérifiez les logs serveur pour les erreurs de hash
- Essayez de redéfinir le code d'accès

#### 5. La carte ne s'affiche pas
**Solution** :
- Vérifiez que `property_coordinates` est bien au format `{"lat": number, "lng": number}`
- Vérifiez que latitude et longitude sont des nombres valides
- Vérifiez les erreurs console du navigateur

---

## 🎯 Prochaines Améliorations Possibles

1. **Expiration des codes** : Codes temporaires avec date d'expiration
2. **Codes multiples** : Générer plusieurs codes pour différentes réservations
3. **Historique des accès** : Logger qui accède à la section et quand
4. **Notification email** : Envoyer automatiquement le code par email
5. **QR Code** : Générer un QR code contenant le code d'accès
6. **2FA** : Ajouter une double authentification (email + code)

---

## 📝 Licence et Crédits

Développé pour WelcomeApp - Plateforme de Welcomebooks pour gestionnaires de locations de vacances.

**Technologies utilisées** :
- Next.js 14
- Supabase (PostgreSQL + Auth + Storage)
- bcryptjs pour le hachage sécurisé
- React Leaflet pour les cartes interactives
- Tailwind CSS pour le styling
