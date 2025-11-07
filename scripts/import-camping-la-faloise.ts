/**
 * Script d'importation des données Camping La Faloise depuis Glide
 *
 * Ce script :
 * 1. Crée un compte utilisateur (campinglafaloise@gmail.com)
 * 2. Crée le client avec les infos du gestionnaire
 * 3. Télécharge et upload toutes les images vers Supabase Storage
 * 4. Crée les catégories (Informations, Activités, Magasins, Restaurants)
 * 5. Importe les 33 tips avec leurs médias
 *
 * Usage: npx ts-node scripts/import-camping-la-faloise.ts
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse/sync'
import * as fs from 'fs/promises'
import * as path from 'path'

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey)

// Configuration du compte
const ACCOUNT_EMAIL = 'campinglafaloise@gmail.com'
const ACCOUNT_PASSWORD = 'Test123456!'
const WELCOMEBOOK_SLUG = 'camping-la-faloise'
const STORAGE_BUCKET = 'media'

// Chemins des fichiers CSV
const CSV_COORDONNEES = path.join(process.cwd(), 'import', 'COORDONNEES.csv')
const CSV_TIPS = path.join(process.cwd(), 'import', 'LAFALOISETIPS.csv')

// Types pour les données CSV
interface CoordonneesCsv {
  'Image de fond': string
  'Téléphone Hôte': string
  'SMS Hôte': string
  'Mail Hôte': string
  'Facebook': string
  'Instagram': string
  'site web': string
  'logo': string
  'Texte menu': string
}

interface TipCsv {
  'Titre souhaité': string
  'Catégorie': string
  'Détails': string
  'Image': string
  'Texte bas de page': string
  'Image de fond': string
  'Facebook': string
  'Instagram': string
  'site web': string
  'logo': string
  'Site Web / ou wifi': string
  'Partagez la localisation google maps': string
  'photo 2': string
  'photo 3': string
  'Téléphone': string
  'photo 4': string
  'code promo': string
  'photo 5': string
  'photo 6': string
}

// Statistiques de l'importation
interface ImportStats {
  userCreated: boolean
  clientCreated: boolean
  categoriesCreated: number
  tipsCreated: number
  imagesUploaded: number
  errors: string[]
}

const stats: ImportStats = {
  userCreated: false,
  clientCreated: false,
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
    const { data, error } = await supabase.storage
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
 * Crée un utilisateur dans Supabase Auth
 */
async function createUser(): Promise<string | null> {
  console.log('\n🔐 ÉTAPE 1: Création du compte utilisateur')
  console.log(`   Email: ${ACCOUNT_EMAIL}`)

  try {
    // Vérifier si l'utilisateur existe déjà
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find((u: { email?: string }) => u.email === ACCOUNT_EMAIL)

    if (existingUser) {
      console.log(`   ✅ Utilisateur existe déjà (ID: ${existingUser.id})`)
      stats.userCreated = false
      return existingUser.id
    }

    // Créer l'utilisateur
    const { data, error } = await supabase.auth.admin.createUser({
      email: ACCOUNT_EMAIL,
      password: ACCOUNT_PASSWORD,
      email_confirm: true,
    })

    if (error) {
      throw error
    }

    console.log(`   ✅ Utilisateur créé avec succès (ID: ${data.user.id})`)
    stats.userCreated = true
    return data.user.id
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`   ❌ Erreur création utilisateur: ${errorMessage}`)
    stats.errors.push(`User creation failed: ${errorMessage}`)
    return null
  }
}

/**
 * Parse le fichier COORDONNEES.csv
 */
async function parseCoordonnees(): Promise<CoordonneesCsv | null> {
  console.log('\n📄 Lecture de COORDONNEES.csv')

  try {
    const content = await fs.readFile(CSV_COORDONNEES, 'utf-8')
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
    }) as CoordonneesCsv[]

    if (records.length === 0) {
      throw new Error('Aucune donnée trouvée dans COORDONNEES.csv')
    }

    console.log(`   ✅ ${records.length} ligne(s) lue(s)`)
    return records[0]
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`   ❌ Erreur lecture CSV: ${errorMessage}`)
    stats.errors.push(`Parse coordonnees.csv failed: ${errorMessage}`)
    return null
  }
}

/**
 * Crée le client dans la table clients
 */
async function createClient(userId: string, coordonnees: CoordonneesCsv): Promise<string | null> {
  console.log('\n👤 ÉTAPE 2: Création du client')

  try {
    // Vérifier si le client existe déjà
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('slug', WELCOMEBOOK_SLUG)
      .maybeSingle()

    if (existingClient) {
      console.log(`   ✅ Client existe déjà (ID: ${existingClient.id})`)
      stats.clientCreated = false
      return existingClient.id
    }

    // Upload logo et background
    console.log('\n   📸 Upload des images du client...')
    const logoUrl = await processImage(
      coordonnees.logo,
      `${WELCOMEBOOK_SLUG}/client/logo.jpg`
    )
    const backgroundUrl = await processImage(
      coordonnees['Image de fond'],
      `${WELCOMEBOOK_SLUG}/client/background.jpg`
    )

    // Créer le client
    const { data, error } = await supabase
      .from('clients')
      .insert({
        user_id: userId,
        email: ACCOUNT_EMAIL,
        slug: WELCOMEBOOK_SLUG,
        name: coordonnees['Texte menu'] || '🌲 Camping la Faloise',
        header_subtitle: 'Bienvenue au Camping la Faloise',
        background_image: backgroundUrl,
        footer_contact_phone: coordonnees['Téléphone Hôte'],
        footer_contact_email: coordonnees['Mail Hôte'],
        footer_contact_facebook: coordonnees.Facebook,
        footer_contact_instagram: coordonnees.Instagram,
        footer_contact_website: coordonnees['site web'],
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    console.log(`   ✅ Client créé avec succès (ID: ${data.id})`)
    stats.clientCreated = true
    return data.id
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`   ❌ Erreur création client: ${errorMessage}`)
    stats.errors.push(`Client creation failed: ${errorMessage}`)
    return null
  }
}

/**
 * Crée les catégories
 */
async function createCategories(): Promise<Map<string, string>> {
  console.log('\n📁 ÉTAPE 3: Création des catégories')

  const categoryMap = new Map<string, string>()
  const categories = [
    { name: 'Informations', slug: 'informations', icon: '📋' },
    { name: 'Activités', slug: 'activites', icon: '🎨' },
    { name: 'Magasins', slug: 'magasins', icon: '🛍️' },
    { name: 'Restaurants', slug: 'restaurants', icon: '🍽️' },
  ]

  for (const category of categories) {
    try {
      // Vérifier si la catégorie existe
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category.slug)
        .maybeSingle()

      if (existing) {
        console.log(`   ✅ Catégorie "${category.name}" existe déjà`)
        categoryMap.set(category.name, existing.id)
        continue
      }

      // Créer la catégorie
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: category.name,
          slug: category.slug,
          icon: category.icon,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      console.log(`   ✅ Catégorie "${category.name}" créée`)
      categoryMap.set(category.name, data.id)
      stats.categoriesCreated++
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`   ❌ Erreur création catégorie "${category.name}": ${errorMessage}`)
      stats.errors.push(`Category creation failed for ${category.name}: ${errorMessage}`)
    }
  }

  return categoryMap
}

/**
 * Parse le fichier LAFALOISETIPS.csv
 */
async function parseTips(): Promise<TipCsv[]> {
  console.log('\n📄 Lecture de LAFALOISETIPS.csv')

  try {
    const content = await fs.readFile(CSV_TIPS, 'utf-8')
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
      relax_quotes: true,
      relax_column_count: true,
    }) as TipCsv[]

    console.log(`   ✅ ${records.length} tip(s) lu(s)`)
    return records
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`   ❌ Erreur lecture CSV: ${errorMessage}`)
    stats.errors.push(`Parse tips.csv failed: ${errorMessage}`)
    return []
  }
}

/**
 * Crée un tip avec ses médias
 */
async function createTip(
  tipData: TipCsv,
  clientId: string,
  categoryMap: Map<string, string>,
  index: number
): Promise<void> {
  const title = tipData['Titre souhaité']
  console.log(`\n   📝 [${index + 1}/33] ${title}`)

  try {
    // Récupérer l'ID de la catégorie
    const categoryId = categoryMap.get(tipData['Catégorie'])
    if (!categoryId) {
      throw new Error(`Catégorie "${tipData['Catégorie']}" non trouvée`)
    }

    // Upload l'image principale
    let mainImageUrl: string | null = null
    if (tipData.Image) {
      const imageFileName = `tip-${index + 1}-main.jpg`
      mainImageUrl = await processImage(
        tipData.Image,
        `${WELCOMEBOOK_SLUG}/tips/${imageFileName}`
      )
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
        promo_code: tipData['code promo'] || null,
        order: index,
      })
      .select()
      .single()

    if (tipError) {
      throw tipError
    }

    console.log(`      ✅ Tip créé (ID: ${tip.id})`)
    stats.tipsCreated++

    // Créer les médias supplémentaires (photos 2-6)
    const photoFields: Array<keyof TipCsv> = ['photo 2', 'photo 3', 'photo 4', 'photo 5', 'photo 6']
    const mediaUrls: string[] = []

    // Ajouter l'image principale en premier
    if (mainImageUrl) {
      mediaUrls.push(mainImageUrl)
    }

    // Traiter les photos supplémentaires
    for (let i = 0; i < photoFields.length; i++) {
      const photoUrl = tipData[photoFields[i]]
      if (photoUrl && photoUrl.trim() !== '') {
        const fileName = `tip-${index + 1}-photo${i + 2}.jpg`
        const uploadedUrl = await processImage(
          photoUrl,
          `${WELCOMEBOOK_SLUG}/tips/${fileName}`
        )
        if (uploadedUrl) {
          mediaUrls.push(uploadedUrl)
        }
      }
    }

    // Créer les entrées tip_media
    if (mediaUrls.length > 0) {
      const mediaInserts = mediaUrls.map((url, idx) => ({
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
        console.log(`      ✅ ${mediaUrls.length} média(s) créé(s)`)
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
  console.log('🚀 IMPORTATION CAMPING LA FALOISE\n')
  console.log('=' .repeat(60))

  const startTime = Date.now()

  try {
    // Étape 1: Créer l'utilisateur
    const userId = await createUser()
    if (!userId) {
      throw new Error('Impossible de créer/récupérer l\'utilisateur')
    }

    // Étape 2: Parser les coordonnées
    const coordonnees = await parseCoordonnees()
    if (!coordonnees) {
      throw new Error('Impossible de lire COORDONNEES.csv')
    }

    // Étape 3: Créer le client
    const clientId = await createClient(userId, coordonnees)
    if (!clientId) {
      throw new Error('Impossible de créer le client')
    }

    // Étape 4: Créer les catégories
    const categoryMap = await createCategories()
    if (categoryMap.size === 0) {
      throw new Error('Aucune catégorie créée')
    }

    // Étape 5: Parser et importer les tips
    const tips = await parseTips()
    if (tips.length === 0) {
      throw new Error('Aucun tip trouvé dans LAFALOISETIPS.csv')
    }

    console.log('\n📝 ÉTAPE 4: Importation des tips')
    for (let i = 0; i < tips.length; i++) {
      await createTip(tips[i], clientId, categoryMap, i)
    }

    // Rapport final
    const duration = Math.round((Date.now() - startTime) / 1000)
    console.log('\n' + '='.repeat(60))
    console.log('\n✨ IMPORTATION TERMINÉE !\n')
    console.log('📊 RÉSUMÉ:')
    console.log(`   • Utilisateur: ${stats.userCreated ? '✅ Créé' : '✅ Existant'}`)
    console.log(`   • Client: ${stats.clientCreated ? '✅ Créé' : '✅ Existant'}`)
    console.log(`   • Catégories créées: ${stats.categoriesCreated}`)
    console.log(`   • Tips créés: ${stats.tipsCreated}/33`)
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
    console.log(`   https://welcomeapp.vercel.app/${WELCOMEBOOK_SLUG}`)
    console.log('\n🔐 Connexion gestionnaire:')
    console.log(`   Email: ${ACCOUNT_EMAIL}`)
    console.log(`   Password: ${ACCOUNT_PASSWORD}`)
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
