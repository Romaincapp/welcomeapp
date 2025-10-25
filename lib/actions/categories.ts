/**
 * Actions serveur pour la gestion des catégories avec traduction automatique
 */
'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { translateText, SUPPORTED_LANGUAGES } from '@/lib/translate'
import { CategoryInsert } from '@/types'

/**
 * Crée une nouvelle catégorie avec traductions automatiques
 * @param name Nom de la catégorie en français
 * @param icon Emoji/icône de la catégorie
 * @returns L'ID de la catégorie créée
 */
export async function createCategoryWithTranslations(
  name: string,
  icon?: string
): Promise<{ id: string; error?: string }> {
  try {
    console.log('[CREATE CATEGORY] Création avec traductions:', { name, icon })

    // 1. Traduire le nom de la catégorie dans toutes les langues
    const translations = await translateText(
      name,
      SUPPORTED_LANGUAGES,
      'Nom de catégorie pour une application touristique (restaurants, activités, etc.)'
    )

    console.log('[CREATE CATEGORY] Traductions reçues:', translations)

    // 2. Préparer les données avec traductions
    const categoryData: CategoryInsert = {
      name: name.trim(),
      slug: name.trim().toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
        .replace(/[^a-z0-9]+/g, '-') // Remplacer espaces et caractères spéciaux par -
        .replace(/^-+|-+$/g, ''), // Enlever les - au début/fin
      icon: icon || '📍',
      name_en: translations.en || null,
      name_es: translations.es || null,
      name_nl: translations.nl || null,
      name_de: translations.de || null,
      name_it: translations.it || null,
      name_pt: translations.pt || null,
    }

    console.log('[CREATE CATEGORY] Données à insérer:', categoryData)

    // 3. Insérer dans la base de données
    const supabase = await createServerSupabaseClient()
    const { data: newCategory, error: categoryError } = await (supabase
      .from('categories') as any)
      .insert([categoryData])
      .select()
      .single()

    if (categoryError) {
      console.error('[CREATE CATEGORY] Erreur DB:', categoryError)
      throw categoryError
    }

    if (!newCategory) {
      throw new Error('Aucune catégorie créée')
    }

    console.log('[CREATE CATEGORY] Catégorie créée avec succès:', newCategory.id)

    return { id: newCategory.id }
  } catch (error) {
    console.error('[CREATE CATEGORY] Erreur:', error)
    return {
      id: '',
      error: error instanceof Error ? error.message : 'Erreur lors de la création de la catégorie',
    }
  }
}

/**
 * Traduit une catégorie existante qui a des champs de langue NULL
 * @param categoryId ID de la catégorie à traduire
 * @returns Success ou erreur
 */
export async function translateExistingCategory(
  categoryId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[TRANSLATE CATEGORY] Traduction de la catégorie:', categoryId)

    const supabase = await createServerSupabaseClient()

    // 1. Récupérer la catégorie
    const { data: category, error: fetchError } = await (supabase
      .from('categories') as any)
      .select('id, name, name_en, name_es, name_nl, name_de, name_it, name_pt')
      .eq('id', categoryId)
      .single()

    if (fetchError || !category) {
      throw new Error('Catégorie introuvable')
    }

    // 2. Traduire uniquement les champs qui sont NULL
    const languagesToTranslate = SUPPORTED_LANGUAGES.filter(
      (lang) => !category[`name_${lang}`]
    )

    if (languagesToTranslate.length === 0) {
      console.log('[TRANSLATE CATEGORY] Toutes les traductions existent déjà')
      return { success: true }
    }

    console.log('[TRANSLATE CATEGORY] Langues à traduire:', languagesToTranslate)

    const translations = await translateText(
      category.name,
      languagesToTranslate,
      'Nom de catégorie pour une application touristique'
    )

    // 3. Mettre à jour la base de données
    const updateData: Record<string, string> = {}
    for (const lang of languagesToTranslate) {
      updateData[`name_${lang}`] = translations[lang] || category.name
    }

    console.log('[TRANSLATE CATEGORY] Mise à jour avec:', updateData)

    const { error: updateError } = await (supabase
      .from('categories') as any)
      .update(updateData)
      .eq('id', categoryId)

    if (updateError) {
      throw updateError
    }

    console.log('[TRANSLATE CATEGORY] Traduction terminée avec succès')

    return { success: true }
  } catch (error) {
    console.error('[TRANSLATE CATEGORY] Erreur:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la traduction',
    }
  }
}

/**
 * Traduit toutes les catégories qui ont des champs NULL
 */
export async function translateAllCategories(): Promise<{
  success: boolean
  translated: number
  error?: string
}> {
  try {
    console.log('[TRANSLATE ALL] Démarrage de la traduction de toutes les catégories')

    const supabase = await createServerSupabaseClient()

    // 1. Récupérer toutes les catégories
    const { data: categories, error: fetchError } = await (supabase
      .from('categories') as any)
      .select('id, name, name_en, name_es, name_nl, name_de, name_it, name_pt')

    if (fetchError || !categories) {
      throw new Error('Impossible de récupérer les catégories')
    }

    console.log(`[TRANSLATE ALL] ${categories.length} catégories trouvées`)

    let translated = 0

    // 2. Traduire chaque catégorie qui a des champs NULL
    for (const category of categories) {
      const hasNullFields = SUPPORTED_LANGUAGES.some(
        (lang) => !category[`name_${lang}`]
      )

      if (hasNullFields) {
        const result = await translateExistingCategory(category.id)
        if (result.success) {
          translated++
        } else {
          console.warn(`[TRANSLATE ALL] Échec pour ${category.name}:`, result.error)
        }
      }
    }

    console.log(`[TRANSLATE ALL] ${translated} catégories traduites`)

    return { success: true, translated }
  } catch (error) {
    console.error('[TRANSLATE ALL] Erreur:', error)
    return {
      success: false,
      translated: 0,
      error: error instanceof Error ? error.message : 'Erreur lors de la traduction globale',
    }
  }
}
