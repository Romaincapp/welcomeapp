-- ============================================================================
-- Migration: Templates de Posts Sociaux - Contenu Directement Copiable
-- Date: 2025-11-23
-- Description: Remplace les templates avec variables par du contenu générique
--              directement utilisable (copier-coller sans personnalisation)
-- ============================================================================

-- Supprimer les anciens templates (CASCADE pour supprimer aussi les credit_requests liés)
TRUNCATE TABLE post_templates CASCADE;

-- Insérer 10 nouveaux templates sans variables
INSERT INTO post_templates (title, emoji, category, content, variables, platform_recommendations) VALUES

-- 1. ⏰ Gain de temps
(
  'Gain de temps',
  '⏰',
  'benefit',
  E'15 minutes pour créer mon guide de bienvenue digital pour mes voyageurs.

Avant, je passais des heures à répondre aux mêmes questions :
❌ "Où sont les clés ?"
❌ "Comment fonctionne le WiFi ?"
❌ "Quels restaurants recommandez-vous ?"

Aujourd''hui avec WelcomeApp (welcomeapp.be) :
✅ Je partage un lien unique à mes voyageurs
✅ Ils peuvent préparer leur séjour AVANT l''arrivée
✅ Toutes les infos accessibles depuis leur téléphone
✅ Je gagne 30 minutes par réservation

Résultat : Plus de temps pour ce qui compte vraiment - accueillir mes voyageurs avec le sourire 😊

#GestionLocative #LocationSaisonnière #DigitalNomad',
  '[]',
  '["linkedin", "facebook"]'
),

-- 2. 📊 Résultat concret
(
  'Résultats concrets',
  '📊',
  'stats',
  E'📊 Mes chiffres après 6 mois d''utilisation de WelcomeApp :

✅ 90% de messages en moins
✅ Note moyenne passée de 4.3 à 4.8 ⭐
✅ 100% des voyageurs consultent le guide

Mon meilleur investissement de l''année ? Ce guide digital (welcomeapp.be).

Pourquoi ça marche ?
→ Mes voyageurs reçoivent le lien AVANT leur arrivée
→ Ils préparent leur séjour tranquillement depuis chez eux
→ Moins de messages paniqués à 23h
→ Meilleures notes = plus de réservations

Si vous gérez une location saisonnière, c''est un game-changer.

#Airbnb #Booking #LocationVacances',
  '[]',
  '["linkedin", "facebook", "instagram"]'
),

-- 3. 🔄 Avant/Après
(
  'Avant/Après',
  '🔄',
  'comparison',
  E'AVANT vs APRÈS avoir digitalisé l''accueil de mes voyageurs 👇

📱 AVANT :
• Messages à répétition ("Où sont les serviettes ?")
• Imprimer des documents à chaque arrivée
• Stress si je ne suis pas dispo au téléphone
• Infos obsolètes (restaurant fermé depuis 6 mois...)

✨ APRÈS (avec WelcomeApp - welcomeapp.be) :
• Lien envoyé = mes voyageurs préparent leur séjour en avance
• Mises à jour en temps réel depuis mon téléphone
• Ils découvrent mes meilleures adresses secrètes avant d''arriver
• Je peux voyager l''esprit tranquille

La différence ? L''autonomie. Pour eux ET pour moi.

💬 Vous gérez comment l''accueil de vos voyageurs ?

#Conciergerie #SmartHome #Hospitality',
  '[]',
  '["linkedin", "facebook"]'
),

-- 4. 💬 Question engageante
(
  'Question engageante',
  '💬',
  'engagement',
  E'Question pour les propriétaires de locations saisonnières 👇

Combien de fois par semaine recevez-vous ces messages ?

📩 "Bonjour, où se trouve la machine à café ?"
📩 "Comment fonctionne la TV ?"
📩 "Vous recommandez quoi comme restaurant ?"

Moi, c''était 15-20 fois par semaine.

Jusqu''à ce que je crée mon guide digital (welcomeapp.be) :
→ Lien envoyé dès la réservation
→ Mes voyageurs préparent leur séjour tranquillement
→ Tous mes bons plans + infos pratiques accessibles H24

Résultat : 90% de messages en moins

💡 Et vous, quelle est votre astuce pour gérer ces demandes récurrentes ?

#LocationSaisonnière #Airbnb #PropTech',
  '[]',
  '["linkedin", "facebook"]'
),

-- 5. 🌟 Bénéfice voyageur
(
  'Bénéfice voyageur',
  '🌟',
  'benefit',
  E'Ce que mes voyageurs adorent dans mon guide digital 👇

🎯 "Vos recommandations de restaurants sont top !"
🗺️ "La carte interactive nous a fait gagner un temps fou"
📸 "On a visité tous vos spots photos secrets"
🏠 "Toutes les infos pratiques au même endroit, génial !"

Le secret ? Je partage mes vraies pépites locales, pas les attrape-touristes.

Avec WelcomeApp (welcomeapp.be), mes voyageurs reçoivent le lien AVANT leur arrivée et découvrent :

✅ Mes 15 meilleurs restaurants testés personnellement
✅ 20 activités incontournables de la région
✅ Tous les codes WiFi, parkings, consignes de tri...
✅ Une carte interactive pour tout visualiser

Ils préparent leur séjour tranquillement depuis chez eux 🏠

Résultat : 4.8/5 ⭐ en moyenne

#Hospitality #TravelTips #VacationRental',
  '[]',
  '["instagram", "facebook"]'
),

-- 6. 💡 Le déclic
(
  'Le déclic',
  '💡',
  'insight',
  E'Le déclic qui a changé ma gestion locative 👇

Je réalisé que je perdais 3-4h par semaine à :

❌ Répondre aux mêmes questions
❌ Mettre à jour des documents Word
❌ Envoyer des listes de recommandations par SMS
❌ Chercher le PDF avec les codes d''accès

💡 Puis j''ai compris : mes voyageurs ne veulent pas me déranger.

Ils veulent juste les infos. Au bon moment. Sans chercher.

Solution : Un guide digital (welcomeapp.be) accessible en 1 clic.

Depuis que j''ai créé mon guide :

✅ Zéro question sur le WiFi, le chauffage ou les poubelles
✅ Mes voyageurs découvrent LA crêperie locale (mon spot secret)
✅ Ils peuvent tout consulter AVANT leur arrivée
✅ Je mets à jour les infos en 30 secondes depuis mon téléphone

Moins de friction = voyageurs plus heureux = meilleures notes.

Simple, mais puissant.

#LocationSaisonnière #Automatisation #PropTech',
  '[]',
  '["linkedin"]'
),

-- 7. 🎯 Statistique impactante
(
  'Statistique impactante',
  '🎯',
  'stats',
  E'500+ consultations 🔥

C''est le nombre de fois que mon guide a été consulté depuis 6 mois.

Comment j''ai fait ?

1️⃣ Créé un guide complet en 15 minutes (welcomeapp.be)
2️⃣ Ajouté mes 20 meilleurs bons plans locaux
3️⃣ Partagé le lien dès la réservation
4️⃣ Mis à jour mes infos en temps réel depuis mon téléphone

Résultat concret :

📈 90% de consultation (vs 30% pour mon ancien classeur papier)
⭐ Note moyenne passée de 4.3 à 4.8
⏰ 3h économisées par semaine

Le meilleur ? Mes voyageurs préparent leur séjour AVANT d''arriver.

💬 Question : vous utilisez quoi pour améliorer l''expérience de vos voyageurs ?

#DataDriven #Hospitality #LocationVacances',
  '[]',
  '["linkedin", "facebook"]'
),

-- 8. ⭐ Témoignage authentique
(
  'Témoignage authentique',
  '⭐',
  'testimonial',
  E'Petit témoignage qui fait chaud au cœur ❤️

Message reçu ce matin d''un voyageur :

"Merci pour ce guide ! On a testé tous vos restaurants, ils étaient incroyables. Et la randonnée secrète du Mont Blanc ? Magique. Meilleur séjour ever."

Ce qui m''a le plus marqué ? Ils ont pris le temps de me remercier.

Depuis que j''ai créé mon guide digital (welcomeapp.be) :

✨ Les voyageurs découvrent MES spots (pas TripAdvisor)
✨ Ils peuvent tout consulter avant d''arriver
✨ Ils apprécient l''attention aux détails
✨ Et surtout : ils laissent des avis dithyrambiques

Mon astuce : Je mets mes vrais coups de cœur, testés et approuvés. Pas de liste ChatGPT.

Résultat : une note moyenne de 4.8/5 ⭐

L''hospitalité, c''est partager ce qu''on aime vraiment.

#CustomerExperience #Hospitality #Airbnb',
  '[]',
  '["facebook", "instagram"]'
),

-- 9. 🔧 Problème/Solution
(
  'Problème/Solution',
  '🔧',
  'problem_solution',
  E'Problème : Mes voyageurs me bombardent de questions 24/7.

Solution ? Un guide digital accessible en 1 clic (welcomeapp.be).

Voici ce que j''ai appris en gérant ma location saisonnière :

❌ ERREUR #1 : Donner un classeur papier de 40 pages
→ Personne ne le lit. Il finit sous le canapé.

❌ ERREUR #2 : Envoyer un PDF par email
→ Ils ne le retrouvent plus. "Quel email déjà ?"

✅ CE QUI MARCHE : Un lien partagé dès la réservation
→ Mes voyageurs préparent leur séjour en avance
→ Carte interactive + tous mes bons plans accessibles H24

Résultat ?
• 90% de messages en moins
• Voyageurs autonomes et ravis
• Note passée de 4.2 à 4.8 ⭐

Le secret : Faciliter leur vie au maximum.

#LocationSaisonnière #ProblemSolving #SmartHospitality',
  '[]',
  '["linkedin", "twitter"]'
),

-- 10. ⚡ Partage rapide
(
  'Partage rapide',
  '⚡',
  'quick_share',
  E'Guide digital pour locations de vacances = game-changer 🚀

Créé le mien en 15 minutes sur welcomeapp.be
Mes voyageurs adorent.
4.8/5 en moyenne.

Lien unique : infos pratiques + bons plans + carte interactive.
Ils préparent leur séjour AVANT d''arriver.

Moins de messages. Plus de 5 étoiles.

#LocationSaisonnière #DigitalTransformation',
  '[]',
  '["linkedin", "twitter", "instagram"]'
);

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================
