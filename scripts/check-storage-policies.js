const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkStoragePolicies() {
  console.log('🔍 Vérification des buckets Storage...\n');

  try {
    // Lister tous les buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('❌ Erreur lors de la récupération des buckets:', bucketsError.message);
      return;
    }

    if (!buckets || buckets.length === 0) {
      console.log('⚠️  Aucun bucket trouvé.');
      console.log('\n💡 Action requise: Créer le bucket "welcomebook-media"');
      console.log('   👉 https://supabase.com/dashboard/project/nimbzitahumdefggtiob/storage/buckets');
      return;
    }

    console.log(`✅ ${buckets.length} bucket(s) trouvé(s):\n`);

    buckets.forEach((bucket) => {
      console.log(`📦 Bucket: ${bucket.name}`);
      console.log(`   - ID: ${bucket.id}`);
      console.log(`   - Public: ${bucket.public ? '✅ Oui' : '❌ Non'}`);
      console.log(`   - Taille max fichier: ${bucket.file_size_limit ? (bucket.file_size_limit / 1024 / 1024).toFixed(2) + ' MB' : 'Illimitée'}`);
      console.log(`   - Types MIME autorisés: ${bucket.allowed_mime_types?.join(', ') || 'Tous'}`);
      console.log('');
    });

    // Vérifier si le bucket welcomebook-media existe
    const welcomebookBucket = buckets.find(b => b.name === 'welcomebook-media');

    if (!welcomebookBucket) {
      console.log('⚠️  Le bucket "welcomebook-media" n\'existe pas encore.');
      console.log('\n💡 Actions requises:');
      console.log('   1. Créer le bucket "welcomebook-media"');
      console.log('   2. Le rendre public');
      console.log('   3. Configurer les policies RLS');
      console.log('\n👉 https://supabase.com/dashboard/project/nimbzitahumdefggtiob/storage/buckets');
    } else {
      console.log('✅ Le bucket "welcomebook-media" existe!');

      if (welcomebookBucket.public) {
        console.log('✅ Le bucket est public (lecture autorisée pour tous)');
      } else {
        console.log('⚠️  Le bucket n\'est PAS public');
        console.log('   💡 Rendez-le public pour que les voyageurs puissent voir les images');
      }

      // Informations sur les policies
      console.log('\n📋 Policies Storage à vérifier manuellement:');
      console.log('   1. Lecture publique: ✅ (si le bucket est public)');
      console.log('   2. Upload pour authentifiés: À vérifier dans le dashboard');
      console.log('   3. Suppression pour propriétaires: À vérifier dans le dashboard');
      console.log('\n👉 Gérer les policies:');
      console.log('   https://supabase.com/dashboard/project/nimbzitahumdefggtiob/storage/policies');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkStoragePolicies();
