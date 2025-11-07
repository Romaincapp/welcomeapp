const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
