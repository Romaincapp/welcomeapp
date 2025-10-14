# Test de connexion MCP Supabase

Ce document contient des commandes de test pour vérifier que votre configuration MCP Supabase fonctionne correctement.

## Étapes préalables

1. **Redémarrez Claude Desktop** complètement (fermez et rouvrez l'application)
2. Attendez quelques secondes que les serveurs MCP se lancent
3. Ouvrez cette conversation dans Claude Desktop

## Tests à effectuer

### Test 1: Lister les tables existantes
Demandez à Claude:
```
Utilise l'outil MCP Supabase pour lister toutes les tables de ma base de données
```

**Résultat attendu**: Une liste de vos tables (clients, categories, tips, tip_media, footer_buttons, etc.)

---

### Test 2: Vérifier la structure d'une table
Demandez à Claude:
```
Utilise l'outil MCP pour décrire la structure de la table 'clients'
```

**Résultat attendu**: Liste des colonnes avec leurs types (id, name, slug, email, header_color, etc.)

---

### Test 3: Compter les enregistrements
Demandez à Claude:
```
Utilise l'outil MCP pour compter le nombre d'enregistrements dans chaque table
```

**Résultat attendu**: Un décompte pour chaque table

---

### Test 4: Exécuter une requête simple
Demandez à Claude:
```
Utilise l'outil MCP pour exécuter cette requête SQL:
SELECT name, slug, email FROM clients LIMIT 5;
```

**Résultat attendu**: Les 5 premiers clients (si vous en avez)

---

### Test 5: Créer une table de test
Demandez à Claude:
```
Utilise l'outil MCP pour créer une table de test nommée 'mcp_test' avec une colonne 'id' uuid et une colonne 'message' text
```

**Résultat attendu**: Confirmation de création de la table

---

### Test 6: Insérer des données de test
Demandez à Claude:
```
Utilise l'outil MCP pour insérer un enregistrement de test dans la table 'mcp_test' avec le message 'MCP fonctionne!'
```

**Résultat attendu**: Confirmation d'insertion

---

### Test 7: Vérifier l'insertion
Demandez à Claude:
```
Utilise l'outil MCP pour sélectionner tous les enregistrements de la table 'mcp_test'
```

**Résultat attendu**: Le message 'MCP fonctionne!' devrait apparaître

---

### Test 8: Nettoyer
Demandez à Claude:
```
Utilise l'outil MCP pour supprimer la table 'mcp_test'
```

**Résultat attendu**: Confirmation de suppression

---

## Diagnostic des problèmes

### Si les outils MCP ne sont pas disponibles:

1. Vérifiez que le fichier de configuration est correct:
   - Chemin: `C:\Users\Maison\AppData\Roaming\Claude\claude_desktop_config.json`
   - Doit contenir: `"command": "npx"` et `"args": ["-y", "@supabase/mcp-server"]`

2. Vérifiez que npx est installé:
   ```bash
   where npx
   ```

3. Vérifiez les logs de Claude Desktop:
   - Windows: `%APPDATA%\Claude\logs`
   - Cherchez les erreurs liées à MCP

4. Testez manuellement le serveur MCP:
   ```bash
   npx -y @supabase/mcp-server
   ```
   (Ctrl+C pour arrêter)

### Si vous obtenez des erreurs d'authentification:

1. Vérifiez que votre `SUPABASE_URL` est correcte:
   ```
   https://nimbzitahumdefggtiob.supabase.co
   ```

2. Vérifiez que votre `SUPABASE_SERVICE_ROLE_KEY` est valide:
   - Allez sur https://supabase.com/dashboard/project/nimbzitahumdefggtiob/settings/api
   - Comparez la clé dans le dashboard avec celle dans votre config

### Si les requêtes échouent:

1. Vérifiez les RLS (Row Level Security) policies sur vos tables
2. La service_role_key devrait bypasser les RLS, mais vérifiez quand même

---

## Commande rapide de test tout-en-un

Copiez-collez ceci dans Claude Desktop après le redémarrage:

```
Bonjour! Je viens de redémarrer Claude Desktop après avoir configuré le MCP Supabase.
Peux-tu:
1. Vérifier que tu as accès aux outils MCP Supabase (cherche les outils qui commencent par 'mcp__supabase__')
2. Lister toutes mes tables
3. Me donner un résumé de ma base de données (nombre de tables, nombre d'enregistrements par table)
```

---

## Outils MCP Supabase disponibles

Une fois configuré, vous devriez avoir accès à ces outils:

- `mcp__supabase__query` - Exécuter des requêtes SQL
- `mcp__supabase__list_tables` - Lister les tables
- `mcp__supabase__describe_table` - Décrire une table
- `mcp__supabase__create_table` - Créer une table
- `mcp__supabase__insert` - Insérer des données
- `mcp__supabase__update` - Mettre à jour des données
- `mcp__supabase__delete` - Supprimer des données
- `mcp__supabase__storage_*` - Gérer le stockage
- Et bien d'autres...

---

## Notes importantes

- Les outils MCP ont des permissions complètes (service_role_key)
- Soyez prudent avec les opérations de suppression
- Les modifications sont immédiates et irréversibles
- Testez d'abord sur des données de test avant de toucher aux données de production

---

## Succès!

Si tous les tests passent, votre configuration MCP est opérationnelle et Claude pourra:
- Créer et modifier des tables
- Gérer vos données
- Configurer les RLS policies
- Gérer le stockage
- Et bien plus encore, directement depuis la conversation!

Bon test! 🚀
