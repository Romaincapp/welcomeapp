# 🔧 Fix Simple - Erreur "data error saving new user"

## 🎯 Le problème

Le trigger ne peut pas créer le welcomebook automatiquement à cause des permissions RLS.

## ✅ La solution (1 minute)

### Exécutez ce script dans Supabase :

1. Ouvrez [Supabase SQL Editor](https://supabase.com/dashboard/project/nimbzitahumdefggtiob/sql/new)

2. Copiez-collez le contenu du fichier **`supabase/fix_trigger.sql`**

3. Cliquez sur **Run** ▶️

4. Vous devriez voir : `✅ Trigger corrigé avec succès!`

---

## 🧪 Tester après le fix

1. Retournez sur [http://localhost:3001/signup](http://localhost:3001/signup)

2. Créez un nouveau compte avec un email différent

3. Cette fois, ça devrait fonctionner ! ✅

4. Vous serez redirigé vers `/dashboard`

---

## 📝 Ce que fait le fix

Le script :
- ✅ Supprime l'ancien trigger
- ✅ Recrée la fonction avec `SECURITY DEFINER` (permet de bypasser les RLS)
- ✅ Ajoute une gestion d'erreur (`EXCEPTION`)
- ✅ Recrée le trigger

---

## 🔍 Diagnostic (optionnel)

Si vous voulez vérifier que tout est ok, exécutez aussi :
```
supabase/diagnostic.sql
```

Ça vous montrera :
- Le trigger existe
- La fonction existe
- Les colonnes sont bonnes
- Les policies sont actives

---

## 🆘 Si ça ne marche toujours pas

Essayez cette alternative simple : **Création manuelle après signup**

Au lieu d'utiliser un trigger automatique, on peut créer le welcomebook manuellement dans le code après l'inscription.

Dites-moi si vous voulez cette solution alternative !

---

**Prêt ? Allez-y, exécutez `supabase/fix_trigger.sql` ! 🚀**
