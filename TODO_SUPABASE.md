# ⚡ Action requise - Configuration Supabase

## Une seule étape pour activer l'édition

### 📋 Exécuter le script SQL (1 minute)

1. Ouvrez votre dashboard Supabase :
   ```
   https://supabase.com/dashboard/project/nimbzitahumdefggtiob
   ```

2. Cliquez sur **SQL Editor** dans le menu de gauche

3. Cliquez sur **New query**

4. Ouvrez le fichier `supabase/setup_auth_policies.sql` dans VS Code

5. Copiez TOUT le contenu du fichier

6. Collez-le dans l'éditeur SQL de Supabase

7. Cliquez sur **Run** ▶️

8. Vous devriez voir :
   ```
   Configuration des permissions terminée avec succès!
   ```

---

## ✅ C'est tout !

Maintenant vous pouvez :

### 1. Créer un compte
```
http://localhost:3001/signup
```

### 2. Se connecter
```
http://localhost:3001/login
```

### 3. Éditer le welcomebook demo
```
http://localhost:3001/demo
→ Cliquez sur "Mode édition"
→ Testez l'ajout/modification/suppression de conseils
```

---

## 🔍 Que fait ce script ?

Le script configure automatiquement :

✅ Le bucket Storage "media" (pour les images)
✅ Les permissions de lecture publique
✅ Les permissions d'écriture pour les users authentifiés
✅ Les policies RLS sur toutes les tables
✅ La sécurité pour les opérations CRUD

---

## 📝 Notes importantes

- Vous ne devez exécuter ce script **qu'une seule fois**
- Si vous l'exécutez plusieurs fois, pas de problème (il recrée les policies)
- Sans ce script, vous pourrez consulter mais pas éditer
- Après l'exécution, refresh votre page

---

## 🆘 Problème ?

Si vous avez une erreur :

1. Vérifiez que vous êtes bien connecté à votre projet Supabase
2. Vérifiez que votre projet ID est bien `nimbzitahumdefggtiob`
3. Essayez de copier-coller le script section par section

---

Pour plus d'infos, consultez [QUICK_START.md](./QUICK_START.md)
