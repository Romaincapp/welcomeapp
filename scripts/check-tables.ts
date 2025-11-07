import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTables() {
  console.log('🔍 Vérification des tables Supabase...\n')

  const tables = ['clients', 'categories', 'tips', 'tip_media', 'footer_buttons']

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: false })
        .limit(1)

      if (error) {
        console.log(`❌ Table "${table}": N'EXISTE PAS`)
        console.log(`   Erreur: ${error.message}\n`)
      } else {
        console.log(`✅ Table "${table}": EXISTE`)
        console.log(`   Nombre de lignes: ${count || 0}`)
        if (data && data.length > 0) {
          console.log(`   Colonnes: ${Object.keys(data[0]).join(', ')}`)
        }
        console.log('')
      }
    } catch (err: any) {
      console.log(`❌ Table "${table}": ERREUR`)
      console.log(`   ${err.message}\n`)
    }
  }

  // Vérifier les données de démonstration
  console.log('\n📊 Vérification des données de démonstration...\n')

  try {
    const { data: clients, error } = await supabase
      .from('clients')
      .select('*')
      .eq('slug', 'demo')

    if (error) {
      console.log(`❌ Client demo: N'existe pas ou erreur`)
    } else if (clients && clients.length > 0) {
      console.log(`✅ Client demo trouvé:`)
      console.log(`   Nom: ${clients[0].name}`)
      console.log(`   Slug: ${clients[0].slug}`)
      console.log(`   Email: ${clients[0].email}`)
    } else {
      console.log(`⚠️  Client demo: Table existe mais pas de données`)
    }
  } catch (err: any) {
    console.log(`❌ Erreur lors de la vérification du client demo: ${err.message}`)
  }

  console.log('\n✨ Vérification terminée!')
}

checkTables()
