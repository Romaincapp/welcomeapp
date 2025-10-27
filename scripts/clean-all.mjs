import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Charger les variables d'environnement depuis .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

// Client avec service_role pour supprimer les utilisateurs Auth
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function cleanAll() {
  console.log('🧹 Nettoyage complet de la base de données...\n')

  // ========================================
  // 1. Lister les clients
  // ========================================
  console.log('📋 Étape 1: Liste des clients')
  const { data: clients, error: clientsError } = await supabase
    .from('clients')
    .select('id, email, slug, name')

  if (clientsError) {
    console.error('❌ Erreur lecture clients:', clientsError)
    return
  }

  console.log(`✅ ${clients.length} clients trouvés:`)
  clients.forEach(c => console.log(`   - ${c.email} (slug: ${c.slug})`))

  // ========================================
  // 2. Supprimer les fichiers storage pour chaque client
  // ========================================
  console.log('\n🗑️  Étape 2: Suppression des fichiers storage')
  for (const client of clients) {
    console.log(`\n   📁 Nettoyage du dossier: ${client.slug}/`)

    const { data: files, error: listError } = await supabase.storage
      .from('media')
      .list(client.slug, { limit: 1000 })

    if (listError) {
      console.error(`   ❌ Erreur lecture storage:`, listError)
      continue
    }

    if (!files || files.length === 0) {
      console.log(`   ✅ Aucun fichier à supprimer`)
      continue
    }

    console.log(`   📦 ${files.length} fichiers trouvés`)
    const filePaths = files.map(file => `${client.slug}/${file.name}`)

    const { error: removeError } = await supabase.storage
      .from('media')
      .remove(filePaths)

    if (removeError) {
      console.error(`   ❌ Erreur suppression:`, removeError)
    } else {
      console.log(`   ✅ ${files.length} fichiers supprimés`)
    }
  }

  // ========================================
  // 3. Supprimer tous les clients (cascade auto vers tips, tip_media, etc.)
  // ========================================
  console.log('\n🗑️  Étape 3: Suppression de tous les clients')
  const { error: deleteClientsError } = await supabase
    .from('clients')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Supprimer tous sauf un UUID impossible

  if (deleteClientsError) {
    console.error('❌ Erreur suppression clients:', deleteClientsError)
  } else {
    console.log(`✅ ${clients.length} clients supprimés (cascade automatique vers tips, tip_media, secure_sections)`)
  }

  // ========================================
  // 4. Lister les utilisateurs Auth
  // ========================================
  console.log('\n📋 Étape 4: Liste des utilisateurs Auth')
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()

  if (usersError) {
    console.error('❌ Erreur lecture users:', usersError)
    return
  }

  console.log(`✅ ${users.length} utilisateurs trouvés:`)
  users.forEach(u => console.log(`   - ${u.email} (id: ${u.id})`))

  // ========================================
  // 5. Supprimer tous les utilisateurs Auth
  // ========================================
  console.log('\n🗑️  Étape 5: Suppression de tous les utilisateurs Auth')
  let deletedCount = 0

  for (const user of users) {
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id)

    if (deleteUserError) {
      console.error(`   ❌ Erreur suppression ${user.email}:`, deleteUserError)
    } else {
      console.log(`   ✅ ${user.email} supprimé`)
      deletedCount++
    }
  }

  console.log(`\n✅ ${deletedCount} utilisateurs Auth supprimés`)

  // ========================================
  // Résumé final
  // ========================================
  console.log('\n' + '='.repeat(50))
  console.log('🎉 NETTOYAGE TERMINÉ')
  console.log('='.repeat(50))
  console.log(`✅ ${clients.length} clients supprimés (+ tips, tip_media, secure_sections en cascade)`)
  console.log(`✅ ${deletedCount} utilisateurs Auth supprimés`)
  console.log(`✅ Tous les fichiers storage supprimés`)
  console.log('\n🚀 La base de données est maintenant propre !')
}

cleanAll().catch(console.error)
