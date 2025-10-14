import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nimbzitahumdefggtiob.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pbWJ6aXRhaHVtZGVmZ2d0aW9iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI0NzQ5NiwiZXhwIjoyMDc1ODIzNDk2fQ.HV4pEMqkjIng92Jp8Q61Yogms-PevI1MGdro7q1dmqQ'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyFix() {
  console.log('🔍 Vérification de la table public.users...\n')

  try {
    // Vérifier si la table public.users existe
    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: false })
      .limit(1)

    if (error) {
      console.log('❌ La table public.users n\'existe pas encore ou a une erreur')
      console.log(`   Erreur: ${error.message}`)
      console.log('\n⚠️  Le script SQL n\'a probablement pas été exécuté correctement')
      console.log('   Essayez de réexécuter le script fix-users-table.sql dans le Dashboard')
      return false
    }

    console.log('✅ La table public.users existe!')
    console.log(`   Nombre d'utilisateurs: ${count || 0}`)

    if (data && data.length > 0) {
      console.log(`   Colonnes: ${Object.keys(data[0]).join(', ')}`)
    }

    // Vérifier si la colonne user_id existe dans clients
    console.log('\n🔍 Vérification de la colonne user_id dans clients...\n')

    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id, name, slug, user_id')
      .limit(1)

    if (clientError) {
      if (clientError.message.includes('user_id')) {
        console.log('❌ La colonne user_id n\'existe pas dans la table clients')
        console.log('   Le script SQL n\'a pas été complètement exécuté')
        return false
      } else {
        console.log(`⚠️  Erreur inattendue: ${clientError.message}`)
      }
    } else {
      console.log('✅ La colonne user_id existe dans la table clients!')
      if (clientData && clientData.length > 0) {
        console.log(`   Exemple: ${JSON.stringify(clientData[0], null, 2)}`)
      }
    }

    console.log('\n✨ Tout semble bon! Vous pouvez maintenant créer un utilisateur.')
    console.log('\n📝 Prochaine étape:')
    console.log('   1. Dashboard Supabase → Authentication → Users → Add user')
    console.log('   2. Email: test@welcomebook.be')
    console.log('   3. Password: Test123456!')
    console.log('   4. ☑️ Cochez "Auto Confirm User"')
    console.log('   5. Cliquez sur "Create user"')

    return true

  } catch (err: any) {
    console.error('❌ Erreur inattendue:')
    console.error(`   ${err.message}`)
    return false
  }
}

verifyFix()
