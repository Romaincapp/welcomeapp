import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

// Langues supportées
export const locales = ['fr', 'en', 'es', 'nl', 'de', 'it', 'pt'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'fr'

// Labels pour affichage
export const localeLabels: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
  nl: 'Nederlands',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português'
}

// Emojis de drapeaux
export const localeFlags: Record<Locale, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
  es: '🇪🇸',
  nl: '🇳🇱',
  de: '🇩🇪',
  it: '🇮🇹',
  pt: '🇵🇹'
}

export default getRequestConfig(async (params) => {
  // Récupérer la locale depuis les paramètres
  const locale = params.locale || defaultLocale

  // Valider que la locale est supportée
  const validLocale = locales.includes(locale as Locale) ? locale : defaultLocale

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default
  }
})
