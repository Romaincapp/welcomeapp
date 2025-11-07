#!/usr/bin/env node

/**
 * Script pour nettoyer les clients orphelins avec slug basé sur email
 *
 * Ce script :
 * 1. Liste tous les clients avec "Mon WelcomeBook" (anciens comptes buggés)
 * 2. Supprime leurs fichiers du storage
 * 3. Supprime les clients de la DB
 *
 * Usage: node scripts/clean-orphan-clients.mjs
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_KEY ou NEXT_PUBLIC_SUPABASE_ANON_KEY requis')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function cleanOrphanClients() {
  console.log('🔍 Recherche des clients avec "Mon WelcomeBook"...\n')

  // Trouver tous les clients avec le nom par défaut de l'ancien code
  const { data: clients, error } = await supabase
    .from('clients')
    .select('id, name, slug, email, user_id')
    .eq('name', 'Mon WelcomeBook')

  if (error) {
    console.error('❌ Erreur:', error.message)
    return
  }

  if (!clients || clients.length === 0) {
    console.log('✅ Aucun client orphelin trouvé. La base est propre !')
    return
  }

  console.log(`📋 ${clients.length} client(s) orphelin(s) trouvé(s):\n`)
  clients.forEach((c, i) => {
    console.log(`${i + 1}. ${c.email}`)
    console.log(`   Slug: ${c.slug}`)
    console.log(`   User ID: ${c.user_id || 'N/A'}`)
    console.log(`   Client ID: ${c.id}\n`)
  })

  // Confirmation
  console.log('⚠️  ATTENTION: Cette action est IRRÉVERSIBLE.')
  console.log('⚠️  Les fichiers storage ET les clients seront supprimés.\n')

  // Suppression (automatique pour ce script de nettoyage)
  console.log('🗑️  Suppression en cours...\n')

  for (const client of clients) {
    console.log(`Traitement de ${client.email} (${client.slug})...`)

    // 1. Supprimer les fichiers storage
    try {
      const { data: files } = await supabase.storage
        .from('media')
        .list(client.slug, { limit: 1000 })

      if (files && files.length > 0) {
        const filePaths = files.map(file => `${client.slug}/${file.name}`)
        const { error: storageError } = await supabase.storage
          .from('media')
          .remove(filePaths)

        if (storageError) {
          console.warn(`  ⚠️  Erreur suppression storage: ${storageError.message}`)
        } else {
          console.log(`  ✅ ${files.length} fichier(s) storage supprimé(s)`)
        }
      } else {
        console.log('  ℹ️  Aucun fichier storage')
      }
    } catch (err) {
      console.warn(`  ⚠️  Erreur storage: ${err.message}`)
    }

    // 2. Supprimer le client (cascade automatique vers tips, tip_media, etc.)
    const { error: deleteError } = await supabase
      .from('clients')
      .delete()
      .eq('id', client.id)

    if (deleteError) {
      console.error(`  ❌ Erreur suppression client: ${deleteError.message}`)
    } else {
      console.log(`  ✅ Client supprimé de la DB\n`)
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Nettoyage terminé !')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n💡 Tu peux maintenant créer un nouveau compte avec le signup.')
  console.log('💡 Le slug sera correctement généré depuis le nom du logement.\n')
}

cleanOrphanClients()
