/**
 * Système de détection de badges débloqués
 * Compare les stats avant/après une action pour détecter un nouveau badge
 */

export interface BadgeInfo {
  id: string
  title: string
  icon: string
  description: string
  color: string
}

export interface Stats {
  totalTips: number
  totalMedia: number
  totalCategories: number
  hasSecureSection: boolean
}

/**
 * Liste complète des badges disponibles
 * (Même structure que ChecklistManager.tsx)
 */
export const ALL_BADGES: BadgeInfo[] = [
  {
    id: 'first_step',
    title: '🎯 Premier Pas',
    icon: '🎯',
    description: 'Ajoutez votre premier conseil',
    color: 'from-purple-500 to-indigo-600'
  },
  {
    id: 'designer',
    title: '🎨 Designer',
    icon: '🎨',
    description: 'Personnalisez votre fond d\'écran',
    color: 'from-pink-500 to-rose-600'
  },
  {
    id: 'storyteller',
    title: '📚 Conteur',
    icon: '📚',
    description: 'Ajoutez 10 conseils ou plus',
    color: 'from-blue-500 to-cyan-600'
  },
  {
    id: 'secure',
    title: '🔒 Sécurité',
    icon: '🔒',
    description: 'Configurez la section sécurisée',
    color: 'from-red-500 to-rose-600'
  },
  {
    id: 'expert',
    title: '🏆 Expert',
    icon: '🏆',
    description: 'Ajoutez 25 conseils ou plus',
    color: 'from-yellow-500 to-amber-600'
  },
  {
    id: 'photographer',
    title: '📸 Photographe',
    icon: '📸',
    description: 'Ajoutez 10 photos ou plus',
    color: 'from-orange-500 to-amber-600'
  }
]

/**
 * Vérifie si un badge est débloqué selon les stats
 */
function isBadgeUnlocked(badge: BadgeInfo, stats: Stats, hasCustomBackground: boolean): boolean {
  switch (badge.id) {
    case 'first_step':
      return stats.totalTips >= 1
    case 'designer':
      return hasCustomBackground
    case 'storyteller':
      return stats.totalTips >= 10
    case 'secure':
      return stats.hasSecureSection
    case 'expert':
      return stats.totalTips >= 25
    case 'photographer':
      return stats.totalMedia >= 10
    default:
      return false
  }
}

/**
 * Détecte les badges nouvellement débloqués
 * @param previousStats Stats avant l'action
 * @param newStats Stats après l'action
 * @param hasCustomBackground Si l'utilisateur a un background personnalisé
 * @returns Le premier badge débloqué (ou null)
 */
export function detectNewBadge(
  previousStats: Stats,
  newStats: Stats,
  hasCustomBackground: boolean = false
): BadgeInfo | null {
  // Calculer les badges débloqués avant et après
  const previousBadges = ALL_BADGES.filter(badge =>
    isBadgeUnlocked(badge, previousStats, hasCustomBackground)
  )
  const newBadges = ALL_BADGES.filter(badge =>
    isBadgeUnlocked(badge, newStats, hasCustomBackground)
  )

  // Trouver les badges nouvellement débloqués
  const unlockedBadges = newBadges.filter(
    badge => !previousBadges.some(prev => prev.id === badge.id)
  )

  // Retourner le premier badge débloqué (priorité au plus rare)
  if (unlockedBadges.length > 0) {
    console.log('[BADGE] 🏆 Badge débloqué:', unlockedBadges[0].title)
    return unlockedBadges[0]
  }

  return null
}

/**
 * Récupère tous les badges débloqués pour des stats données
 */
export function getUnlockedBadges(stats: Stats, hasCustomBackground: boolean = false): BadgeInfo[] {
  return ALL_BADGES.filter(badge => isBadgeUnlocked(badge, stats, hasCustomBackground))
}

/**
 * Calcule le pourcentage de badges débloqués
 */
export function getBadgeProgress(stats: Stats, hasCustomBackground: boolean = false): number {
  const unlocked = getUnlockedBadges(stats, hasCustomBackground).length
  const total = ALL_BADGES.length
  return Math.round((unlocked / total) * 100)
}
