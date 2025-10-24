import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n/request'

export default createMiddleware({
  // Liste des locales supportées
  locales,

  // Locale par défaut
  defaultLocale,

  // Détection automatique de la langue du navigateur
  localeDetection: true,

  // Prefix de locale dans l'URL (toujours afficher, même pour la langue par défaut)
  localePrefix: 'as-needed' // fr sans préfixe, autres langues avec préfixe
})

export const config = {
  // Matcher pour toutes les routes sauf les fichiers statiques et API
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
