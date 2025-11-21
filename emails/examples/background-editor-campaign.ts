/**
 * Exemple de campagne email pour annoncer l'éditeur d'arrière-plans amélioré
 *
 * USAGE:
 * 1. Connectez-vous au dashboard admin : https://welcomeapp.be/admin/campaigns
 * 2. Cliquez sur "Nouvelle campagne"
 * 3. Copiez-collez ces informations :
 */

export const backgroundEditorCampaignExample = {
  // Informations de base
  campaignName: 'Lancement Éditeur Arrière-plans v2',
  template: 'BackgroundEditorAnnouncement',

  // Sujet de l'email (testez 2 variantes pour A/B testing)
  subjectA: '🎨 Nouveau : Créez des fonds parfaits en 30 secondes',
  subjectB: '✨ Recadrage, galerie et effets Instagram pour vos arrière-plans',

  // Destinataires
  audienceFilter: {
    // Tous les gestionnaires actifs
    status: 'active',

    // Optionnel : Cibler uniquement ceux qui n'ont pas changé leur fond depuis X jours
    // lastBackgroundUpdate: { olderThan: '30 days' },
  },

  // Configuration A/B Testing
  abTestConfig: {
    enabled: true,
    splitPercent: 50, // 50% reçoivent variante A, 50% variante B
    winnerMetric: 'open_rate', // Ou 'click_rate'
  },

  // Preview text (apparaît dans la boîte de réception)
  previewText:
    'Recadrage intelligent, galerie de fonds pro et effets Instagram. Tout ça gratuit ! 🎉',

  // Notes internes
  internalNotes: `
    Campagne pour annoncer la refonte de l'éditeur d'arrière-plans.

    Objectifs :
    - Informer tous les gestionnaires de la nouvelle fonctionnalité
    - Encourager l'utilisation (on vise 40% d'adoption en 7 jours)
    - Récolter des feedbacks pour améliorer l'UX

    Timing idéal : Mardi ou Jeudi, 9h-11h (meilleur taux d'ouverture)

    KPIs à surveiller :
    - Open rate > 35%
    - Click rate (bouton "Essayer maintenant") > 8%
    - Taux d'utilisation de la feature dans les 7j suivant l'email
  `,
};

/**
 * Exemple de code pour envoyer la campagne via l'API
 * (à utiliser depuis /admin/campaigns ou via script)
 */
export const sendBackgroundEditorCampaignExample = `
// POST /api/admin/send-campaign
{
  "campaignName": "Lancement Éditeur Arrière-plans v2",
  "template": "BackgroundEditorAnnouncement",
  "subjectA": "🎨 Nouveau : Créez des fonds parfaits en 30 secondes",
  "subjectB": "✨ Recadrage, galerie et effets Instagram pour vos arrière-plans",
  "abTestEnabled": true,
  "audienceFilter": {
    "status": "active"
  }
}
`;

/**
 * Timeline suggérée pour maximiser l'impact
 */
export const campaignTimeline = {
  'Jour J (envoi)': {
    time: 'Mardi 10h00',
    actions: [
      'Envoyer la campagne email',
      'Publier un post LinkedIn/Facebook (optionnel)',
      'Surveiller les premiers taux d\'ouverture',
    ],
  },

  'J+1': {
    time: 'Mercredi matin',
    actions: [
      'Analyser les stats initiales (open rate, click rate)',
      'Vérifier les emails de feedback',
      'Identifier les bugs éventuels signalés',
    ],
  },

  'J+3': {
    time: 'Vendredi',
    actions: [
      'Email de relance ciblé aux gestionnaires qui n\'ont pas ouvert',
      'Analyser le taux d\'adoption de la feature (dashboard analytics)',
    ],
  },

  'J+7': {
    time: 'Mardi suivant',
    actions: [
      'Bilan final de la campagne',
      'Compiler les feedbacks utilisateurs',
      'Planifier les améliorations V3 basées sur les retours',
    ],
  },
};

/**
 * Exemples de sujets alternatifs (pour inspiration)
 */
export const alternativeSubjects = [
  '🎨 Vos arrière-plans méritent mieux (et c\'est gratuit)',
  '✨ Recadrez comme un pro en 3 clics',
  '📸 8 fonds pros + crop intelligent = WelcomeApp parfait',
  '🚀 Nouvelle fonctionnalité : L\'éditeur d\'arrière-plans que vous attendiez',
  '💎 Transformez vos fonds en 30 secondes (sans Photoshop)',
];

/**
 * Segments d'audience suggérés (optionnel)
 */
export const audienceSegments = {
  // Segment 1 : Utilisateurs actifs (priorité haute)
  activeUsers: {
    description: 'Gestionnaires ayant ajouté un tip dans les 30 derniers jours',
    filter: {
      lastTipAdded: { lessThan: '30 days' },
    },
    expectedOpenRate: '40-45%',
  },

  // Segment 2 : Utilisateurs endormis (tentative de réactivation)
  dormantUsers: {
    description: 'Gestionnaires inactifs depuis 60+ jours',
    filter: {
      lastLogin: { olderThan: '60 days' },
    },
    expectedOpenRate: '20-25%',
    note: 'Sujet plus accrocheur recommandé pour ce segment',
  },

  // Segment 3 : Nouveaux utilisateurs (onboarding)
  newUsers: {
    description: 'Inscrits dans les 14 derniers jours',
    filter: {
      createdAt: { lessThan: '14 days' },
    },
    expectedOpenRate: '45-50%',
    note: 'Ajouter contexte sur comment accéder à l\'éditeur',
  },
};
