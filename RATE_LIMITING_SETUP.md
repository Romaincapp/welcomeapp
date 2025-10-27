# 🛡️ Configuration du Rate Limiting (Anti-spam IA)

## 📝 Appliquer la migration SQL

⚠️ **IMPORTANT** : Tu DOIS appliquer cette migration pour que le rate limiting fonctionne !

### Étape 1 : Aller sur le Dashboard Supabase

1. Va sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionne ton projet (`nimbzitahumdefggtiob`)
3. Dans le menu latéral, clique sur **"SQL Editor"**

### Étape 2 : Copier-coller le SQL

1. Clique sur **"New query"**
2. Copie **TOUT** le contenu du fichier [supabase/migrations/20251027_add_ai_generation_logs.sql](supabase/migrations/20251027_add_ai_generation_logs.sql)
3. Colle-le dans l'éditeur SQL
4. Clique sur **"Run"** (ou `Ctrl+Enter`)

### Étape 3 : Vérifier que c'est bien appliqué

Tu devrais voir :
```
Success. No rows returned
```

### Étape 4 : Relancer le serveur

```bash
npm run dev
```

✅ **C'est fait !** Le rate limiting est maintenant actif !

---

## 🔍 Comment ça fonctionne ?

### 🛡️ Protection multi-niveaux

1. **Cooldown de 5 minutes**
   - Minimum 5 minutes entre 2 générations massives
   - Timer en temps réel affiché à l'utilisateur
   - Bouton désactivé pendant le cooldown

2. **Quota quotidien : 100 générations/jour**
   - Compte chaque tip généré
   - Réinitialisation automatique après 24h
   - Affichage du quota utilisé

3. **Logs en base de données**
   - Chaque génération est enregistrée
   - Tracke le provider utilisé (batch, OpenAI, Groq, etc.)
   - Analytics disponibles pour stats

---

## 🎯 Interface utilisateur

### Banner Dashboard (AICommentsBanner)

**Scénario 1 : Aucun rate limit**
```
┌─────────────────────────────────────────────────┐
│ ✨ Améliorez vos conseils avec l'IA !           │
│                                                 │
│ Vous avez 15 conseils avec des avis Google     │
│ mais sans description personnelle.              │
│                                                 │
│ 📊 Quota du jour : 10/100 générations utilisées│
│                                                 │
│ [Générer les descriptions] ⏱️ ~45 secondes     │
└─────────────────────────────────────────────────┘
```

**Scénario 2 : Cooldown actif**
```
┌─────────────────────────────────────────────────┐
│ ✨ Améliorez vos conseils avec l'IA !           │
│                                                 │
│ ⚠️ Veuillez patienter 3 minutes avant de       │
│    relancer la génération                       │
│    ⏱️ Temps restant : 3:24                      │
│                                                 │
│ [Générer les descriptions] (désactivé)          │
└─────────────────────────────────────────────────┘
```

**Scénario 3 : Quota dépassé**
```
┌─────────────────────────────────────────────────┐
│ ✨ Améliorez vos conseils avec l'IA !           │
│                                                 │
│ ⚠️ Quota quotidien atteint (100/100            │
│    générations). Réessayez demain.              │
│                                                 │
│ [Générer les descriptions] (désactivé)          │
└─────────────────────────────────────────────────┘
```

---

## 📊 Logs dans la console

### Génération normale

```
[GENERATE COMMENTS BULK] 📦 Début pour client abc-123
[GENERATE COMMENTS BULK] ✅ Rate limit OK - Quota: 15/100
[GENERATE COMMENTS BULK] 🎯 50 tips à traiter
[GENERATE COMMENTS BULK] 📊 10 batch(s) de 5 tips
...
[GENERATE COMMENTS BULK] 🎉 Terminé - 50 réussis, 0 échoués
[RATE LIMIT] ✅ Log enregistré: 50 tips, batch
```

### Cooldown actif

```
[GENERATE COMMENTS BULK] 📦 Début pour client abc-123
[GENERATE COMMENTS BULK] ⏸️ Cooldown actif: 240s restants
```

### Quota dépassé

```
[GENERATE COMMENTS BULK] 📦 Début pour client abc-123
[GENERATE COMMENTS BULK] 🚫 Quota quotidien atteint: 100/100
```

---

## 🔧 Configuration (Optionnel)

Tu peux modifier les limites dans [supabase/migrations/20251027_add_ai_generation_logs.sql](supabase/migrations/20251027_add_ai_generation_logs.sql) :

```sql
-- Cooldown (en secondes)
v_cooldown_seconds INTEGER := 300; -- 5 minutes (modifiable)

-- Quota quotidien
v_max_count INTEGER := 100; -- 100 générations/jour (modifiable)
```

**Après modification** : Ré-applique la migration complète dans le SQL Editor.

---

## 📈 Analytics (Future feature)

La table `ai_generation_logs` contient :
- `client_id` : Quel gestionnaire a généré
- `tips_count` : Combien de tips générés
- `provider_used` : Quel provider IA utilisé (batch, OpenAI, Groq, etc.)
- `success_count` / `failed_count` : Taux de réussite
- `created_at` : Date et heure

Tu peux créer un dashboard analytics en interrogeant cette table ! 📊

---

## ✅ Checklist finale

- [ ] Migration SQL appliquée dans Supabase Dashboard
- [ ] Serveur relancé (`npm run dev`)
- [ ] Test : Générer des commentaires → Vérifier le cooldown
- [ ] Test : Re-générer immédiatement → Voir le message "patienter 5 minutes"
- [ ] Test : Vérifier le quota affiché dans le banner

---

**🎉 Ton système est maintenant protégé contre le spam !** 💪

Les quotas gratuits des API IA sont préservés et les gestionnaires ne peuvent plus abuser du système.
