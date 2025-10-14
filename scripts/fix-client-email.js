const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nimbzitahumdefggtiob.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pbWJ6aXRhaHVtZGVmZ2d0aW9iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI0NzQ5NiwiZXhwIjoyMDc1ODIzNDk2fQ.HV4pEMqkjIng92Jp8Q61Yogms-PevI1MGdro7q1dmqQ';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixClientEmail() {
  console.log('🔧 Mise à jour de l\'email du client...\n');

  try {
    // Mettre à jour l'email du client "demo"
    const { data, error } = await supabase
      .from('clients')
      .update({ email: 'romainfrancedumoulin@gmail.com' })
      .eq('slug', 'demo')
      .select();

    if (error) {
      console.error('❌ Erreur:', error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ Email du client mis à jour avec succès!');
      console.log(`   Client: ${data[0].name}`);
      console.log(`   Nouvel email: ${data[0].email}`);
      console.log('\n🎉 Vous pouvez maintenant ajouter/éditer/supprimer des conseils!');
    } else {
      console.log('⚠️  Aucun client trouvé avec le slug "demo"');
    }

  } catch (error) {
    console.error('❌ Erreur fatale:', error.message);
  }
}

fixClientEmail();
