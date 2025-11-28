/**
 * Générateurs d'URLs pour partages sociaux pré-remplis
 *
 * Ces fonctions créent des liens qui ouvrent le compositeur natif
 * de chaque plateforme avec le contenu déjà rempli.
 *
 * Avantages :
 * - 0 OAuth, 0 API complexity
 * - Fonctionne avec comptes personnels
 * - Users peuvent personnaliser avant de poster
 * - Aucune limite de rate
 */

/**
 * LinkedIn - Partage de lien avec texte pré-rempli
 * Ouvre le compositeur LinkedIn avec le texte et l'URL
 */
export function generateLinkedInDraftUrl(text: string, url: string = 'https://welcomeapp.be'): string {
  const params = new URLSearchParams({
    text: text,
    url: url,
  })
  return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`
}

/**
 * Twitter/X - Tweet pré-rempli avec URL
 * Ouvre le compositeur Twitter avec le texte
 */
export function generateTwitterDraftUrl(text: string, url: string = 'https://welcomeapp.be'): string {
  // Twitter inclut automatiquement l'URL dans le comptage de caractères
  const fullText = `${text}\n\n${url}`
  const params = new URLSearchParams({
    text: fullText,
  })
  return `https://twitter.com/intent/tweet?${params.toString()}`
}

/**
 * Facebook - Partage de lien avec citation
 * Ouvre le compositeur Facebook avec l'URL et le texte en citation
 */
export function generateFacebookDraftUrl(url: string = 'https://welcomeapp.be', quote?: string): string {
  const params = new URLSearchParams({
    u: url,
  })

  if (quote) {
    params.append('quote', quote)
  }

  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`
}

/**
 * Instagram - Copie le texte dans le presse-papiers
 * Instagram ne supporte pas les URLs pré-remplies via web
 * On retourne une instruction pour l'utilisateur
 */
export function getInstagramInstructions(text: string): {
  instruction: string
  textToCopy: string
} {
  return {
    instruction: "Instagram ne permet pas de pré-remplir les posts via web. Copiez le texte ci-dessous et collez-le dans l'app Instagram.",
    textToCopy: text,
  }
}

/**
 * Copie du texte dans le presse-papiers (pour Instagram et autres)
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('[COPY TO CLIPBOARD] Error:', error)
    return false
  }
}

/**
 * Détecte si l'utilisateur est sur mobile
 * Utile pour adapter les URLs (ex: deep links Instagram sur mobile)
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * Ouvre une URL de partage dans un nouvel onglet
 * Avec des dimensions optimisées pour les popups de partage
 */
export function openSocialShareWindow(url: string, platform: string): void {
  const width = 600
  const height = 700
  const left = (window.screen.width - width) / 2
  const top = (window.screen.height - height) / 2

  const features = `width=${width},height=${height},left=${left},top=${top},toolbar=0,menubar=0,location=0,status=0,scrollbars=1,resizable=1`

  window.open(url, `share-${platform}`, features)
}
