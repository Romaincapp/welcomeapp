/**
 * Script pour vérifier les coordonnées des tips Camping La Faloise
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nimbzitahumdefggtiob.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pbWJ6aXRhaHVtZGVmZ2d0aW9iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI0NzQ5NiwiZXhwIjoyMDc1ODIzNDk2fQ.HV4pEMqkjIng92Jp8Q61Yogms-PevI1MGdro7q1dmqQ'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkCoordinates() {
  console.log('🗺️  VÉRIFICATION DES DONNÉES DE LOCALISATION\n')
  console.log('=' .repeat(60))

  // Récupérer le client
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('slug', 'camping-la-faloise')
    .maybeSingle()

  if (!client) {
    console.log('❌ Client non trouvé')
    return
  }

  // Récupérer tous les tips avec leurs données de localisation
  const { data: tips } = await supabase
    .from('tips')
    .select('id, title, location, coordinates, route_url')
    .eq('client_id', client.id)
    .order('order')

  if (!tips || tips.length === 0) {
    console.log('❌ Aucun tip trouvé')
    return
  }

  console.log(`\n📊 STATISTIQUES (${tips.length} tips):\n`)

  const stats = {
    total: tips.length,
    withRouteUrl: 0,
    withCoordinates: 0,
    withLocation: 0,
    withAll: 0,
    withNothing: 0,
  }

  tips.forEach((tip) => {
    if (tip.route_url) stats.withRouteUrl++
    if (tip.coordinates) stats.withCoordinates++
    if (tip.location) stats.withLocation++
    if (tip.route_url && tip.coordinates && tip.location) stats.withAll++
    if (!tip.route_url && !tip.coordinates && !tip.location) stats.withNothing++
  })

  console.log(`   • Tips avec route_url (Google Maps) : ${stats.withRouteUrl}/${stats.total}`)
  console.log(`   • Tips avec coordinates (lat/lng)   : ${stats.withCoordinates}/${stats.total}`)
  console.log(`   • Tips avec location (adresse)      : ${stats.withLocation}/${stats.total}`)
  console.log(`   • Tips avec toutes les données      : ${stats.withAll}/${stats.total}`)
  console.log(`   • Tips sans aucune localisation     : ${stats.withNothing}/${stats.total}`)

  console.log('\n\n📍 DÉTAILS PAR TIP:\n')

  tips.forEach((tip, i) => {
    const hasRoute = tip.route_url ? '✅' : '❌'
    const hasCoords = tip.coordinates ? '✅' : '❌'
    const hasLocation = tip.location ? '✅' : '❌'

    console.log(`${i + 1}. ${tip.title}`)
    console.log(`   Google Maps URL: ${hasRoute}`)
    console.log(`   Coordinates:     ${hasCoords}`)
    console.log(`   Location:        ${hasLocation}`)

    if (tip.route_url) {
      console.log(`   URL: ${tip.route_url.substring(0, 80)}...`)
    }
    if (tip.coordinates) {
      console.log(`   Coords: ${JSON.stringify(tip.coordinates)}`)
    }
    if (tip.location) {
      console.log(`   Adresse: ${tip.location}`)
    }
    console.log('')
  })

  // Recommandations
  console.log('=' .repeat(60))
  console.log('\n💡 RECOMMANDATIONS:\n')

  if (stats.withRouteUrl > 0 && stats.withCoordinates < stats.withRouteUrl) {
    console.log(`⚠️  ${stats.withRouteUrl - stats.withCoordinates} tips ont une URL Google Maps mais pas de coordonnées`)
    console.log('   → On peut extraire les coordonnées depuis les URLs Google Maps')
    console.log('   → Cela permettra d\'afficher ces tips sur la carte interactive')
  }

  if (stats.withCoordinates === 0) {
    console.log('⚠️  AUCUN tip n\'a de coordonnées pour la carte interactive')
    console.log('   → La carte sera vide actuellement')
    console.log('   → Il faut extraire les coordonnées depuis les URLs Google Maps')
  }

  if (stats.withCoordinates > 0) {
    console.log(`✅ ${stats.withCoordinates} tips peuvent être affichés sur la carte`)
  }

  console.log('\n🌐 Testez le welcomebook:')
  console.log('   https://welcomeapp.vercel.app/camping-la-faloise')
}

checkCoordinates()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  })
