/**
 * Wrapper client pour les actions serveur de catégories
 */
'use client'

import { translateText, SUPPORTED_LANGUAGES } from '@/lib/translate'
import { CategoryInsert } from '@/types'
import { createClient } from '@/lib/supabase/client'

/**
 * Crée une nouvelle catégorie avec traductions automatiques (côté client)
 */
export async function createCategoryWithTranslationsClient(
  name: string,
  icon?: string
): Promise<{ id: string; error?: string }> {
  try {
    console.log('[CREATE CATEGORY CLIENT] Création avec traductions:', { name, icon })

    // 1. Traduire le nom de la catégorie dans toutes les langues
    const translations = await translateText(
      name,
      SUPPORTED_LANGUAGES,
      'Nom de catégorie pour une application touristique (restaurants, activités, etc.)'
    )

    console.log('[CREATE CATEGORY CLIENT] Traductions reçues:', translations)

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

    console.log('[CREATE CATEGORY CLIENT] Données à insérer:', categoryData)

    // 3. Insérer dans la base de données
    const supabase = createClient()
    const { data: newCategory, error: categoryError } = await (supabase
      .from('categories') as any)
      .insert([categoryData])
      .select()
      .single()

    if (categoryError) {
      console.error('[CREATE CATEGORY CLIENT] Erreur DB:', categoryError)
      throw categoryError
    }

    if (!newCategory) {
      throw new Error('Aucune catégorie créée')
    }

    console.log('[CREATE CATEGORY CLIENT] Catégorie créée avec succès:', newCategory.id)

    return { id: newCategory.id }
  } catch (error) {
    console.error('[CREATE CATEGORY CLIENT] Erreur:', error)
    return {
      id: '',
      error: error instanceof Error ? error.message : 'Erreur lors de la création de la catégorie',
    }
  }
}
