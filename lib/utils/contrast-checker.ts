/**
 * Utilitaires pour vérifier le contraste entre deux couleurs
 * Basé sur les recommandations WCAG 2.1
 */

/**
 * Convertit une couleur hexadécimale en RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Calcule la luminance relative d'une couleur RGB
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const val = c / 255
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Calcule le ratio de contraste entre deux couleurs
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  if (!rgb1 || !rgb2) return 0

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)

  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Vérifie si le contraste est suffisant selon les normes WCAG
 * @param ratio - Le ratio de contraste
 * @param level - 'AA' (minimum) ou 'AAA' (meilleur)
 * @param size - 'normal' (moins de 18pt) ou 'large' (18pt ou plus)
 */
export function meetsContrastRequirement(
  ratio: number,
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): boolean {
  if (level === 'AAA') {
    return size === 'large' ? ratio >= 4.5 : ratio >= 7
  }
  // Level AA
  return size === 'large' ? ratio >= 3 : ratio >= 4.5
}

/**
 * Vérifie le contraste entre deux couleurs et retourne un message d'avertissement si nécessaire
 */
export function checkContrast(
  backgroundColor: string,
  textColor: string,
  size: 'normal' | 'large' = 'normal'
): { isValid: boolean; ratio: number; message: string | null } {
  const ratio = getContrastRatio(backgroundColor, textColor)
  const meetsAA = meetsContrastRequirement(ratio, 'AA', size)

  if (!meetsAA) {
    return {
      isValid: false,
      ratio,
      message: `⚠️ Contraste insuffisant (${ratio.toFixed(2)}:1). Le texte risque d'être difficile à lire. Recommandation WCAG : minimum ${size === 'large' ? '3:1' : '4.5:1'}`,
    }
  }

  return {
    isValid: true,
    ratio,
    message: null,
  }
}

/**
 * Suggère une couleur de texte (noir ou blanc) basée sur la couleur de fond
 */
export function getSuggestedTextColor(backgroundColor: string): '#000000' | '#ffffff' {
  const rgb = hexToRgb(backgroundColor)
  if (!rgb) return '#000000'

  const luminance = getLuminance(rgb.r, rgb.g, rgb.b)
  // Si le fond est clair (luminance > 0.5), utiliser du texte noir, sinon blanc
  return luminance > 0.5 ? '#000000' : '#ffffff'
}
