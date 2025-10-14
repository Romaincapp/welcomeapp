const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://nimbzitahumdefggtiob.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pbWJ6aXRhaHVtZGVmZ2d0aW9iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI0NzQ5NiwiZXhwIjoyMDc1ODIzNDk2fQ.HV4pEMqkjIng92Jp8Q61Yogms-PevI1MGdro7q1dmqQ';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkStoragePolicies() {
  console.log('🔍 Vérification des policies Storage pour le bucket "media"...\n');

  try {
    // Requête SQL pour récupérer les policies du storage
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT
          policyname,
          cmd,
          qual,
          with_check,
          roles
        FROM pg_policies
        WHERE schemaname = 'storage'
        AND tablename = 'objects'
        ORDER BY policyname;
      `
    });

    if (error) {
      // Si la fonction RPC n'existe pas, utiliser une requête directe
      console.log('⚠️  Impossible d\'utiliser RPC, vérification alternative...\n');

      // Alternative: vérifier via une requête simple
      const { data: testData, error: testError } = await supabase
        .from('storage.objects')
        .select('*')
        .limit(1);

      if (testError) {
        console.log('❌ Erreur lors du test de lecture:', testError.message);
      } else {
        console.log('✅ Test de lecture réussi');
      }

      console.log('\n📋 Pour vérifier manuellement les policies Storage:');
      console.log('   👉 https://supabase.com/dashboard/project/nimbzitahumdefggtiob/storage/policies\n');

      console.log('📝 Policies recommandées pour le bucket "media":\n');
      console.log('1️⃣  LECTURE PUBLIQUE (SELECT)');
      console.log('   - Nom: "Public access for media"');
      console.log('   - Opération: SELECT');
      console.log('   - Rôles: public');
      console.log('   - Condition: bucket_id = \'media\'');
      console.log('');

      console.log('2️⃣  UPLOAD POUR AUTHENTIFIÉS (INSERT)');
      console.log('   - Nom: "Authenticated users can upload"');
      console.log('   - Opération: INSERT');
      console.log('   - Rôles: authenticated');
      console.log('   - Condition: bucket_id = \'media\'');
      console.log('');

      console.log('3️⃣  MISE À JOUR POUR AUTHENTIFIÉS (UPDATE)');
      console.log('   - Nom: "Authenticated users can update their files"');
      console.log('   - Opération: UPDATE');
      console.log('   - Rôles: authenticated');
      console.log('   - Condition: bucket_id = \'media\'');
      console.log('');

      console.log('4️⃣  SUPPRESSION POUR AUTHENTIFIÉS (DELETE)');
      console.log('   - Nom: "Authenticated users can delete their files"');
      console.log('   - Opération: DELETE');
      console.log('   - Rôles: authenticated');
      console.log('   - Condition: bucket_id = \'media\'');
      console.log('');

      return;
    }

    if (data && data.length > 0) {
      console.log(`✅ ${data.length} policy/policies trouvée(s):\n`);
      data.forEach((policy, index) => {
        console.log(`${index + 1}. ${policy.policyname}`);
        console.log(`   - Commande: ${policy.cmd}`);
        console.log(`   - Rôles: ${policy.roles}`);
        console.log('');
      });
    } else {
      console.log('⚠️  Aucune policy trouvée pour storage.objects');
      console.log('\n💡 Vous devez créer des policies manuellement.');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('\n📋 Vérifier manuellement dans le dashboard:');
    console.log('   👉 https://supabase.com/dashboard/project/nimbzitahumdefggtiob/storage/policies');
  }
}

checkStoragePolicies();
