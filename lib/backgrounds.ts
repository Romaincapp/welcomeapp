/**
 * Configuration des backgrounds disponibles pour les welcomeapps
 * Ces backgrounds sont proposés lors de l'onboarding et modifiables en mode édition
 */

export interface BackgroundOption {
  id: string
  name: string
  path: string
  description: string
  thumbnail?: string // Pour une version optimisée si besoin
}

export const AVAILABLE_BACKGROUNDS: BackgroundOption[] = [
  {
    id: 'plage',
    name: 'Plage',
    path: '/backgrounds/plage.jpg',
    description: 'Une belle plage ensoleillée'
  },
  {
    id: 'montagne',
    name: 'Montagne',
    path: '/backgrounds/montagne.jpg',
    description: 'Paysage de montagne majestueux'
  },
  {
    id: 'lac-montagne',
    name: 'Lac et Montagne',
    path: '/backgrounds/lac et montagne.jpg',
    description: 'Un lac paisible entouré de montagnes'
  },
  {
    id: 'foret',
    name: 'Forêt',
    path: '/backgrounds/forêt.jpg',
    description: 'Une forêt verdoyante et apaisante'
  },
  {
    id: 'interieur',
    name: 'Intérieur',
    path: '/backgrounds/interieur.jpg',
    description: 'Intérieur chaleureux et accueillant'
  },
  {
    id: 'default-1',
    name: 'Classique 1',
    path: '/backgrounds/default-1.jpg',
    description: 'Background classique'
  },
  {
    id: 'default-2',
    name: 'Classique 2',
    path: '/backgrounds/default-2.jpg',
    description: 'Background classique'
  },
  {
    id: 'default-3',
    name: 'Classique 3',
    path: '/backgrounds/default-3.jpg',
    description: 'Background classique'
  }
]

/**
 * Récupère un background par son ID
 */
export function getBackgroundById(id: string): BackgroundOption | undefined {
  return AVAILABLE_BACKGROUNDS.find(bg => bg.id === id)
}

/**
 * Récupère le background par défaut (plage)
 */
export function getDefaultBackground(): BackgroundOption {
  return AVAILABLE_BACKGROUNDS[0] // Plage par défaut
}
