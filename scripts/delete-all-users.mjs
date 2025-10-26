/**
 * Script de nettoyage complet - Supprime TOUS les utilisateurs
 *
 * ATTENTION : Cette opération est IRRÉVERSIBLE !
 *
 * Ce script :
 * 1. Liste tous les clients
 * 2. Supprime tous les fichiers storage pour chaque client
 * 3. Supprime tous les clients de la DB (cascade automatique)
 *
 * Usage: node scripts/delete-all-users.mjs
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Charger les variables d'environnement
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function deleteAllUsers() {
  console.log('\n🗑️  SCRIPT DE NETTOYAGE COMPLET\n')
  console.log('⚠️  ATTENTION : Cette opération est IRRÉVERSIBLE !\n')

  try {
    // 1. Lister tous les clients
    console.log('[1/3] 📋 Récupération de tous les clients...')
    const { data: clients, error: fetchError } = await supabase
      .from('clients')
      .select('id, email, slug, name')
      .order('created_at', { ascending: false })

    if (fetchError) {
      throw new Error(`Erreur lors de la récupération des clients: ${fetchError.message}`)
    }

    if (!clients || clients.length === 0) {
      console.log('✅ Aucun client à supprimer.')
      return
    }

    console.log(`   Trouvé ${clients.length} client(s) :`)
    clients.forEach((client, index) => {
      console.log(`   ${index + 1}. ${client.email} (slug: ${client.slug}, nom: ${client.name})`)
    })

    // 2. Supprimer les fichiers storage pour chaque client
    console.log('\n[2/3] 🗂️  Suppression des fichiers storage...')
    for (const client of clients) {
      console.log(`   Traitement de ${client.slug}...`)

      // Lister les fichiers
      const { data: files, error: listError } = await supabase.storage
        .from('media')
        .list(client.slug, { limit: 1000 })

      if (listError) {
        console.log(`   ⚠️  Erreur lors du listing des fichiers pour ${client.slug}:`, listError.message)
        continue
      }

      if (files && files.length > 0) {
        console.log(`   Trouvé ${files.length} fichier(s) pour ${client.slug}`)
        const filePaths = files.map(file => `${client.slug}/${file.name}`)

        const { error: removeError } = await supabase.storage
          .from('media')
          .remove(filePaths)

        if (removeError) {
          console.log(`   ⚠️  Erreur lors de la suppression des fichiers:`, removeError.message)
        } else {
          console.log(`   ✅ ${files.length} fichier(s) supprimé(s)`)
        }
      } else {
        console.log(`   ℹ️  Aucun fichier trouvé pour ${client.slug}`)
      }
    }

    // 3. Supprimer tous les clients (cascade automatique)
    console.log('\n[3/3] 🗄️  Suppression de tous les clients de la base de données...')
    const clientIds = clients.map(c => c.id)

    const { error: deleteError } = await supabase
      .from('clients')
      .delete()
      .in('id', clientIds)

    if (deleteError) {
      throw new Error(`Erreur lors de la suppression des clients: ${deleteError.message}`)
    }

    console.log(`   ✅ ${clients.length} client(s) supprimé(s) avec succès`)
    console.log('\n✅ NETTOYAGE TERMINÉ !')
    console.log('\n⚠️  NOTE IMPORTANTE :')
    console.log('Les utilisateurs dans Supabase Auth (auth.users) ne sont PAS supprimés.')
    console.log('Pour les supprimer, va dans le Dashboard Supabase :')
    console.log('Authentication → Users → Sélectionner → Delete')
    console.log('\nOu utilise le script delete-auth-users.mjs (nécessite service_role_key)\n')

  } catch (error) {
    console.error('\n❌ ERREUR :', error.message)
    process.exit(1)
  }
}

// Exécuter
deleteAllUsers()
