const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://nimbzitahumdefggtiob.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pbWJ6aXRhaHVtZGVmZ2d0aW9iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI0NzQ5NiwiZXhwIjoyMDc1ODIzNDk2fQ.HV4pEMqkjIng92Jp8Q61Yogms-PevI1MGdro7q1dmqQ';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkAuthAndPolicies() {
  console.log('🔍 Vérification de l\'authentification et des policies...\n');

  try {
    // 1. Lister tous les clients
    console.log('📋 Clients existants:');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, name, slug, email');

    if (clientsError) {
      console.error('❌ Erreur:', clientsError.message);
    } else if (clients && clients.length > 0) {
      clients.forEach(client => {
        console.log(`   - ${client.name} (${client.slug})`);
        console.log(`     Email: ${client.email}`);
        console.log(`     ID: ${client.id}\n`);
      });
    } else {
      console.log('   ⚠️  Aucun client trouvé\n');
    }

    // 2. Lister les utilisateurs auth
    console.log('👤 Utilisateurs authentifiés (auth.users):');
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error('❌ Erreur:', usersError.message);
    } else if (users && users.length > 0) {
      users.forEach(user => {
        console.log(`   - ${user.email}`);
        console.log(`     ID: ${user.id}`);
        console.log(`     Créé: ${new Date(user.created_at).toLocaleDateString()}\n`);
      });
    } else {
      console.log('   ⚠️  Aucun utilisateur trouvé\n');
    }

    // 3. Vérifier la correspondance
    console.log('🔗 Correspondance Clients ↔ Utilisateurs:');
    if (clients && clients.length > 0 && users && users.length > 0) {
      clients.forEach(client => {
        const matchingUser = users.find(u => u.email === client.email);
        if (matchingUser) {
          console.log(`   ✅ ${client.name} → ${matchingUser.email} (MATCH)`);
        } else {
          console.log(`   ❌ ${client.name} → ${client.email} (PAS D'UTILISATEUR)`);
        }
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('📝 DIAGNOSTIC:');
    console.log('='.repeat(60));

    if (!clients || clients.length === 0) {
      console.log('⚠️  Aucun client dans la base de données');
      console.log('💡 Solution: Créer un client avec un email');
    }

    if (!users || users.length === 0) {
      console.log('⚠️  Aucun utilisateur authentifié');
      console.log('💡 Solution: Créer un utilisateur avec:');
      console.log('   npm run create-test-user');
    }

    if (clients && users && clients.length > 0 && users.length > 0) {
      const hasMatch = clients.some(c => users.some(u => u.email === c.email));
      if (!hasMatch) {
        console.log('⚠️  Aucune correspondance entre clients et utilisateurs');
        console.log('💡 Solution: L\'email du client doit correspondre à l\'email de l\'utilisateur');
        console.log('');
        console.log('Exemple de correspondance nécessaire:');
        if (clients[0] && users[0]) {
          console.log(`   Client: ${clients[0].email}`);
          console.log(`   User:   ${users[0].email}`);
          if (clients[0].email !== users[0].email) {
            console.log('   ❌ Ces emails ne correspondent pas!');
          }
        }
      } else {
        console.log('✅ Correspondance OK! Les policies devraient fonctionner.');
      }
    }

    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Erreur fatale:', error.message);
  }
}

checkAuthAndPolicies();
