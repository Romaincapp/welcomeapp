/**
 * Script pour régénérer les miniatures de cartes pour toutes les randonnées existantes
 * À exécuter une seule fois pour migrer les tips existants
 *
 * Usage: npx tsx scripts/regenerate-hike-thumbnails.ts
 */

import { createClient } from '@supabase/supabase-js'
import { generateAndUploadHikeThumbnail } from '../lib/generate-hike-thumbnail'
import { HikeWaypoint } from '../types'

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes')
  console.error('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définies')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface TipWithHikeData {
  id: string
  title: string
  hike_data: {
    waypoints?: HikeWaypoint[]
    [key: string]: any
  } | null
  hike_thumbnail_url: string | null
}

async function regenerateAllHikeThumbnails() {
  console.log('🗺️  Démarrage de la régénération des miniatures de cartes...\n')

  try {
    // Récupérer tous les tips avec hike_data
    console.log('📊 Récupération des randonnées...')
    const { data: tips, error } = await supabase
      .from('tips')
      .select('id, title, hike_data, hike_thumbnail_url')
      .not('hike_data', 'is', null)

    if (error) {
      console.error('❌ Erreur lors de la récupération des tips:', error)
      return
    }

    if (!tips || tips.length === 0) {
      console.log('✅ Aucune randonnée trouvée')
      return
    }

    console.log(`📍 ${tips.length} randonnée(s) trouvée(s)\n`)

    let successCount = 0
    let errorCount = 0
    let skippedCount = 0

    for (const tip of tips as TipWithHikeData[]) {
      const waypoints = tip.hike_data?.waypoints

      if (!waypoints || waypoints.length === 0) {
        console.log(`⏭️  [${tip.id}] ${tip.title} - Pas de waypoints, ignoré`)
        skippedCount++
        continue
      }

      // Vérifier si une miniature existe déjà
      if (tip.hike_thumbnail_url) {
        console.log(`⏭️  [${tip.id}] ${tip.title} - Miniature déjà existante, ignoré`)
        skippedCount++
        continue
      }

      console.log(`🔄 [${tip.id}] ${tip.title} - Génération en cours...`)

      try {
        // Générer et uploader la miniature
        const result = await generateAndUploadHikeThumbnail(waypoints, tip.id)

        if (result.success && result.url) {
          // Mettre à jour le tip avec l'URL de la miniature
          const { error: updateError } = await supabase
            .from('tips')
            .update({ hike_thumbnail_url: result.url })
            .eq('id', tip.id)

          if (updateError) {
            console.error(`❌ [${tip.id}] Erreur de mise à jour:`, updateError.message)
            errorCount++
          } else {
            console.log(`✅ [${tip.id}] Miniature générée: ${result.url}`)
            successCount++
          }
        } else {
          console.error(`❌ [${tip.id}] Échec de génération:`, result.error)
          errorCount++
        }

        // Petite pause pour ne pas surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (err) {
        console.error(`❌ [${tip.id}] Erreur:`, err)
        errorCount++
      }
    }

    console.log('\n🎉 Régénération terminée!')
    console.log(`✅ Succès: ${successCount}`)
    console.log(`⏭️  Ignorés: ${skippedCount}`)
    console.log(`❌ Erreurs: ${errorCount}`)
  } catch (error) {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  }
}

// Exécuter le script
regenerateAllHikeThumbnails()
  .then(() => {
    console.log('\n✨ Script terminé')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Erreur lors de l\'exécution:', error)
    process.exit(1)
  })
