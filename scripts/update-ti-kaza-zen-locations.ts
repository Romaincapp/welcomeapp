/**
 * Script pour ajouter les localisations Google Maps aux plages de Ti Kaza Zen
 *
 * Usage: npx tsx scripts/update-ti-kaza-zen-locations.ts
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey)

const WELCOMEBOOK_SLUG = 'ti-kaza-zen'

// Coordonnées GPS des plages (recherchées sur le web)
// Format: { title: { lat, lng, maps_url } }
const LOCATIONS: Record<string, { lat: number; lng: number; maps_url: string }> = {
  // Plages de Sainte-Anne
  'Plage du Bourg de Saint-Anne': {
    lat: 16.2270,
    lng: -61.3890,
    maps_url: 'https://maps.app.goo.gl/16zAVYw4WgqYDz5u9', // déjà dans le CSV
  },
  'Plage de la caravelle': {
    lat: 16.2247,
    lng: -61.3932,
    maps_url: 'https://maps.google.com/?q=16.2247,-61.3932',
  },
  'Plage de bois jolan': {
    lat: 16.2326,
    lng: -61.3703,
    maps_url: 'https://maps.google.com/?q=16.2326,-61.3703',
  },
  'Plage de petit havre': {
    lat: 16.2100,
    lng: -61.4200,
    maps_url: 'https://maps.google.com/?q=16.21,-61.42',
  },

  // Plages de Saint-François
  'La douche': {
    lat: 16.2580,
    lng: -61.2750,
    maps_url: 'https://maps.google.com/?q=16.258,-61.275',
  },
  'Plages des salines': {
    lat: 16.2573,
    lng: -61.2600,
    maps_url: 'https://maps.google.com/?q=16.2573,-61.26',
  },
  'Plage des raisins clair': {
    lat: 16.2494,
    lng: -61.2842,
    maps_url: 'https://maps.google.com/?q=16.2494,-61.2842',
  },

  // Plages du nord Grande-Terre
  'Plage anse Bertrand la chapelle': {
    lat: 16.4714,
    lng: -61.5145,
    maps_url: 'https://maps.google.com/?q=16.4714,-61.5145',
  },
  'Plage anse laborde': {
    lat: 16.4839,
    lng: -61.5016,
    maps_url: 'https://maps.google.com/?q=16.4839,-61.5016',
  },
  'Plage du souffleur': {
    lat: 16.4229,
    lng: -61.5333,
    maps_url: 'https://maps.google.com/?q=16.4229,-61.5333',
  },
}

async function main() {
  console.log('🗺️  MISE À JOUR DES LOCALISATIONS - TI KAZA ZEN\n')
  console.log('='.repeat(60))

  try {
    // Récupérer le client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('slug', WELCOMEBOOK_SLUG)
      .single()

    if (clientError || !client) {
      throw new Error(`Client "${WELCOMEBOOK_SLUG}" non trouvé`)
    }

    console.log(`\n✅ Client trouvé (ID: ${client.id})`)

    // Récupérer tous les tips
    const { data: tips, error: tipsError } = await supabase
      .from('tips')
      .select('id, title')
      .eq('client_id', client.id)

    if (tipsError || !tips) {
      throw new Error('Impossible de récupérer les tips')
    }

    console.log(`📋 ${tips.length} tips trouvés\n`)

    let updated = 0
    let skipped = 0

    for (const tip of tips) {
      // Normaliser le titre pour la recherche (lowercase, trim)
      const normalizedTitle = tip.title.toLowerCase().trim()

      // Chercher dans nos localisations
      let location: { lat: number; lng: number; maps_url: string } | null = null

      for (const [key, value] of Object.entries(LOCATIONS)) {
        if (normalizedTitle.includes(key.toLowerCase())) {
          location = value
          break
        }
      }

      if (location) {
        // Mettre à jour le tip
        const { error: updateError } = await supabase
          .from('tips')
          .update({
            coordinates: { lat: location.lat, lng: location.lng },
            route_url: location.maps_url,
          })
          .eq('id', tip.id)

        if (updateError) {
          console.log(`   ❌ Erreur pour "${tip.title}": ${updateError.message}`)
        } else {
          console.log(`   ✅ "${tip.title}" → ${location.lat}, ${location.lng}`)
          updated++
        }
      } else {
        console.log(`   ⏭️  "${tip.title}" (pas de localisation définie)`)
        skipped++
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('\n✨ MISE À JOUR TERMINÉE !\n')
    console.log('📊 RÉSUMÉ:')
    console.log(`   • Tips mis à jour: ${updated}`)
    console.log(`   • Tips ignorés: ${skipped}`)
    console.log('\n🌐 Accédez au welcomebook:')
    console.log(`   https://welcomeapp.be/${WELCOMEBOOK_SLUG}`)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`\n💥 ERREUR: ${errorMessage}`)
    process.exit(1)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`💥 Erreur inattendue: ${errorMessage}`)
    process.exit(1)
  })
