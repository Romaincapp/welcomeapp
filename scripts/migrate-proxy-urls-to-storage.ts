/**
 * Script de migration : Convertir URLs proxy Google vers Supabase Storage
 *
 * Usage: npx tsx scripts/migrate-proxy-urls-to-storage.ts
 *
 * Ce script :
 * 1. Trouve tous les tip_media avec URLs proxy Google (/api/places/photo)
 * 2. Télécharge chaque image depuis le proxy
 * 3. Upload vers Supabase Storage
 * 4. Met à jour l'URL en base de données
 */

import { createClient } from '@supabase/supabase-js'

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY! // Service key pour bypass RLS
const BASE_URL = 'https://welcomeapp.be' // Pour construire URLs complètes

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variables d\'environnement manquantes :')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

interface ProxyMedia {
  id: string
  tip_id: string
  url: string
  type: string
  order: number
  tip_title: string
  client_email: string
}

async function downloadImageFromProxy(proxyUrl: string): Promise<Blob | null> {
  try {
    // Construire l'URL complète si elle est relative
    const fullUrl = proxyUrl.startsWith('http') ? proxyUrl : `${BASE_URL}${proxyUrl}`

    console.log(`  📥 Téléchargement depuis: ${fullUrl.substring(0, 80)}...`)

    const response = await fetch(fullUrl)

    if (!response.ok) {
      console.error(`  ❌ Erreur HTTP ${response.status}: ${response.statusText}`)
      return null
    }

    const blob = await response.blob()

    // Vérifier que c'est bien une image
    if (!blob.type.startsWith('image/')) {
      console.error(`  ❌ Type invalide: ${blob.type} (attendu: image/*)`)
      return null
    }

    const sizeMB = (blob.size / 1024 / 1024).toFixed(2)
    console.log(`  ✅ Téléchargé: ${blob.type}, ${sizeMB} MB`)

    return blob

  } catch (error) {
    console.error(`  ❌ Erreur téléchargement:`, error)
    return null
  }
}

async function uploadToStorage(blob: Blob, tipId: string): Promise<string | null> {
  try {
    // Générer nom de fichier unique
    const fileExt = blob.type.split('/')[1] || 'jpg'
    const fileName = `${tipId}-migrated-${Date.now()}.${fileExt}`
    const filePath = `tips/${fileName}`

    console.log(`  📤 Upload vers Storage: ${filePath}`)

    // Upload vers Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, blob, {
        contentType: blob.type,
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error(`  ❌ Erreur upload Storage:`, uploadError)
      return null
    }

    // Récupérer URL publique
    const { data: publicUrlData } = supabase.storage
      .from('media')
      .getPublicUrl(filePath)

    console.log(`  ✅ URL permanente: ${publicUrlData.publicUrl}`)

    return publicUrlData.publicUrl

  } catch (error) {
    console.error(`  ❌ Erreur upload:`, error)
    return null
  }
}

async function updateMediaUrl(mediaId: string, newUrl: string): Promise<boolean> {
  try {
    console.log(`  🔄 Mise à jour base de données...`)

    const { error } = await supabase
      .from('tip_media')
      .update({ url: newUrl })
      .eq('id', mediaId)

    if (error) {
      console.error(`  ❌ Erreur update DB:`, error)
      return false
    }

    console.log(`  ✅ Base de données mise à jour`)
    return true

  } catch (error) {
    console.error(`  ❌ Erreur update:`, error)
    return false
  }
}

async function migrateProxyUrls(targetEmail?: string) {
  console.log('🚀 Démarrage de la migration des URLs proxy vers Supabase Storage\n')

  // 1. Récupérer tous les tip_media avec URLs proxy
  console.log('📋 Recherche des médias avec URLs proxy...')

  let query = supabase
    .from('tip_media')
    .select(`
      id,
      tip_id,
      url,
      type,
      order,
      tips!inner (
        title,
        clients!inner (
          email
        )
      )
    `)
    .like('url', '/api/places/photo%')

  // Filtrer par email si spécifié
  if (targetEmail) {
    console.log(`🎯 Filtre: uniquement pour ${targetEmail}\n`)
    query = query.eq('tips.clients.email', targetEmail)
  }

  const { data: proxyMedias, error: fetchError } = await query

  if (fetchError) {
    console.error('❌ Erreur lors de la récupération des médias:', fetchError)
    process.exit(1)
  }

  if (!proxyMedias || proxyMedias.length === 0) {
    console.log('✅ Aucun média avec URL proxy trouvé. Migration terminée.')
    process.exit(0)
  }

  console.log(`📦 ${proxyMedias.length} média(s) à migrer\n`)

  // 2. Migrer chaque média
  const results = {
    success: 0,
    failed: 0,
    skipped: 0
  }

  for (let i = 0; i < proxyMedias.length; i++) {
    const media = proxyMedias[i] as any
    const mediaData: ProxyMedia = {
      id: media.id,
      tip_id: media.tip_id,
      url: media.url,
      type: media.type,
      order: media.order,
      tip_title: media.tips.title,
      client_email: media.tips.clients.email
    }

    console.log(`\n[${i + 1}/${proxyMedias.length}] Migration de "${mediaData.tip_title}"`)
    console.log(`   Client: ${mediaData.client_email}`)
    console.log(`   Media ID: ${mediaData.id}`)

    // Télécharger l'image
    const blob = await downloadImageFromProxy(mediaData.url)
    if (!blob) {
      console.log(`  ⚠️ Échec du téléchargement, SKIP\n`)
      results.failed++
      continue
    }

    // Upload vers Storage
    const permanentUrl = await uploadToStorage(blob, mediaData.tip_id)
    if (!permanentUrl) {
      console.log(`  ⚠️ Échec de l'upload, SKIP\n`)
      results.failed++
      continue
    }

    // Mettre à jour la base de données
    const updated = await updateMediaUrl(mediaData.id, permanentUrl)
    if (!updated) {
      console.log(`  ⚠️ Échec de la mise à jour DB, SKIP\n`)
      results.failed++
      continue
    }

    console.log(`  🎉 Migration réussie!\n`)
    results.success++

    // Petit délai pour éviter de surcharger l'API
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // 3. Résumé
  console.log('\n' + '='.repeat(60))
  console.log('📊 RÉSUMÉ DE LA MIGRATION')
  console.log('='.repeat(60))
  console.log(`✅ Réussies  : ${results.success}`)
  console.log(`❌ Échouées  : ${results.failed}`)
  console.log(`⚠️ Ignorées  : ${results.skipped}`)
  console.log(`📦 Total     : ${proxyMedias.length}`)
  console.log('='.repeat(60) + '\n')

  if (results.success > 0) {
    console.log('🎉 Migration terminée avec succès!')
    console.log('💡 Les images sont maintenant stockées de manière permanente dans Supabase Storage')
  }

  if (results.failed > 0) {
    console.log(`\n⚠️ ATTENTION: ${results.failed} média(s) n'ont pas pu être migrés`)
    console.log('   Vérifiez les erreurs ci-dessus pour plus de détails')
  }
}

// Point d'entrée du script
const targetEmail = process.argv[2] // Email optionnel en argument

if (targetEmail) {
  console.log(`🎯 Mode ciblé: migration uniquement pour ${targetEmail}\n`)
} else {
  console.log('🌍 Mode global: migration de TOUS les médias avec URLs proxy\n')
  console.log('💡 Tip: Vous pouvez spécifier un email : npx tsx scripts/migrate-proxy-urls-to-storage.ts user@example.com\n')
}

migrateProxyUrls(targetEmail)
  .catch(error => {
    console.error('\n❌ ERREUR FATALE:', error)
    process.exit(1)
  })
