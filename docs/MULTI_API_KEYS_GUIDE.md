# 🔑 Guide : Multiplier vos quotas gratuits avec plusieurs clés API

## 📊 Récapitulatif des quotas gratuits

| Provider | Quota/jour | Quota/minute | Carte bancaire ? |
|----------|------------|--------------|------------------|
| **Google Gemini** ⭐ | 1,500 req | 60 req | ❌ Non |
| **Groq** ⭐ | 14,400 req | 30 req | ❌ Non |
| **Mistral AI** | ~100 req | ~10 req | ❌ Non |
| **OpenAI** | ❌ Payant | ❌ Payant | ✅ Oui (~$5 min) |

**💡 Astuce** : Avec 3 comptes Google Gemini + 3 comptes Groq = **47,100 requêtes/jour gratuites** !

---

## 🎯 Stratégie recommandée pour ton app

**Pour 100 lieux × 25 gestionnaires = 2,500 générations :**

- **3 comptes Google Gemini** → 4,500 req/jour ✅ Suffit largement
- **2 comptes Groq** → 28,800 req/jour ✅ Backup au cas où
- **1 compte Mistral AI** → Backup ultime

**Total : ~33,000 requêtes/jour gratuites** → Largement suffisant pour ton usage !

---

## 📝 Comment créer plusieurs comptes

### 1️⃣ Google Gemini (RECOMMANDÉ)

**Créer 3 comptes Google :**

1. **Compte 1** : Ton compte Gmail principal
   - Va sur [ai.google.dev](https://ai.google.dev)
   - Clique "Get API Key" → "Create API key"
   - Copie la clé → `GOOGLE_GEMINI_API_KEY`

2. **Compte 2** : Créer un compte Gmail secondaire
   - [accounts.google.com/signup](https://accounts.google.com/signup)
   - Email : `tonnom+gemini2@gmail.com` (astuce : +gemini2 = même boîte mail !)
   - Répète l'étape 1 → `GOOGLE_GEMINI_API_KEY_2`

3. **Compte 3** : Idem avec `tonnom+gemini3@gmail.com`
   - → `GOOGLE_GEMINI_API_KEY_3`

**Résultat : 4,500 requêtes/jour gratuits !**

---

### 2️⃣ Groq (TRÈS RAPIDE)

**Créer 2 comptes Groq :**

1. **Compte 1** : [console.groq.com](https://console.groq.com)
   - Inscription avec Google ou email
   - API Keys → Create API Key
   - Copie → `GROQ_API_KEY`

2. **Compte 2** : Utiliser un autre email
   - Email : `tonnom+groq2@gmail.com`
   - Répète l'étape 1 → `GROQ_API_KEY_2`

**Résultat : 28,800 requêtes/jour gratuits !**

---

### 3️⃣ Mistral AI (BACKUP)

**Créer 1-2 comptes Mistral :**

1. [console.mistral.ai](https://console.mistral.ai)
2. API Keys → Create new key
3. Copie → `MISTRAL_API_KEY`

(Optionnel : 2ème compte → `MISTRAL_API_KEY_2`)

---

## ⚙️ Configuration du .env.local

```env
# Google Gemini - 3 comptes (4,500 req/jour)
GOOGLE_GEMINI_API_KEY=AIzaSy...  # Compte 1

GOOGLE_GEMINI_API_KEY_3=AIzaSy...  # Compte 3

# Groq - 2 comptes (28,800 req/jour)
GROQ_API_KEY=gsk_...  # Compte 1


# Mistral AI - 1-2 comptes (backup)
MISTRAL_API_KEY=Wlv...  # Compte 1
MISTRAL_API_KEY_2=Wlv...  # Compte 2 (optionnel)
```

---

## 🚀 Activer la rotation automatique (OPTIONNEL)

**Système avancé** : Le fichier `lib/api-key-rotation.ts` permet de :
- Détecter automatiquement toutes les clés disponibles
- Rotation automatique si une clé atteint sa limite
- Tracking de l'utilisation pour optimiser la distribution

**Pour l'activer** : Modifier `app/api/generate-comments-batch/route.ts` pour utiliser `tryWithRotation()`.

---

## ✅ Test de tes clés

**Tester si tes nouvelles clés fonctionnent :**

1. Ajoute les clés dans `.env.local`
2. Redémarre le serveur (`Ctrl+C` puis `npm run dev`)
3. Lance une génération de commentaires
4. Observe les logs :
   ```
   [ROTATION] 🔑 Tentative avec Google Gemini - Clé #1/3
   [ROTATION] ⚠️ Google Gemini - Clé #1 - Quota atteint
   [ROTATION] 🔄 Rotation vers clé #2...
   [ROTATION] ✅ Google Gemini - Clé #2 - Succès !
   ```

---

## 💡 Astuces

### Astuce Gmail : Le "+" dans l'email
- `tonnom+gemini1@gmail.com` → Reçoit les emails dans `tonnom@gmail.com`
- `tonnom+gemini2@gmail.com` → Idem
- Pratique pour gérer plusieurs comptes sans créer plusieurs boîtes mail !

### Rotation intelligente
- **Google Gemini en priorité** : Meilleure qualité, quotas généreux
- **Groq en fallback** : Ultra-rapide, quotas énormes
- **Mistral AI en dernier recours** : Quotas limités mais fonctionne bien

### Monitoring
Si tu veux voir quelle clé est la plus utilisée :
```typescript
import { getKeyStats } from '@/lib/api-key-rotation'
console.log(getKeyStats())
```

---

## 🎯 Conclusion

**Avec cette configuration :**
- ✅ **~33,000 requêtes/jour** gratuites
- ✅ **Rotation automatique** si une clé atteint sa limite
- ✅ **0€ de coût** (sauf si tu veux utiliser OpenAI)
- ✅ **Fiabilité maximale** grâce aux fallbacks

**Tu es paré pour générer des milliers de commentaires IA sans frais ! 🚀**
