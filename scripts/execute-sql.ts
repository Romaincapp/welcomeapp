import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = 'https://nimbzitahumdefggtiob.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pbWJ6aXRhaHVtZGVmZ2d0aW9iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI0NzQ5NiwiZXhwIjoyMDc1ODIzNDk2fQ.HV4pEMqkjIng92Jp8Q61Yogms-PevI1MGdro7q1dmqQ'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function executeSql() {
  console.log('🔧 Exécution du script SQL fix-users-table.sql...\n')

  try {
    // Lire le fichier SQL
    const sqlPath = path.join(process.cwd(), 'supabase', 'fix-users-table.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8')

    // Séparer les commandes SQL (en ignorant les commentaires)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`📝 ${statements.length} commandes SQL à exécuter\n`)

    let successCount = 0
    let errorCount = 0

    // Exécuter chaque commande séparément
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]

      // Ignorer les commentaires de bloc
      if (statement.trim().startsWith('/*') || statement.trim() === '') {
        continue
      }

      console.log(`Commande ${i + 1}/${statements.length}...`)

      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement + ';'
        })

        if (error) {
          console.log(`❌ Erreur: ${error.message}`)
          errorCount++
        } else {
          console.log(`✅ Succès`)
          successCount++
        }
      } catch (err: any) {
        // L'API RPC n'est peut-être pas disponible, essayons une approche différente
        console.log(`⚠️  La méthode RPC n'est pas disponible`)
        console.log(`   Vous devez exécuter ce script manuellement dans le Dashboard Supabase`)
        break
      }
    }

    console.log(`\n📊 Résultat: ${successCount} succès, ${errorCount} erreurs`)

    if (errorCount === 0 && successCount > 0) {
      console.log('\n✅ Script exécuté avec succès!')
      console.log('\nVous pouvez maintenant créer un utilisateur:')
      console.log('   1. Dashboard Supabase → Authentication → Users')
      console.log('   2. Add user → Create new user')
      console.log('   3. Email: test@welcomebook.be')
      console.log('   4. Password: Test123456!')
      console.log('   5. Cochez "Auto Confirm User"')
    }

  } catch (err: any) {
    console.error('\n❌ Erreur lors de la lecture ou de l\'exécution du script:')
    console.error(`   ${err.message}`)
    console.log('\n📝 Solution alternative:')
    console.log('   1. Ouvrez: https://supabase.com/dashboard/project/nimbzitahumdefggtiob/sql/new')
    console.log('   2. Copiez le contenu de: supabase/fix-users-table.sql')
    console.log('   3. Collez-le dans le SQL Editor')
    console.log('   4. Cliquez sur "Run"')
  }
}

executeSql()
