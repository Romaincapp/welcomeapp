import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createStorageBucket() {
  console.log('🪣 Création du bucket "media"...')

  // Créer le bucket
  const { data: bucket, error: createError } = await supabase.storage.createBucket('media', {
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'],
  })

  if (createError) {
    if (createError.message.includes('already exists')) {
      console.log('✅ Le bucket "media" existe déjà')
    } else {
      console.error('❌ Erreur lors de la création du bucket:', createError)
      throw createError
    }
  } else {
    console.log('✅ Bucket "media" créé avec succès:', bucket)
  }

  // Vérifier que le bucket est public
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()

  if (listError) {
    console.error('❌ Erreur lors de la récupération des buckets:', listError)
    throw listError
  }

  const mediaBucket = buckets?.find((b) => b.name === 'media')
  console.log('📦 Configuration du bucket "media":', mediaBucket)

  // Définir les politiques d'accès (RLS)
  console.log('\n📋 Configuration des politiques RLS...')
  console.log('⚠️  Important: Vous devez configurer manuellement les politiques RLS dans le Dashboard Supabase:')
  console.log('   1. Allez sur https://supabase.com/dashboard/project/nimbzitahumdefggtiob/storage/policies')
  console.log('   2. Sélectionnez le bucket "media"')
  console.log('   3. Ajoutez ces politiques:')
  console.log('')
  console.log('   📖 Politique "Public Read" (SELECT):')
  console.log('      - Nom: Public Read Access')
  console.log('      - Target roles: public')
  console.log('      - Operation: SELECT')
  console.log('      - Policy definition: true')
  console.log('')
  console.log('   ✍️  Politique "Authenticated Insert" (INSERT):')
  console.log('      - Nom: Authenticated Users Can Upload')
  console.log('      - Target roles: authenticated')
  console.log('      - Operation: INSERT')
  console.log('      - Policy definition: true')
  console.log('')
  console.log('   🗑️  Politique "Authenticated Delete" (DELETE):')
  console.log('      - Nom: Authenticated Users Can Delete')
  console.log('      - Target roles: authenticated')
  console.log('      - Operation: DELETE')
  console.log('      - Policy definition: true')
  console.log('')
  console.log('   🔄 Politique "Authenticated Update" (UPDATE):')
  console.log('      - Nom: Authenticated Users Can Update')
  console.log('      - Target roles: authenticated')
  console.log('      - Operation: UPDATE')
  console.log('      - Policy definition: true')

  console.log('\n✅ Script terminé!')
}

createStorageBucket()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Erreur fatale:', error)
    process.exit(1)
  })
