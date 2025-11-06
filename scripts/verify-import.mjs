/**
 * Script de vérification de l'importation
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nimbzitahumdefggtiob.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pbWJ6aXRhaHVtZGVmZ2d0aW9iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI0NzQ5NiwiZXhwIjoyMDc1ODIzNDk2fQ.HV4pEMqkjIng92Jp8Q61Yogms-PevI1MGdro7q1dmqQ'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verify() {
  console.log('🔍 VÉRIFICATION DES DONNÉES IMPORTÉES\n')
  console.log('=' .repeat(60))

  // 1. Vérifier le client
  console.log('\n👤 CLIENT:')
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id, slug, name, email, footer_contact_phone, background_image')
    .eq('slug', 'camping-la-faloise')
    .maybeSingle()

  if (clientError) {
    console.error('   ❌ Erreur:', clientError.message)
  } else if (client) {
    console.log(`   ✅ Client trouvé:`)
    console.log(`      ID: ${client.id}`)
    console.log(`      Slug: ${client.slug}`)
    console.log(`      Nom: ${client.name}`)
    console.log(`      Email: ${client.email}`)
    console.log(`      Téléphone: ${client.footer_contact_phone}`)
    console.log(`      Image de fond: ${client.background_image ? '✅' : '❌'}`)
  } else {
    console.log('   ❌ Client non trouvé')
  }

  // 2. Vérifier les tips
  console.log('\n📝 TIPS:')
  const { data: tips, error: tipsError, count } = await supabase
    .from('tips')
    .select('id, title, category_id, comment', { count: 'exact' })
    .eq('client_id', client?.id || '')
    .order('order')

  if (tipsError) {
    console.error('   ❌ Erreur:', tipsError.message)
  } else {
    console.log(`   ✅ ${count} tips importés`)
    if (tips && tips.length > 0) {
      console.log(`   📄 Premiers tips:`)
      tips.slice(0, 5).forEach((tip, i) => {
        console.log(`      ${i + 1}. ${tip.title}`)
      })
    }
  }

  // 3. Vérifier les médias
  console.log('\n📸 MÉDIAS:')
  const { data: media, error: mediaError, count: mediaCount } = await supabase
    .from('tip_media')
    .select('id, tip_id, type', { count: 'exact' })
    .in('tip_id', tips?.map((t) => t.id) || [])

  if (mediaError) {
    console.error('   ❌ Erreur:', mediaError.message)
  } else {
    console.log(`   ✅ ${mediaCount} médias importés`)
  }

  // 4. Vérifier les catégories
  console.log('\n📁 CATÉGORIES:')
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, name, slug')
    .in('slug', ['informations', 'activites', 'magasins', 'restaurants'])

  if (catError) {
    console.error('   ❌ Erreur:', catError.message)
  } else {
    console.log(`   ✅ ${categories?.length || 0} catégories:`)
    categories?.forEach((cat) => {
      console.log(`      • ${cat.name} (${cat.slug})`)
    })
  }

  // 5. Statistiques par catégorie
  console.log('\n📊 RÉPARTITION DES TIPS PAR CATÉGORIE:')
  const categoryStats = {}
  tips?.forEach((tip) => {
    const cat = categories?.find((c) => c.id === tip.category_id)
    const catName = cat?.name || 'Sans catégorie'
    categoryStats[catName] = (categoryStats[catName] || 0) + 1
  })
  Object.entries(categoryStats).forEach(([cat, count]) => {
    console.log(`   • ${cat}: ${count} tips`)
  })

  console.log('\n' + '='.repeat(60))
  console.log('\n✅ VÉRIFICATION TERMINÉE !')
  console.log(`\n🌐 Accédez au welcomebook:`)
  console.log(`   https://welcomeapp.vercel.app/camping-la-faloise`)
}

verify()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  })
