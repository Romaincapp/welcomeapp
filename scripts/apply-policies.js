const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration Supabase
const supabaseUrl = 'https://nimbzitahumdefggtiob.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pbWJ6aXRhaHVtZGVmZ2d0aW9iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI0NzQ5NiwiZXhwIjoyMDc1ODIzNDk2fQ.HV4pEMqkjIng92Jp8Q61Yogms-PevI1MGdro7q1dmqQ';

// Créer le client Supabase avec service_role
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyPolicies() {
  console.log('🚀 Démarrage de l\'application des policies RLS...\n');

  try {
    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, '..', 'supabase', 'policies.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    console.log('📄 Fichier SQL chargé:', sqlPath);
    console.log('📏 Taille du fichier:', sqlContent.length, 'caractères\n');

    // Diviser le SQL en commandes individuelles (séparer par points-virgules)
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && cmd !== '');

    console.log('📋 Nombre de commandes SQL à exécuter:', commands.length, '\n');

    let successCount = 0;
    let errorCount = 0;

    // Exécuter chaque commande
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i] + ';';

      // Extraire le nom de la commande pour le log
      const commandType = command.split(/\s+/)[0].toUpperCase();
      const commandName = command.substring(0, 80).replace(/\n/g, ' ') + '...';

      process.stdout.write(`[${i + 1}/${commands.length}] ${commandType} `);

      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: command });

        if (error) {
          // Si la fonction exec_sql n'existe pas, essayer directement
          if (error.message.includes('function') || error.message.includes('does not exist')) {
            console.log('⚠️  RPC non disponible, tentative directe...');
            // Pour les policies, on peut utiliser l'API REST directement
            // Mais c'est limité. On va informer l'utilisateur.
            console.log('❌ Impossible d\'exécuter via RPC\n');
            errorCount++;
            continue;
          }
          throw error;
        }

        console.log('✅');
        successCount++;
      } catch (err) {
        console.log('❌');
        console.error('   Erreur:', err.message.substring(0, 100));
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 RÉSUMÉ:');
    console.log('   ✅ Succès:', successCount);
    console.log('   ❌ Erreurs:', errorCount);
    console.log('   📝 Total:', commands.length);
    console.log('='.repeat(50));

    if (errorCount > 0) {
      console.log('\n⚠️  Des erreurs ont été détectées.');
      console.log('💡 Solution: Utiliser l\'interface SQL Editor de Supabase:');
      console.log('   👉 https://supabase.com/dashboard/project/nimbzitahumdefggtiob/sql/new');
      process.exit(1);
    } else {
      console.log('\n🎉 Toutes les policies ont été appliquées avec succès !');
      process.exit(0);
    }

  } catch (error) {
    console.error('\n❌ Erreur fatale:', error.message);
    console.error('\n💡 Solution: Utiliser l\'interface SQL Editor de Supabase:');
    console.error('   👉 https://supabase.com/dashboard/project/nimbzitahumdefggtiob/sql/new');
    process.exit(1);
  }
}

// Exécuter le script
applyPolicies();
