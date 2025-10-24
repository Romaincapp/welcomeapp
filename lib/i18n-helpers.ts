import { Locale } from '@/i18n/request'

/**
 * Helper pour récupérer la valeur traduite d'un champ
 * Si la traduction n'existe pas, retourne la valeur par défaut (français)
 */
export function getTranslatedField<T>(
  obj: T,
  fieldName: keyof T,
  locale: Locale
): string {
  if (locale === 'fr') {
    return (obj[fieldName] as string) || ''
  }

  const translatedFieldName = `${String(fieldName)}_${locale}` as keyof T
  const translatedValue = obj[translatedFieldName] as string | undefined
  const defaultValue = obj[fieldName] as string

  return translatedValue || defaultValue || ''
}

/**
 * Type helper pour les objets avec traductions
 */
export type Translatable<T extends string> = {
  [K in T]: string
} & {
  [K in T as `${K}_en`]?: string
} & {
  [K in T as `${K}_es`]?: string
} & {
  [K in T as `${K}_nl`]?: string
} & {
  [K in T as `${K}_de`]?: string
} & {
  [K in T as `${K}_it`]?: string
} & {
  [K in T as `${K}_pt`]?: string
}

/**
 * Vérifie si une traduction existe pour une locale donnée
 */
export function hasTranslation<T>(
  obj: T,
  fieldName: keyof T,
  locale: Locale
): boolean {
  if (locale === 'fr') {
    return true
  }

  const translatedFieldName = `${String(fieldName)}_${locale}` as keyof T
  const translatedValue = obj[translatedFieldName] as string | undefined

  return Boolean(translatedValue && translatedValue.trim().length > 0)
}

/**
 * Compte le nombre de champs traduits pour une locale
 */
export function getTranslationCompleteness<T>(
  obj: T,
  fields: (keyof T)[],
  locale: Locale
): number {
  if (locale === 'fr') {
    return 100
  }

  const totalFields = fields.length
  const translatedFields = fields.filter(field =>
    hasTranslation(obj, field, locale)
  ).length

  return Math.round((translatedFields / totalFields) * 100)
}
