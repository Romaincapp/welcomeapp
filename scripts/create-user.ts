import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nimbzitahumdefggtiob.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pbWJ6aXRhaHVtZGVmZ2d0aW9iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI0NzQ5NiwiZXhwIjoyMDc1ODIzNDk2fQ.HV4pEMqkjIng92Jp8Q61Yogms-PevI1MGdro7q1dmqQ'

// Créer un client avec la clé service_role pour avoir les permissions admin
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createUser() {
  console.log('🔐 Création d\'un utilisateur test...\n')

  const email = 'test@welcomebook.be'
  const password = 'Test123456!'

  try {
    // Vérifier si l'utilisateur existe déjà
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const userExists = existingUsers?.users?.some(u => u.email === email)

    if (userExists) {
      console.log('⚠️  Un utilisateur avec cet email existe déjà!')
      console.log(`   Email: ${email}`)

      // Récupérer les infos de l'utilisateur existant
      const existingUser = existingUsers?.users?.find(u => u.email === email)
      if (existingUser) {
        console.log(`   ID: ${existingUser.id}`)
        console.log(`   Créé le: ${existingUser.created_at}`)
      }

      return
    }

    // Créer l'utilisateur avec l'API Admin
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirmer l'email (important pour le dev)
      user_metadata: {
        name: 'Test User'
      }
    })

    if (error) {
      console.error('❌ Erreur lors de la création de l\'utilisateur:')
      console.error(`   ${error.message}`)
      return
    }

    console.log('✅ Utilisateur créé avec succès!')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log(`   ID: ${data.user?.id}`)
    console.log(`   Email confirmé: Oui`)

    console.log('\n📝 Vous pouvez maintenant vous connecter avec ces identifiants:')
    console.log(`   Email: ${email}`)
    console.log(`   Mot de passe: ${password}`)

  } catch (err: any) {
    console.error('❌ Erreur inattendue:')
    console.error(`   ${err.message}`)
  }
}

createUser()
