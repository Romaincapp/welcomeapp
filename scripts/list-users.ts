import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nimbzitahumdefggtiob.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pbWJ6aXRhaHVtZGVmZ2d0aW9iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI0NzQ5NiwiZXhwIjoyMDc1ODIzNDk2fQ.HV4pEMqkjIng92Jp8Q61Yogms-PevI1MGdro7q1dmqQ'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function listUsers() {
  console.log('👥 Liste des utilisateurs dans Supabase Auth...\n')

  try {
    const { data, error } = await supabase.auth.admin.listUsers()

    if (error) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:')
      console.error(`   ${error.message}`)
      return
    }

    if (!data.users || data.users.length === 0) {
      console.log('⚠️  Aucun utilisateur trouvé dans la base de données.')
      console.log('\n📝 Pour créer un utilisateur:')
      console.log('   1. Allez sur https://supabase.com/dashboard')
      console.log('   2. Sélectionnez votre projet')
      console.log('   3. Authentication → Users → Add user')
      console.log('   4. Email: test@welcomebook.be')
      console.log('   5. Password: Test123456!')
      console.log('   6. Cochez "Auto Confirm User"')
      return
    }

    console.log(`✅ ${data.users.length} utilisateur(s) trouvé(s):\n`)

    data.users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Créé le: ${new Date(user.created_at).toLocaleString('fr-FR')}`)
      console.log(`   Email confirmé: ${user.email_confirmed_at ? 'Oui' : 'Non'}`)
      console.log(`   Dernière connexion: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('fr-FR') : 'Jamais'}`)
      console.log('')
    })

  } catch (err: any) {
    console.error('❌ Erreur inattendue:')
    console.error(`   ${err.message}`)
  }
}

listUsers()
