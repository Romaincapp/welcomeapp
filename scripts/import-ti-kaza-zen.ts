/**
 * Script d'importation des données Ti Kaza Zen depuis Glide
 *
 * Ce script :
 * 1. Récupère le client existant (ti-kaza-zen)
 * 2. Met à jour le client avec background + infos contact
 * 3. Télécharge et upload toutes les images vers Supabase Storage
 * 4. Crée les catégories (7 catégories)
 * 5. Importe les 21 tips avec leurs médias
 *
 * Usage: npx tsx scripts/import-ti-kaza-zen.ts
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse/sync'
import * as fs from 'fs/promises'
import * as path from 'path'

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey)

// Configuration
const WELCOMEBOOK_SLUG = 'ti-kaza-zen'
const STORAGE_BUCKET = 'media'

// Chemin du fichier CSV
const CSV_PATH = path.join(process.cwd(), 'import', 'sainte-anne.csv')

// Types pour les données CSV
interface TipCsv {
  'Titre souhaité': string
  'Catégorie': string
  'Détails': string
  'Image': string
  'Image de fond': string
  'Téléphone Hôte': string
  'Mail Hôte': string
  'SMS Hôte': string
  'logo': string
  'Téléphone': string
  'photo 2': string
  'photo 3': string
  'photo 4': string
  'photo 5': string
  'photo 6': string
  'Partagez la localisation google maps': string
  'Site Web / ou wifi': string
}

// Statistiques de l'importation
interface ImportStats {
  clientUpdated: boolean
  categoriesCreated: number
  tipsCreated: number
  imagesUploaded: number
  errors: string[]
}

const stats: ImportStats = {
  clientUpdated: false,
  categoriesCreated: 0,
  tipsCreated: 0,
  imagesUploaded: 0,
  errors: [],
}

/**
 * Télécharge une image depuis une URL externe
 */
async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`   ❌ Erreur téléchargement: ${errorMessage}`)
    stats.errors.push(`Download failed for ${url}: ${errorMessage}`)
    return null
  }
}

/**
 * Upload une image vers Supabase Storage
 */
async function uploadToSupabase(
  buffer: Buffer,
  filePath: string,
  contentType: string = 'image/jpeg'
): Promise<string | null> {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, buffer, {
        contentType,
        upsert: true,
      })

    if (error) {
      throw error
    }

    // Récupérer l'URL publique
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath)

    stats.imagesUploaded++
    return urlData.publicUrl
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`   ❌ Erreur upload Supabase: ${errorMessage}`)
    stats.errors.push(`Upload failed for ${filePath}: ${errorMessage}`)
    return null
  }
}

/**
 * Télécharge et upload une image (pipeline complet)
 */
async function processImage(
  sourceUrl: string,
  destinationPath: string
): Promise<string | null> {
  if (!sourceUrl || sourceUrl.trim() === '') {
    return null
  }

  console.log(`   📥 Téléchargement: ${sourceUrl.substring(0, 60)}...`)
  const buffer = await downloadImage(sourceUrl)
  if (!buffer) return null

  console.log(`   📤 Upload vers Supabase: ${destinationPath}`)
  return await uploadToSupabase(buffer, destinationPath)
}

/**
 * Parse le fichier CSV
 */
async function parseCsv(): Promise<TipCsv[]> {
  console.log('\n📄 Lecture de sainte-anne.csv')

  try {
    const content = await fs.readFile(CSV_PATH, 'utf-8')
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
      relax_quotes: true,
      relax_column_count: true,
    }) as TipCsv[]

    console.log(`   ✅ ${records.length} ligne(s) lue(s)`)
    return records
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`   ❌ Erreur lecture CSV: ${errorMessage}`)
    stats.errors.push(`Parse CSV failed: ${errorMessage}`)
    return []
  }
}

/**
 * Récupère et met à jour le client existant
 */
async function updateClient(tips: TipCsv[]): Promise<string | null> {
  console.log('\n👤 ÉTAPE 1: Récupération et mise à jour du client')

  try {
    // Récupérer le client existant
    const { data: existingClient, error: fetchError } = await supabase
      .from('clients')
      .select('id, email')
      .eq('slug', WELCOMEBOOK_SLUG)
      .maybeSingle()

    if (fetchError) {
      throw fetchError
    }

    if (!existingClient) {
      throw new Error(`Client avec slug "${WELCOMEBOOK_SLUG}" non trouvé. Créez d'abord le welcomebook sur le site.`)
    }

    console.log(`   ✅ Client trouvé (ID: ${existingClient.id})`)

    // Récupérer les infos de la première ligne (Support)
    const firstRow = tips[0]
    if (!firstRow) {
      throw new Error('Aucune donnée dans le CSV')
    }

    // Upload le background
    console.log('\n   📸 Upload de l\'image de fond...')
    let backgroundUrl: string | null = null
    if (firstRow['Image de fond']) {
      backgroundUrl = await processImage(
        firstRow['Image de fond'],
        `${WELCOMEBOOK_SLUG}/client/background.jpg`
      )
    }

    // Mettre à jour le client
    const updateData: Record<string, string | null> = {}

    if (backgroundUrl) {
      updateData.background_image = backgroundUrl
    }
    if (firstRow['Téléphone Hôte']) {
      updateData.footer_contact_phone = firstRow['Téléphone Hôte']
    }
    if (firstRow['Mail Hôte']) {
      updateData.footer_contact_email = firstRow['Mail Hôte']
    }

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', existingClient.id)

      if (updateError) {
        throw updateError
      }

      console.log(`   ✅ Client mis à jour:`)
      if (backgroundUrl) console.log(`      • Image de fond: ✓`)
      if (updateData.footer_contact_phone) console.log(`      • Téléphone: ${updateData.footer_contact_phone}`)
      if (updateData.footer_contact_email) console.log(`      • Email: ${updateData.footer_contact_email}`)
      stats.clientUpdated = true
    }

    return existingClient.id
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`   ❌ Erreur: ${errorMessage}`)
    stats.errors.push(`Client update failed: ${errorMessage}`)
    return null
  }
}

/**
 * Normalise le nom de catégorie pour créer un slug
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Crée les catégories uniques depuis le CSV
 */
async function createCategories(tips: TipCsv[]): Promise<Map<string, string>> {
  console.log('\n📁 ÉTAPE 2: Création des catégories')

  const categoryMap = new Map<string, string>()

  // Extraire les catégories uniques dans l'ordre d'apparition
  const uniqueCategories: string[] = []
  for (const tip of tips) {
    const cat = tip['Catégorie']
    if (cat && !uniqueCategories.includes(cat)) {
      uniqueCategories.push(cat)
    }
  }

  console.log(`   📋 ${uniqueCategories.length} catégories trouvées: ${uniqueCategories.join(', ')}`)

  let order = 0
  for (const categoryName of uniqueCategories) {
    const categorySlug = slugify(categoryName)

    try {
      // Vérifier si la catégorie existe
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .maybeSingle()

      if (existing) {
        console.log(`   ✅ Catégorie "${categoryName}" existe déjà`)
        categoryMap.set(categoryName, existing.id)
      } else {
        // Créer la catégorie
        const { data, error } = await supabase
          .from('categories')
          .insert({
            name: categoryName,
            slug: categorySlug,
            order: order,
          })
          .select()
          .single()

        if (error) {
          throw error
        }

        console.log(`   ✅ Catégorie "${categoryName}" créée (slug: ${categorySlug})`)
        categoryMap.set(categoryName, data.id)
        stats.categoriesCreated++
      }
      order++
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`   ❌ Erreur création catégorie "${categoryName}": ${errorMessage}`)
      stats.errors.push(`Category creation failed for ${categoryName}: ${errorMessage}`)
    }
  }

  return categoryMap
}

/**
 * Crée un tip avec ses médias
 */
async function createTip(
  tipData: TipCsv,
  clientId: string,
  categoryMap: Map<string, string>,
  index: number,
  totalTips: number
): Promise<void> {
  const title = tipData['Titre souhaité']
  console.log(`\n   📝 [${index + 1}/${totalTips}] ${title}`)

  try {
    // Récupérer l'ID de la catégorie
    const categoryId = categoryMap.get(tipData['Catégorie'])
    if (!categoryId) {
      throw new Error(`Catégorie "${tipData['Catégorie']}" non trouvée`)
    }

    // Préparer contact_social si website présent
    let contactSocial: { website: string } | null = null
    if (tipData['Site Web / ou wifi'] && tipData['Site Web / ou wifi'].startsWith('http')) {
      contactSocial = { website: tipData['Site Web / ou wifi'] }
    }

    // Créer le tip
    const { data: tip, error: tipError } = await supabase
      .from('tips')
      .insert({
        client_id: clientId,
        category_id: categoryId,
        title: title,
        comment: tipData['Détails'] || null,
        route_url: tipData['Partagez la localisation google maps'] || null,
        contact_phone: tipData['Téléphone'] || null,
        contact_social: contactSocial,
        order: index,
      })
      .select()
      .single()

    if (tipError) {
      throw tipError
    }

    console.log(`      ✅ Tip créé (ID: ${tip.id})`)
    stats.tipsCreated++

    // Collecter toutes les URLs d'images
    const imageUrls: string[] = []

    // Image principale
    if (tipData['Image']) {
      imageUrls.push(tipData['Image'])
    }

    // Photos supplémentaires
    const photoFields: Array<keyof TipCsv> = ['photo 2', 'photo 3', 'photo 4', 'photo 5', 'photo 6']
    for (const field of photoFields) {
      if (tipData[field] && tipData[field].trim() !== '') {
        imageUrls.push(tipData[field])
      }
    }

    // Télécharger et uploader les images
    const uploadedUrls: string[] = []
    for (let i = 0; i < imageUrls.length; i++) {
      const fileName = `tip-${index + 1}-photo${i + 1}.jpg`
      const uploadedUrl = await processImage(
        imageUrls[i],
        `${WELCOMEBOOK_SLUG}/tips/${fileName}`
      )
      if (uploadedUrl) {
        uploadedUrls.push(uploadedUrl)
      }
    }

    // Créer les entrées tip_media
    if (uploadedUrls.length > 0) {
      const mediaInserts = uploadedUrls.map((url, idx) => ({
        tip_id: tip.id,
        url: url,
        type: 'image',
        order: idx,
      }))

      const { error: mediaError } = await supabase.from('tip_media').insert(mediaInserts)

      if (mediaError) {
        console.error(`      ⚠️  Erreur création médias: ${mediaError.message}`)
        stats.errors.push(`Media creation failed for tip "${title}": ${mediaError.message}`)
      } else {
        console.log(`      ✅ ${uploadedUrls.length} média(s) créé(s)`)
      }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`      ❌ Erreur: ${errorMessage}`)
    stats.errors.push(`Tip creation failed for "${title}": ${errorMessage}`)
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🚀 IMPORTATION TI KAZA ZEN\n')
  console.log('='.repeat(60))

  const startTime = Date.now()

  try {
    // Parser le CSV
    const tips = await parseCsv()
    if (tips.length === 0) {
      throw new Error('Aucun tip trouvé dans le CSV')
    }

    // Étape 1: Récupérer et mettre à jour le client
    const clientId = await updateClient(tips)
    if (!clientId) {
      throw new Error('Impossible de récupérer le client')
    }

    // Étape 2: Créer les catégories
    const categoryMap = await createCategories(tips)
    if (categoryMap.size === 0) {
      throw new Error('Aucune catégorie créée')
    }

    // Étape 3: Importer les tips
    console.log('\n📝 ÉTAPE 3: Importation des tips')
    for (let i = 0; i < tips.length; i++) {
      await createTip(tips[i], clientId, categoryMap, i, tips.length)
    }

    // Rapport final
    const duration = Math.round((Date.now() - startTime) / 1000)
    console.log('\n' + '='.repeat(60))
    console.log('\n✨ IMPORTATION TERMINÉE !\n')
    console.log('📊 RÉSUMÉ:')
    console.log(`   • Client: ${stats.clientUpdated ? '✅ Mis à jour' : '✅ Inchangé'}`)
    console.log(`   • Catégories créées: ${stats.categoriesCreated}`)
    console.log(`   • Tips créés: ${stats.tipsCreated}/${tips.length}`)
    console.log(`   • Images uploadées: ${stats.imagesUploaded}`)
    console.log(`   • Erreurs: ${stats.errors.length}`)
    console.log(`   • Durée: ${duration}s`)

    if (stats.errors.length > 0) {
      console.log('\n⚠️  ERREURS DÉTECTÉES:')
      stats.errors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err}`)
      })
    }

    console.log('\n🌐 Accédez au welcomebook:')
    console.log(`   https://welcomeapp.be/${WELCOMEBOOK_SLUG}`)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`\n💥 ERREUR FATALE: ${errorMessage}`)
    process.exit(1)
  }
}

// Exécuter le script
main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`💥 Erreur inattendue: ${errorMessage}`)
    process.exit(1)
  })
