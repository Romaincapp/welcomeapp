/**
 * Script de suppression des utilisateurs Auth
 *
 * ATTENTION : Nécessite la SUPABASE_SERVICE_ROLE_KEY
 *
 * Ce script supprime TOUS les utilisateurs de auth.users
 *
 * Usage: node scripts/delete-auth-users.mjs
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
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Variables d\'environnement manquantes')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✅' : '❌')
  process.exit(1)
}

// Client avec service_role pour accéder à auth.users
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function deleteAllAuthUsers() {
  console.log('\n🗑️  SUPPRESSION DES UTILISATEURS AUTH\n')
  console.log('⚠️  ATTENTION : Cette opération est IRRÉVERSIBLE !\n')

  try {
    // 1. Lister tous les utilisateurs Auth
    console.log('[1/2] 📋 Récupération de tous les utilisateurs Auth...')
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()

    if (listError) {
      throw new Error(`Erreur lors de la récupération des utilisateurs: ${listError.message}`)
    }

    if (!users || users.length === 0) {
      console.log('✅ Aucun utilisateur Auth à supprimer.')
      return
    }

    console.log(`   Trouvé ${users.length} utilisateur(s) :`)
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (id: ${user.id})`)
    })

    // 2. Supprimer tous les utilisateurs
    console.log('\n[2/2] 🗄️  Suppression de tous les utilisateurs Auth...')
    let successCount = 0
    let errorCount = 0

    for (const user of users) {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id)

      if (error) {
        console.log(`   ❌ Erreur pour ${user.email}:`, error.message)
        errorCount++
      } else {
        console.log(`   ✅ ${user.email} supprimé`)
        successCount++
      }
    }

    console.log(`\n✅ SUPPRESSION TERMINÉE !`)
    console.log(`   Succès: ${successCount}`)
    console.log(`   Erreurs: ${errorCount}\n`)

  } catch (error) {
    console.error('\n❌ ERREUR :', error.message)
    process.exit(1)
  }
}

// Exécuter
deleteAllAuthUsers()
