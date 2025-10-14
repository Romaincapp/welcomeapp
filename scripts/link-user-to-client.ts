import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nimbzitahumdefggtiob.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pbWJ6aXRhaHVtZGVmZ2d0aW9iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI0NzQ5NiwiZXhwIjoyMDc1ODIzNDk2fQ.HV4pEMqkjIng92Jp8Q61Yogms-PevI1MGdro7q1dmqQ'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function linkUserToClient() {
  console.log('🔗 Liaison de l\'utilisateur au client demo...\n')

  try {
    // 1. Vérifier que l'utilisateur existe dans public.users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')

    if (usersError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:')
      console.error(`   ${usersError.message}`)
      return
    }

    if (!users || users.length === 0) {
      console.log('⚠️  Aucun utilisateur trouvé dans public.users')
      console.log('   Le trigger de synchronisation n\'a peut-être pas fonctionné')
      console.log('\n📝 Essayez de créer un nouvel utilisateur ou vérifiez le trigger')
      return
    }

    console.log('✅ Utilisateurs trouvés dans public.users:')
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (ID: ${user.id})`)
    })

    // 2. Récupérer le client demo
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .eq('slug', 'demo')
      .single()

    if (clientsError) {
      console.error('\n❌ Erreur lors de la récupération du client demo:')
      console.error(`   ${clientsError.message}`)
      return
    }

    if (!clients) {
      console.log('\n⚠️  Client demo non trouvé')
      return
    }

    console.log('\n✅ Client demo trouvé:')
    console.log(`   Nom: ${clients.name}`)
    console.log(`   Slug: ${clients.slug}`)
    console.log(`   User ID actuel: ${clients.user_id || 'null (non lié)'}`)

    // 3. Lier le premier utilisateur au client demo
    const userId = users[0].id

    if (clients.user_id === userId) {
      console.log('\n✅ L\'utilisateur est déjà lié au client demo!')
      return
    }

    const { data: updateData, error: updateError } = await supabase
      .from('clients')
      .update({ user_id: userId })
      .eq('slug', 'demo')
      .select()

    if (updateError) {
      console.error('\n❌ Erreur lors de la liaison:')
      console.error(`   ${updateError.message}`)
      return
    }

    console.log('\n✅ Utilisateur lié au client demo avec succès!')
    console.log(`   Email: ${users[0].email}`)
    console.log(`   User ID: ${userId}`)
    console.log(`   Client: ${clients.name} (${clients.slug})`)

    console.log('\n🎉 Vous pouvez maintenant vous connecter avec cet email pour éditer le welcomebook!')

  } catch (err: any) {
    console.error('\n❌ Erreur inattendue:')
    console.error(`   ${err.message}`)
  }
}

linkUserToClient()
