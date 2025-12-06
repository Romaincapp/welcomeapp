/**
 * Liste complète des fonctionnalités de WelcomeApp
 * À mettre à jour manuellement lors de l'ajout de nouvelles features
 */

export interface AppFeature {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: 'core' | 'customization' | 'analytics' | 'sharing' | 'security' | 'productivity';
  isNew?: boolean; // Moins de 30 jours
  dateAdded?: string;
}

export const APP_FEATURES: AppFeature[] = [
  // === CORE ===
  {
    id: 'welcomebook',
    title: 'Welcomebook personnalisé',
    description: 'Créez un livret d\'accueil numérique unique pour vos voyageurs avec votre URL personnalisée.',
    emoji: '📖',
    category: 'core',
  },
  {
    id: 'multi-welcomebook',
    title: 'Multi-Welcomebooks',
    description: 'Gérez plusieurs locations avec un seul compte. Créez autant de welcomebooks que vous avez de propriétés.',
    emoji: '🏠',
    category: 'core',
  },
  {
    id: 'tips',
    title: 'Conseils & Recommandations',
    description: 'Ajoutez vos meilleures adresses, restaurants, activités et bons plans pour vos voyageurs.',
    emoji: '💡',
    category: 'core',
  },
  {
    id: 'categories',
    title: 'Catégories personnalisables',
    description: 'Organisez vos conseils par catégories (Restaurants, Activités, Transports...) avec réorganisation drag & drop.',
    emoji: '📂',
    category: 'core',
  },
  {
    id: 'media',
    title: 'Photos & Vidéos',
    description: 'Enrichissez vos conseils avec des photos et vidéos pour les rendre plus attractifs.',
    emoji: '📸',
    category: 'core',
  },
  {
    id: 'pwa',
    title: 'Application installable (PWA)',
    description: 'Vos voyageurs peuvent installer votre welcomebook sur leur téléphone comme une vraie app.',
    emoji: '📱',
    category: 'core',
  },

  // === CUSTOMIZATION ===
  {
    id: 'themes',
    title: 'Thèmes & Couleurs',
    description: 'Personnalisez l\'apparence de votre welcomebook avec votre couleur préférée.',
    emoji: '🎨',
    category: 'customization',
  },
  {
    id: 'background',
    title: 'Arrière-plan personnalisé',
    description: 'Ajoutez votre propre image de fond ou choisissez parmi notre galerie de backgrounds.',
    emoji: '🖼️',
    category: 'customization',
  },
  {
    id: 'image-crop',
    title: 'Recadrage d\'images',
    description: 'Recadrez et ajustez vos images avec différents ratios (16:9, 4:3, 1:1...) et effets Instagram.',
    emoji: '✂️',
    category: 'customization',
  },
  {
    id: 'dark-mode',
    title: 'Mode sombre',
    description: 'Basculez entre le mode clair et sombre dans votre dashboard selon vos préférences.',
    emoji: '🌙',
    category: 'customization',
  },

  // === PRODUCTIVITY ===
  {
    id: 'smart-fill',
    title: 'Smart Fill (IA)',
    description: 'Remplissez automatiquement votre welcomebook avec des conseils générés par intelligence artificielle.',
    emoji: '🤖',
    category: 'productivity',
  },
  {
    id: 'google-places',
    title: 'Intégration Google Places',
    description: 'Importez automatiquement les infos, photos et avis Google de vos adresses préférées.',
    emoji: '📍',
    category: 'productivity',
  },
  {
    id: 'translation',
    title: 'Traduction automatique',
    description: 'Votre welcomebook se traduit automatiquement dans la langue de vos voyageurs.',
    emoji: '🌐',
    category: 'productivity',
  },
  {
    id: 'copy-welcomebook',
    title: 'Duplication de welcomebook',
    description: 'Copiez un welcomebook existant pour créer rapidement une nouvelle propriété similaire.',
    emoji: '📋',
    category: 'productivity',
  },

  // === SHARING ===
  {
    id: 'qr-designer',
    title: 'QR Code Designer A4',
    description: 'Créez des QR codes personnalisés avec 15 templates professionnels, prêts à imprimer en format A4.',
    emoji: '🎯',
    category: 'sharing',
  },
  {
    id: 'share-link',
    title: 'Partage par lien',
    description: 'Partagez votre welcomebook avec un simple lien court et mémorable.',
    emoji: '🔗',
    category: 'sharing',
  },
  {
    id: 'share-email',
    title: 'Partage par email',
    description: 'Envoyez directement votre welcomebook par email à vos voyageurs.',
    emoji: '✉️',
    category: 'sharing',
  },

  // === ANALYTICS ===
  {
    id: 'analytics',
    title: 'Analytics visiteurs',
    description: 'Suivez les vues, clics et partages de votre welcomebook avec des statistiques détaillées.',
    emoji: '📊',
    category: 'analytics',
  },
  {
    id: 'device-breakdown',
    title: 'Répartition par appareil',
    description: 'Découvrez si vos visiteurs utilisent mobile, tablette ou ordinateur.',
    emoji: '📱',
    category: 'analytics',
  },
  {
    id: 'favorites',
    title: 'Système de favoris',
    description: 'Vos voyageurs peuvent marquer leurs conseils préférés pour les retrouver facilement.',
    emoji: '❤️',
    category: 'analytics',
  },

  // === SECURITY ===
  {
    id: 'secure-section',
    title: 'Section sécurisée',
    description: 'Protégez les informations sensibles (codes, WiFi, instructions) avec un code d\'accès.',
    emoji: '🔐',
    category: 'security',
  },
  {
    id: 'password-reset',
    title: 'Récupération de mot de passe',
    description: 'Réinitialisez votre mot de passe en toute sécurité avec vérification par email.',
    emoji: '🔑',
    category: 'security',
  },

  // === NOUVELLES FEATURES ===
  {
    id: 'category-view-all',
    title: 'Vue "Voir tout" par catégorie',
    description: 'Vos visiteurs peuvent voir tous les conseils d\'une catégorie en un clic sur une page dédiée.',
    emoji: '👁️',
    category: 'core',
    isNew: true,
    dateAdded: '2025-12-04',
  },
  {
    id: 'secure-notice',
    title: 'Notification section sécurisée',
    description: 'Les visiteurs sont informés automatiquement de l\'existence des informations d\'arrivée protégées.',
    emoji: '🔔',
    category: 'security',
    isNew: true,
    dateAdded: '2025-12-04',
  },
];
