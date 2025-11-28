/**
 * Script pour corriger les traductions des catégories et ajouter "Le logement"
 * Exécuter avec: npx tsx scripts/fix-categories-translations.ts
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database.types'

// Charger les variables d'environnement
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey) as any

async function main() {
  console.log('🔧 Correction des traductions des catégories...\n')

  try {
    // 1. Corriger "Restaurants"
    console.log('📝 Mise à jour: Restaurants')
    await supabase
      .from('categories')
      .update({
        name_en: 'Restaurants',
        name_es: 'Restaurantes',
        name_nl: 'Restaurants',
        name_de: 'Restaurants',
        name_it: 'Ristoranti',
        name_pt: 'Restaurantes',
      })
      .eq('slug', 'restaurants')

    // 2. Corriger "Activités"
    console.log('📝 Mise à jour: Activités')
    await supabase
      .from('categories')
      .update({
        name_en: 'Activities',
        name_es: 'Actividades',
        name_nl: 'Activiteiten',
        name_de: 'Aktivitäten',
        name_it: 'Attività',
        name_pt: 'Atividades',
      })
      .eq('slug', 'activites')

    // 3. Corriger "Commerces"
    console.log('📝 Mise à jour: Commerces')
    await supabase
      .from('categories')
      .update({
        name_en: 'Shops',
        name_es: 'Tiendas',
        name_nl: 'Winkels',
        name_de: 'Geschäfte',
        name_it: 'Negozi',
        name_pt: 'Lojas',
      })
      .eq('slug', 'commerces')

    // 4. Corriger "Services"
    console.log('📝 Mise à jour: Services')
    await supabase
      .from('categories')
      .update({
        name_en: 'Services',
        name_es: 'Servicios',
        name_nl: 'Diensten',
        name_de: 'Dienstleistungen',
        name_it: 'Servizi',
        name_pt: 'Serviços',
      })
      .eq('slug', 'services')

    // 5. Corriger "Transports"
    console.log('📝 Mise à jour: Transports')
    await supabase
      .from('categories')
      .update({
        name_en: 'Transport',
        name_es: 'Transporte',
        name_nl: 'Vervoer',
        name_de: 'Transport',
        name_it: 'Trasporti',
        name_pt: 'Transporte',
      })
      .eq('slug', 'transports')

    // 6. Corriger "Urgences"
    console.log('📝 Mise à jour: Urgences')
    await supabase
      .from('categories')
      .update({
        name_en: 'Emergency',
        name_es: 'Emergencia',
        name_nl: 'Noodgevallen',
        name_de: 'Notfall',
        name_it: 'Emergenza',
        name_pt: 'Emergência',
      })
      .eq('slug', 'urgences')

    // 7. Ajouter "Le logement"
    console.log('\n🏠 Ajout de la catégorie "Le logement"')
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', 'logement')
      .single()

    if (existing) {
      console.log('⚠️  La catégorie existe déjà, mise à jour...')
      await supabase
        .from('categories')
        .update({
          name: 'Le logement',
          icon: '🏠',
          order: 0,
          name_en: 'The Property',
          name_es: 'El Alojamiento',
          name_nl: 'De Accommodatie',
          name_de: 'Die Unterkunft',
          name_it: "L'Alloggio",
          name_pt: 'O Alojamento',
        })
        .eq('slug', 'logement')
    } else {
      console.log('➕ Création de la catégorie...')
      await supabase.from('categories').insert({
        name: 'Le logement',
        slug: 'logement',
        icon: '🏠',
        order: 0,
        name_en: 'The Property',
        name_es: 'El Alojamiento',
        name_nl: 'De Accommodatie',
        name_de: 'Die Unterkunft',
        name_it: "L'Alloggio",
        name_pt: 'O Alojamento',
      })
    }

    // 8. Réorganiser l'ordre
    console.log('\n🔢 Réorganisation de l\'ordre des catégories')
    await supabase.from('categories').update({ order: 1 }).eq('slug', 'restaurants')
    await supabase.from('categories').update({ order: 2 }).eq('slug', 'activites')
    await supabase.from('categories').update({ order: 3 }).eq('slug', 'commerces')
    await supabase.from('categories').update({ order: 4 }).eq('slug', 'services')
    await supabase.from('categories').update({ order: 5 }).eq('slug', 'transports')
    await supabase.from('categories').update({ order: 6 }).eq('slug', 'urgences')

    // 9. Vérifier le résultat
    console.log('\n✅ Vérification du résultat:\n')
    const { data: categories } = await supabase
      .from('categories')
      .select('name, slug, order, name_en, name_es, name_nl, name_de, name_it, name_pt')
      .order('order')

    if (categories) {
      categories.forEach((cat: any) => {
        console.log(`${cat.name} (order: ${cat.order})`)
        console.log(`   EN: ${cat.name_en || '❌'}`)
        console.log(`   ES: ${cat.name_es || '❌'}`)
        console.log(`   NL: ${cat.name_nl || '❌'}`)
        console.log(`   DE: ${cat.name_de || '❌'}`)
        console.log(`   IT: ${cat.name_it || '❌'}`)
        console.log(`   PT: ${cat.name_pt || '❌'}`)
        console.log('')
      })
    }

    console.log('✅ Script terminé avec succès!')
  } catch (error) {
    console.error('❌ Erreur:', error)
    process.exit(1)
  }
}

main()
