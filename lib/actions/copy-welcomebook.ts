'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

interface CopyWelcomebookDataOptions {
  includeTips: boolean
  includeSecureSection: boolean
}

interface CopyWelcomebookDataResult {
  success: boolean
  error?: string
  copiedTips?: number
  copiedCategories?: number
  copiedSecureSection?: boolean
}

/**
 * Copie tips + catégories + section sécurisée d'un welcomebook vers un autre
 * IMPORTANT: Les fichiers médias ne sont PAS copiés physiquement.
 * Les références aux médias pointent toujours vers le dossier slug original.
 *
 * @param sourceClientId - ID du welcomebook source
 * @param targetClientId - ID du welcomebook cible
 * @param options - Options de copie (tips, section sécurisée)
 */
export async function copyWelcomebookData(
  sourceClientId: string,
  targetClientId: string,
  options: CopyWelcomebookDataOptions
): Promise<CopyWelcomebookDataResult> {
  const supabase = await createServerSupabaseClient()

  try {
    console.log('[COPY WELCOMEBOOK] Source:', sourceClientId, 'Target:', targetClientId)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) {
      return { success: false, error: 'Non authentifié' }
    }

    // Vérifier ownership des DEUX welcomebooks
    const { data: sourceClient, error: sourceError } = await (supabase
      .from('clients') as any)
      .select('id, email')
      .eq('id', sourceClientId)
      .eq('email', user.email)
      .maybeSingle()

    if (sourceError || !sourceClient) {
      console.error('[COPY WELCOMEBOOK] Source not found or not owned:', sourceError)
      return { success: false, error: 'Welcomebook source introuvable ou non autorisé' }
    }

    const { data: targetClient, error: targetError } = await (supabase
      .from('clients') as any)
      .select('id, email')
      .eq('id', targetClientId)
      .eq('email', user.email)
      .maybeSingle()

    if (targetError || !targetClient) {
      console.error('[COPY WELCOMEBOOK] Target not found or not owned:', targetError)
      return { success: false, error: 'Welcomebook cible introuvable ou non autorisé' }
    }

    let copiedTips = 0
    let copiedCategories = 0
    let copiedSecureSection = false

    // ========================================
    // ÉTAPE 1: Copier les catégories
    // ========================================
    const { data: sourceCategories } = await (supabase
      .from('categories') as any)
      .select('*')
      .eq('client_id', sourceClientId)

    // Map pour associer ancien category_id → nouveau category_id
    const categoryIdMap: { [oldId: string]: string } = {}

    if (sourceCategories && sourceCategories.length > 0) {
      console.log(`[COPY WELCOMEBOOK] Copying ${sourceCategories.length} categories...`)

      for (const category of sourceCategories) {
        const { id: oldId, client_id, created_at, ...categoryData } = category

        const { data: newCategory, error: catError } = await (supabase
          .from('categories') as any)
          .insert({
            ...categoryData,
            client_id: targetClientId,
          })
          .select()
          .single()

        if (catError) {
          console.error('[COPY WELCOMEBOOK] Error copying category:', catError)
          continue
        }

        // Stocker le mapping ancien ID → nouveau ID
        categoryIdMap[oldId] = newCategory.id
        copiedCategories++
      }

      console.log(`[COPY WELCOMEBOOK] Copied ${copiedCategories} categories`)
    }

    // ========================================
    // ÉTAPE 2: Copier les tips
    // ========================================
    if (options.includeTips) {
      const { data: sourceTips } = await (supabase
        .from('tips') as any)
        .select('*')
        .eq('client_id', sourceClientId)

      if (sourceTips && sourceTips.length > 0) {
        console.log(`[COPY WELCOMEBOOK] Copying ${sourceTips.length} tips...`)

        for (const tip of sourceTips) {
          const { id: oldTipId, client_id, category_id, created_at, updated_at, ...tipData } = tip

          // Mapper l'ancien category_id vers le nouveau (si catégorie copiée)
          const newCategoryId = category_id ? categoryIdMap[category_id] || null : null

          // Insérer le tip copié
          const { data: newTip, error: tipError } = await (supabase
            .from('tips') as any)
            .insert({
              ...tipData,
              client_id: targetClientId,
              category_id: newCategoryId,
            })
            .select()
            .single()

          if (tipError) {
            console.error('[COPY WELCOMEBOOK] Error copying tip:', tipError)
            continue
          }

          copiedTips++

          // Copier les médias du tip (WARNING: URLs pointent vers slug original)
          const { data: tipMedia } = await (supabase
            .from('tip_media') as any)
            .select('*')
            .eq('tip_id', oldTipId)

          if (tipMedia && tipMedia.length > 0) {
            const mediaInserts = tipMedia.map((media: any) => {
              const { id, tip_id, created_at, ...mediaData } = media
              return {
                ...mediaData,
                tip_id: newTip.id,
              }
            })

            await (supabase
              .from('tip_media') as any)
              .insert(mediaInserts)
          }
        }

        console.log(`[COPY WELCOMEBOOK] Copied ${copiedTips} tips`)
      }
    }

    // ========================================
    // ÉTAPE 3: Copier la section sécurisée
    // ========================================
    if (options.includeSecureSection) {
      const { data: sourceSecureSection } = await (supabase
        .from('secure_sections') as any)
        .select('*')
        .eq('client_id', sourceClientId)
        .maybeSingle()

      if (sourceSecureSection) {
        console.log('[COPY WELCOMEBOOK] Copying secure section...')

        const { id, client_id, created_at, updated_at, ...secureSectionData } = sourceSecureSection

        const { error: secureError } = await (supabase
          .from('secure_sections') as any)
          .insert({
            ...secureSectionData,
            client_id: targetClientId,
          })

        if (secureError) {
          console.error('[COPY WELCOMEBOOK] Error copying secure section:', secureError)
        } else {
          copiedSecureSection = true
          console.log('[COPY WELCOMEBOOK] Copied secure section')
        }
      }
    }

    console.log('[COPY WELCOMEBOOK] Copy completed successfully ✅')
    return {
      success: true,
      copiedTips,
      copiedCategories,
      copiedSecureSection,
    }
  } catch (error) {
    console.error('[COPY WELCOMEBOOK] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}
