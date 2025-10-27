# 🤖 Configuration des Clés API IA (Rotation Intelligente)

## 🎯 Pourquoi plusieurs providers ?

Le système de génération de commentaires utilise une **stratégie de rotation intelligente** :
- Si OpenAI atteint son quota → Bascule sur Groq
- Si Groq atteint son quota → Bascule sur Google Gemini
- Si Gemini atteint son quota → Bascule sur Mistral AI

**Résultat** : Vous ne tombez JAMAIS en panne, même avec 4 quotas gratuits combinés ! 🎉

---

## 📊 Comparaison des providers

| Provider | Coût | Vitesse | Quota gratuit | Qualité |
|----------|------|---------|---------------|---------|
| **OpenAI** | 💰 Payant | ⚡⚡ Rapide | Limité | 🌟🌟🌟🌟🌟 Excellente |
| **Groq** | ✅ Gratuit | ⚡⚡⚡⚡⚡ Ultra-rapide | 30 req/min | 🌟🌟🌟🌟 Très bonne |
| **Google Gemini** | ✅ Gratuit | ⚡⚡⚡ Rapide | 60 req/min | 🌟🌟🌟🌟 Très bonne |
| **Mistral AI** | ✅ Gratuit | ⚡⚡ Moyen | Limité | 🌟🌟🌟 Bonne |

**Recommandation** : Configurer les **4 providers** pour une solution 100% résiliente ! 💪

---

## 🚀 Guide complet (15 minutes)

### 1️⃣ OpenAI GPT-4o-mini (Déjà configuré ✅)

Vous utilisez déjà OpenAI. Rien à faire ! 🎉

---

### 2️⃣ Groq (GRATUIT - 30 req/min) ⚡

**Pourquoi Groq ?**
- 100% gratuit
- 3x plus rapide qu'OpenAI
- Excellente qualité avec Mixtral

**Étapes (2 minutes) :**

1. **Créer un compte**
   - Aller sur [console.groq.com](https://console.groq.com)
   - Cliquer sur "Sign Up" (gratuit, pas de carte bancaire)
   - S'inscrire avec email ou Google

2. **Créer une clé API**
   - Une fois connecté, aller dans **"API Keys"** (menu latéral)
   - Cliquer sur **"Create API Key"**
   - Donner un nom (ex: "WelcomeApp")
   - Cliquer sur **"Submit"**
   - **Copier la clé** (elle commence par `gsk_...`)

3. **Ajouter dans `.env.local`**
   ```bash
   GROQ_API_KEY=gsk_votre_clé_ici
   ```

4. **Redémarrer le serveur**
   ```bash
   npm run dev
   ```

✅ **C'est tout !** Groq est maintenant le fallback si OpenAI échoue.

---

### 3️⃣ Google Gemini (GRATUIT - 60 req/min) 🔷

**Pourquoi Gemini ?**
- 100% gratuit
- 60 requêtes par minute (le plus généreux !)
- Bonne qualité de génération

**Étapes (3 minutes) :**

1. **Obtenir une clé API**
   - Aller sur [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
   - Se connecter avec un compte Google
   - Cliquer sur **"Get API key"**
   - Cliquer sur **"Create API key"** (sélectionner un projet ou en créer un)
   - **Copier la clé** (elle commence par `AIza...`)

2. **Ajouter dans `.env.local`**
   ```bash
   
   ```

3. **Redémarrer le serveur**
   ```bash
   npm run dev
   ```

✅ **Gemini est maintenant le 3ème fallback !**

---

### 4️⃣ Mistral AI (GRATUIT avec limitations) 🇫🇷

**Pourquoi Mistral ?**
- Alternative européenne (France 🇫🇷)
- Gratuit avec quota limité
- Dernier filet de sécurité

**Étapes (3 minutes) :**

1. **Créer un compte**
   - Aller sur [console.mistral.ai](https://console.mistral.ai)
   - Cliquer sur "Sign Up"
   - S'inscrire avec email

2. **Obtenir une clé API**
   - Dans le dashboard, aller dans **"API keys"**
   - Cliquer sur **"Create new key"**
   - Donner un nom (ex: "WelcomeApp")
   - **Copier la clé**

3. **Ajouter dans `.env.local`**
   ```bash
   
   ```

4. **Redémarrer le serveur**
   ```bash
   npm run dev
   ```

✅ **Mistral est maintenant le 4ème et dernier fallback !**

---

## 🎉 Résultat final

Votre `.env.local` devrait ressembler à ça :

```bash
# 1️⃣ OpenAI (ACTUEL)
OPENAI_API_KEY=sk-proj-...

# 2️⃣ Groq (GRATUIT - 30 req/min)
GROQ_API_KEY=gsk_...

# 3️⃣ Google Gemini (GRATUIT - 60 req/min)
GOOGLE_GEMINI_API_KEY=AIza...

# 4️⃣ Mistral AI (GRATUIT avec limitations)
MISTRAL_API_KEY=...
```

---

## 📊 Vérifier que ça marche

### Dans les logs du terminal, tu verras :

**Scénario 1 : OpenAI fonctionne**
```
[GENERATE COMMENT] 🤖 Tentative avec OpenAI GPT-4o-mini (gpt-4o-mini)...
[GENERATE COMMENT] ✅ OpenAI GPT-4o-mini - Commentaire généré: Un petit restaurant...
```

**Scénario 2 : OpenAI quota dépassé → Groq prend le relais**
```
[GENERATE COMMENT] 🤖 Tentative avec OpenAI GPT-4o-mini (gpt-4o-mini)...
[GENERATE COMMENT] ⚠️ OpenAI GPT-4o-mini - Quota/limite atteint
[GENERATE COMMENT] 🔄 Tentative avec le provider suivant...
[GENERATE COMMENT] 🤖 Tentative avec Groq Mixtral (mixtral-8x7b-32768)...
[GENERATE COMMENT] ✅ Groq Mixtral - Commentaire généré: Un petit restaurant...
```

**Scénario 3 : OpenAI ET Groq en panne → Gemini prend le relais**
```
[GENERATE COMMENT] ⏭️ OpenAI GPT-4o-mini - Clé API non configurée, passage au suivant
[GENERATE COMMENT] 🤖 Tentative avec Groq Mixtral...
[GENERATE COMMENT] ⚠️ Groq Mixtral - Quota/limite atteint
[GENERATE COMMENT] 🔄 Tentative avec le provider suivant...
[GENERATE COMMENT] 🤖 Tentative avec Google Gemini (gemini-1.5-flash)...
[GENERATE COMMENT] ✅ Google Gemini - Commentaire généré: Un petit restaurant...
```

---

## 🎯 Configuration minimale recommandée

**Option 1 : Économique (0€/mois)**
- Configurer **uniquement Groq + Gemini**
- Total : **90 requêtes/minute gratuites**

**Option 2 : Ultime (recommandé)**
- Configurer **les 4 providers**
- Impossible de tomber en panne ! 💪

---

## 🔗 Liens utiles

- **Groq Console** : [console.groq.com](https://console.groq.com)
- **Google AI Studio** : [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- **Mistral Console** : [console.mistral.ai](https://console.mistral.ai)
- **Limites Groq** : [console.groq.com/docs/rate-limits](https://console.groq.com/docs/rate-limits)
- **Limites Gemini** : [ai.google.dev/pricing](https://ai.google.dev/pricing)

---

## ❓ FAQ

**Q : Est-ce que je DOIS configurer les 4 ?**
R : Non, mais c'est fortement recommandé. Au minimum, configure **Groq OU Gemini** pour avoir un fallback gratuit.

**Q : Quel ordre de priorité ?**
R : OpenAI → Groq → Gemini → Mistral. Le système essaie dans cet ordre.

**Q : Que se passe-t-il si AUCUNE clé n'est configurée ?**
R : La génération de commentaires ne fonctionnera pas, mais l'app ne crashera pas (retourne une chaîne vide).

**Q : Les quotas se réinitialisent quand ?**
R :
- Groq : Par minute (30 req/min)
- Gemini : Par minute (60 req/min)
- Mistral : Par jour (quota variable selon plan gratuit)

---

**🎉 Enjoy ! Ton système d'IA est maintenant incassable !** 💪
