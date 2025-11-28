/**
 * Utilitaires pour la consommation accélérée des crédits
 * Gestion de la consommation quotidienne basée sur le nombre de welcomebooks
 */

/**
 * Calcule l'intervalle de consommation en heures selon le nombre de welcomebooks
 *
 * Règles :
 * - 1 welcomebook : 24h (100%, consommation normale)
 * - 2 welcomebooks : 21.6h (90%, -10% de temps)
 * - 3 welcomebooks : 19.2h (80%, -20% de temps)
 * - 4 welcomebooks : 16.8h (70%, -30% de temps)
 * - 5+ welcomebooks : 12h (50%, -50% de temps, plafond max)
 *
 * @param welcomebookCount - Nombre de welcomebooks de l'utilisateur
 * @returns Intervalle en heures (decimal)
 */
export function getConsumptionIntervalHours(welcomebookCount: number): number {
  const baseHours = 24.0

  // Calcul de l'accélération : 10% par welcomebook supplémentaire, plafond 50%
  const acceleration = Math.min((welcomebookCount - 1) * 0.10, 0.50)

  // Retour de l'intervalle réduit
  return baseHours * (1.0 - acceleration)
}

/**
 * Calcule l'intervalle de consommation en millisecondes
 *
 * @param welcomebookCount - Nombre de welcomebooks de l'utilisateur
 * @returns Intervalle en millisecondes
 */
export function getConsumptionIntervalMs(welcomebookCount: number): number {
  const hours = getConsumptionIntervalHours(welcomebookCount)
  return hours * 60 * 60 * 1000 // Conversion en ms
}

/**
 * Calcule le pourcentage d'accélération de consommation
 *
 * @param welcomebookCount - Nombre de welcomebooks
 * @returns Pourcentage d'accélération (0-50)
 */
export function getAccelerationPercentage(welcomebookCount: number): number {
  return Math.min((welcomebookCount - 1) * 10, 50)
}

/**
 * Vérifie si un crédit doit être consommé
 * Basé sur le dernier timestamp de consommation + intervalle calculé
 *
 * @param lastConsumption - Timestamp de la dernière consommation (ISO string ou Date)
 * @param welcomebookCount - Nombre de welcomebooks
 * @returns true si un crédit doit être consommé maintenant
 */
export function shouldConsumeCredit(
  lastConsumption: string | Date,
  welcomebookCount: number
): boolean {
  const lastConsumptionDate = typeof lastConsumption === 'string'
    ? new Date(lastConsumption)
    : lastConsumption

  const now = new Date()
  const intervalMs = getConsumptionIntervalMs(welcomebookCount)
  const nextConsumptionDate = new Date(lastConsumptionDate.getTime() + intervalMs)

  return now >= nextConsumptionDate
}

/**
 * Calcule le nombre de jours restants estimés
 * Basé sur le solde actuel et la vitesse de consommation
 *
 * @param creditsBalance - Solde de crédits actuel
 * @param welcomebookCount - Nombre de welcomebooks
 * @returns Nombre de jours restants (arrondi)
 */
export function estimateDaysRemaining(
  creditsBalance: number,
  welcomebookCount: number
): number {
  if (creditsBalance <= 0) {
    return 0
  }

  const intervalHours = getConsumptionIntervalHours(welcomebookCount)
  const creditsPerDay = 24 / intervalHours // Nombre de crédits consommés par jour
  const daysRemaining = creditsBalance / creditsPerDay

  return Math.floor(daysRemaining)
}

/**
 * Calcule la date estimée d'épuisement des crédits
 *
 * @param creditsBalance - Solde de crédits actuel
 * @param welcomebookCount - Nombre de welcomebooks
 * @param lastConsumption - Date de la dernière consommation
 * @returns Date estimée d'épuisement (ou null si balance <= 0)
 */
export function estimateDepletionDate(
  creditsBalance: number,
  welcomebookCount: number,
  lastConsumption: string | Date
): Date | null {
  if (creditsBalance <= 0) {
    return null
  }

  const daysRemaining = estimateDaysRemaining(creditsBalance, welcomebookCount)
  const lastConsumptionDate = typeof lastConsumption === 'string'
    ? new Date(lastConsumption)
    : lastConsumption

  const depletionDate = new Date(lastConsumptionDate)
  depletionDate.setDate(depletionDate.getDate() + daysRemaining)

  return depletionDate
}

/**
 * Formate un intervalle en heures en texte lisible
 *
 * @param hours - Nombre d'heures
 * @returns Texte formaté (ex: "24h", "21.6h", "12h")
 */
export function formatInterval(hours: number): string {
  // Si c'est un nombre entier, pas de décimales
  if (hours % 1 === 0) {
    return `${hours}h`
  }
  // Sinon, une décimale
  return `${hours.toFixed(1)}h`
}

/**
 * Retourne un label de couleur pour l'UI basé sur le nombre de jours restants
 *
 * @param daysRemaining - Nombre de jours restants
 * @returns Niveau de statut ('high' | 'medium' | 'low' | 'critical')
 */
export function getCreditStatusLevel(daysRemaining: number): 'high' | 'medium' | 'low' | 'critical' {
  if (daysRemaining > 30) {
    return 'high'
  } else if (daysRemaining > 7) {
    return 'medium'
  } else if (daysRemaining > 0) {
    return 'low'
  } else {
    return 'critical'
  }
}

/**
 * Retourne une couleur Tailwind basée sur le niveau de statut
 *
 * @param level - Niveau de statut
 * @returns Classe Tailwind de couleur
 */
export function getCreditStatusColor(level: 'high' | 'medium' | 'low' | 'critical'): string {
  const colors = {
    high: 'text-green-600 dark:text-green-400',
    medium: 'text-yellow-600 dark:text-yellow-400',
    low: 'text-orange-600 dark:text-orange-400',
    critical: 'text-red-600 dark:text-red-400'
  }
  return colors[level]
}

/**
 * Retourne une classe de bordure Tailwind basée sur le niveau de statut
 *
 * @param level - Niveau de statut
 * @returns Classe Tailwind de bordure
 */
export function getCreditStatusBorderColor(level: 'high' | 'medium' | 'low' | 'critical'): string {
  const colors = {
    high: 'border-green-200 dark:border-green-700',
    medium: 'border-yellow-200 dark:border-yellow-700',
    low: 'border-orange-200 dark:border-orange-700',
    critical: 'border-red-200 dark:border-red-700'
  }
  return colors[level]
}

/**
 * Retourne une classe de fond Tailwind basée sur le niveau de statut
 *
 * @param level - Niveau de statut
 * @returns Classe Tailwind de fond
 */
export function getCreditStatusBgColor(level: 'high' | 'medium' | 'low' | 'critical'): string {
  const colors = {
    high: 'bg-green-50 dark:bg-green-900/20',
    medium: 'bg-yellow-50 dark:bg-yellow-900/20',
    low: 'bg-orange-50 dark:bg-orange-900/20',
    critical: 'bg-red-50 dark:bg-red-900/20'
  }
  return colors[level]
}

/**
 * Retourne un message d'avertissement basé sur le nombre de jours restants
 *
 * @param daysRemaining - Nombre de jours restants
 * @returns Message d'avertissement (ou undefined si pas d'alerte)
 */
export function getCreditWarningMessage(daysRemaining: number): string | undefined {
  if (daysRemaining === 0) {
    return '🚨 Crédit épuisé ! Rechargez maintenant pour garder vos welcomebooks actifs.'
  } else if (daysRemaining === 1) {
    return '⚠️ Dernier jour ! Rechargez dès aujourd\'hui.'
  } else if (daysRemaining <= 7) {
    return `⚠️ Plus que ${daysRemaining} jours de crédit. Pensez à recharger.`
  } else if (daysRemaining <= 30) {
    return `💡 ${daysRemaining} jours restants. Pensez à partager pour gagner des crédits.`
  }
  return undefined
}

/**
 * Exemples d'utilisation dans les tests
 */
export const EXAMPLES = {
  oneWelcomebook: {
    count: 1,
    interval: getConsumptionIntervalHours(1), // 24h
    acceleration: getAccelerationPercentage(1), // 0%
    daysFor150Credits: estimateDaysRemaining(150, 1) // 150 jours
  },
  twoWelcomebooks: {
    count: 2,
    interval: getConsumptionIntervalHours(2), // 21.6h
    acceleration: getAccelerationPercentage(2), // 10%
    daysFor150Credits: estimateDaysRemaining(150, 2) // ~135 jours
  },
  threeWelcomebooks: {
    count: 3,
    interval: getConsumptionIntervalHours(3), // 19.2h
    acceleration: getAccelerationPercentage(3), // 20%
    daysFor150Credits: estimateDaysRemaining(150, 3) // ~120 jours
  },
  fourWelcomebooks: {
    count: 4,
    interval: getConsumptionIntervalHours(4), // 16.8h
    acceleration: getAccelerationPercentage(4), // 30%
    daysFor150Credits: estimateDaysRemaining(150, 4) // ~105 jours
  },
  sixPlusWelcomebooks: {
    count: 6,
    interval: getConsumptionIntervalHours(6), // 12h (plafond)
    acceleration: getAccelerationPercentage(6), // 50% (plafond)
    daysFor150Credits: estimateDaysRemaining(150, 6) // 75 jours
  }
}
