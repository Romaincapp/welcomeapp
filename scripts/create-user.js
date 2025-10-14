/**
 * Script pour créer un utilisateur test via l'API Admin de Supabase
 *
 * Usage: node scripts/create-user.js
 */

const { createClient } = require('@supabase/supabase-js')

// IMPORTANT : Vous devez utiliser la clé SERVICE_ROLE (pas ANON_KEY)
// La clé service role se trouve dans : Settings → API → service_role (secret)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY // À ajouter dans .env.local

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variables manquantes dans .env.local :')
  console.error('   NEXT_PUBLIC_SUPABASE_URL=...')
  console.error('   SUPABASE_SERVICE_KEY=... (clé service_role)')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestUser() {
  console.log('🔄 Création de l\'utilisateur test...')

  const email = 'test@welcomebook.be'
  const password = 'Test123456!'

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true // Confirme automatiquement l'email
    })

    if (error) {
      console.error('❌ Erreur:', error.message)
      console.error('Détails:', error)
      return
    }

    console.log('✅ Utilisateur créé avec succès !')
    console.log('📧 Email:', email)
    console.log('🔑 Password:', password)
    console.log('🆔 User ID:', data.user.id)
    console.log('\n🎉 Vous pouvez maintenant vous connecter avec ces identifiants !')

  } catch (err) {
    console.error('❌ Erreur inattendue:', err)
  }
}

createTestUser()
