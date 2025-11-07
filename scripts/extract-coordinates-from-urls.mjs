/**
 * Script pour extraire les coordonnées depuis les URLs Google Maps
 * et mettre à jour la table tips
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const SLUG = 'camping-la-faloise'

// Statistiques
const stats = {
  total: 0,
  success: 0,
  failed: 0,
  skipped: 0,
  errors: [],
}

/**
 * Extrait les coordonnées depuis une URL Google Maps
 *
 * Formats supportés :
 * - https://www.google.com/maps/place/NAME/@49.12,2.34,15z/...
 * - https://www.google.fr/maps/place/NAME/@49.12,2.34,17z/...
 * - https://maps.google.com/?q=49.12,2.34
 * - https://www.google.com/maps/@49.12,2.34,15z
 */
function extractCoordinatesFromUrl(url) {
  if (!url || typeof url !== 'string') {
    return null
  }

  // Pattern 1: /@latitude,longitude,zoom
  // Exemple: /@49.5389999,1.8328293,15z
  const pattern1 = /@(-?\d+\.\d+),(-?\d+\.\d+),\d+\.?\d*z/
  const match1 = url.match(pattern1)

  if (match1) {
    const lat = parseFloat(match1[1])
    const lng = parseFloat(match1[2])

    // Validation basique
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng }
    }
  }

  // Pattern 2: ?q=latitude,longitude
  // Exemple: ?q=49.12,2.34
  const pattern2 = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/
  const match2 = url.match(pattern2)

  if (match2) {
    const lat = parseFloat(match2[1])
    const lng = parseFloat(match2[2])

    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng }
    }
  }

  // Pattern 3: /maps/@latitude,longitude
  // Exemple: /maps/@49.12,2.34
  const pattern3 = /\/maps\/@(-?\d+\.\d+),(-?\d+\.\d+)/
  const match3 = url.match(pattern3)

  if (match3) {
    const lat = parseFloat(match3[1])
    const lng = parseFloat(match3[2])

    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng }
    }
  }

  return null
}

/**
 * Extrait le nom du lieu depuis l'URL Google Maps
 */
function extractPlaceNameFromUrl(url) {
  if (!url || typeof url !== 'string') {
    return null
  }

  // Pattern: /place/NAME/@
  const pattern = /\/place\/([^/@]+)/
  const match = url.match(pattern)

  if (match) {
    // Décoder l'URL et nettoyer
    const name = decodeURIComponent(match[1])
      .replace(/\+/g, ' ')
      .trim()
    return name
  }

  return null
}

/**
 * Met à jour un tip avec les coordonnées extraites
 */
async function updateTipCoordinates(tipId, coordinates, placeName) {
  try {
    const updateData = {
      coordinates: coordinates,
    }

    // Ajouter le nom du lieu comme location si disponible
    if (placeName) {
      updateData.location = placeName
    }

    const { error } = await supabase
      .from('tips')
      .update(updateData)
      .eq('id', tipId)

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error(`   ❌ Erreur mise à jour: ${error.message}`)
    stats.errors.push(`Update failed for tip ${tipId}: ${error.message}`)
    return false
  }
}

/**
 * Traite un tip
 */
async function processTip(tip, index, total) {
  console.log(`\n[${index + 1}/${total}] ${tip.title}`)

  // Skip si pas d'URL
  if (!tip.route_url) {
    console.log('   ⏭️  Pas d\'URL Google Maps')
    stats.skipped++
    return
  }

  // Skip si déjà des coordonnées
  if (tip.coordinates) {
    console.log('   ⏭️  Coordonnées déjà présentes')
    stats.skipped++
    return
  }

  // Extraire les coordonnées
  const coordinates = extractCoordinatesFromUrl(tip.route_url)

  if (!coordinates) {
    console.log('   ❌ Impossible d\'extraire les coordonnées')
    console.log(`   URL: ${tip.route_url.substring(0, 80)}...`)
    stats.failed++
    stats.errors.push(`Failed to extract coordinates for "${tip.title}"`)
    return
  }

  // Extraire le nom du lieu
  const placeName = extractPlaceNameFromUrl(tip.route_url)

  console.log(`   ✅ Coordonnées: ${coordinates.lat}, ${coordinates.lng}`)
  if (placeName) {
    console.log(`   📍 Lieu: ${placeName}`)
  }

  // Mettre à jour la DB
  const success = await updateTipCoordinates(tip.id, coordinates, placeName)

  if (success) {
    stats.success++
    console.log('   ✅ Mise à jour réussie')
  } else {
    stats.failed++
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🗺️  EXTRACTION DES COORDONNÉES DEPUIS URLS GOOGLE MAPS\n')
  console.log('=' .repeat(60))

  // Récupérer le client
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id')
    .eq('slug', SLUG)
    .maybeSingle()

  if (clientError || !client) {
    throw new Error('Client non trouvé')
  }

  console.log(`\n✅ Client trouvé: ${SLUG}`)

  // Récupérer tous les tips
  const { data: tips, error: tipsError } = await supabase
    .from('tips')
    .select('id, title, route_url, coordinates, location')
    .eq('client_id', client.id)
    .order('order')

  if (tipsError || !tips) {
    throw new Error('Erreur récupération tips')
  }

  stats.total = tips.length
  console.log(`\n📝 ${tips.length} tips à traiter\n`)

  // Traiter chaque tip
  for (let i = 0; i < tips.length; i++) {
    await processTip(tips[i], i, tips.length)
  }

  // Rapport final
  const duration = Date.now()
  console.log('\n' + '='.repeat(60))
  console.log('\n✨ TRAITEMENT TERMINÉ !\n')
  console.log('📊 RÉSUMÉ:')
  console.log(`   • Total tips: ${stats.total}`)
  console.log(`   • ✅ Succès: ${stats.success}`)
  console.log(`   • ❌ Échecs: ${stats.failed}`)
  console.log(`   • ⏭️  Ignorés: ${stats.skipped}`)
  console.log(`   • ⚠️  Erreurs: ${stats.errors.length}`)

  if (stats.errors.length > 0) {
    console.log('\n⚠️  ERREURS DÉTECTÉES:')
    stats.errors.forEach((err, idx) => {
      console.log(`   ${idx + 1}. ${err}`)
    })
  }

  console.log('\n🗺️  Prochaine étape:')
  console.log('   Exécutez: node scripts/check-camping-coordinates.mjs')
  console.log('   Pour vérifier les coordonnées mises à jour')

  console.log('\n🌐 Testez la carte:')
  console.log(`   https://welcomeapp.vercel.app/${SLUG}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(`\n💥 ERREUR FATALE: ${error.message}`)
    process.exit(1)
  })
