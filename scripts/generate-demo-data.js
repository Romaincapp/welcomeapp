const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

const demoData = {
  categories: [
    { name: 'Restaurants', slug: 'restaurants', icon: '🍽️' },
    { name: 'Activités', slug: 'activites', icon: '🎯' },
    { name: 'Culture', slug: 'culture', icon: '🎨' },
    { name: 'Nature', slug: 'nature', icon: '🌲' },
    { name: 'Shopping', slug: 'shopping', icon: '🛍️' },
    { name: 'Services', slug: 'services', icon: '🔧' },
  ],

  tips: [
    // RESTAURANTS
    {
      title: "Le Comptoir des Ardennes",
      category: "restaurants",
      comment: "Restaurant gastronomique avec une vue imprenable sur la vallée. Cuisine du terroir revisitée. Réservation fortement recommandée, surtout le week-end !",
      location: "Rue du Commerce 45, 6900 Marche-en-Famenne",
      coordinates: { lat: 50.2275, lng: 5.3442 },
      contact_phone: "+32 84 31 44 55",
      contact_email: "info@comptoir-ardennes.be",
      contact_social: { website: "https://www.comptoir-ardennes.be" },
      promo_code: "VILLA2024",
      opening_hours: {
        monday: "Fermé",
        tuesday: "12:00-14:30, 19:00-22:00",
        wednesday: "12:00-14:30, 19:00-22:00",
        thursday: "12:00-14:30, 19:00-22:00",
        friday: "12:00-14:30, 19:00-22:30",
        saturday: "12:00-14:30, 19:00-22:30",
        sunday: "12:00-14:30, 19:00-21:30"
      },
    },
    {
      title: "Pizzeria Da Marco",
      category: "restaurants",
      comment: "Les meilleures pizzas de la région ! Ambiance familiale et conviviale. Pensez à réserver car c'est souvent complet.",
      location: "Avenue de la Toison d'Or 12, 6900 Marche-en-Famenne",
      coordinates: { lat: 50.2265, lng: 5.3425 },
      contact_phone: "+32 84 32 12 34",
      promo_code: "WELCOME10",
      opening_hours: {
        monday: "Fermé",
        tuesday: "18:00-22:00",
        wednesday: "18:00-22:00",
        thursday: "18:00-22:00",
        friday: "18:00-23:00",
        saturday: "18:00-23:00",
        sunday: "18:00-22:00"
      },
    },
    {
      title: "Brasserie du Parc",
      category: "restaurants",
      comment: "Cuisine belge traditionnelle. Excellente carte de bières locales. Parfait pour un déjeuner ou un dîner décontracté.",
      location: "Place du Roi Albert 8, 6900 Marche-en-Famenne",
      coordinates: { lat: 50.2280, lng: 5.3438 },
      contact_phone: "+32 84 31 25 67",
      contact_social: { website: "https://www.brasserieduparc.be" },
    },

    // ACTIVITÉS
    {
      title: "Grottes de Hotton",
      category: "activites",
      comment: "Magnifiques grottes souterraines à 20 minutes. Visite guidée d'1h30. Température constante de 12°C, prévoyez une veste !",
      location: "Chemin de la Falise 2, 6990 Hotton",
      coordinates: { lat: 50.2688, lng: 5.4465 },
      contact_phone: "+32 84 46 60 46",
      contact_email: "info@grottesdehotton.be",
      contact_social: { website: "https://www.grottesdehotton.be" },
      opening_hours: {
        monday: "10:00-17:00",
        tuesday: "10:00-17:00",
        wednesday: "10:00-17:00",
        thursday: "10:00-17:00",
        friday: "10:00-17:00",
        saturday: "10:00-18:00",
        sunday: "10:00-18:00"
      },
    },
    {
      title: "Kayak Lesse",
      category: "activites",
      comment: "Descente en kayak sur la Lesse. Plusieurs parcours disponibles (12km, 21km). Location de kayaks et navette incluse. Activité parfaite en été !",
      location: "Rue du Pont 15, 6990 Gendron",
      coordinates: { lat: 50.1853, lng: 5.1847 },
      contact_phone: "+32 84 37 78 90",
      contact_email: "info@kayaklesse.be",
      contact_social: { website: "https://www.kayaklesse.be" },
      promo_code: "VILLA15",
    },
    {
      title: "Parc Chlorophylle",
      category: "activites",
      comment: "Parc nature avec parcours dans les arbres, tyroliennes et jeux pour enfants. Idéal pour une sortie en famille !",
      location: "Rue de la Houssaie 1, 6870 Saint-Hubert",
      coordinates: { lat: 50.0272, lng: 5.3744 },
      contact_phone: "+32 61 61 29 50",
      contact_social: { website: "https://www.parcchlorophylle.com" },
      opening_hours: {
        monday: "10:00-18:00",
        tuesday: "10:00-18:00",
        wednesday: "10:00-18:00",
        thursday: "10:00-18:00",
        friday: "10:00-18:00",
        saturday: "10:00-19:00",
        sunday: "10:00-19:00"
      },
    },
    {
      title: "Golf de Durbuy",
      category: "activites",
      comment: "Magnifique parcours 18 trous. Location de matériel possible. Restaurant sur place avec vue panoramique.",
      location: "Barvaux-sur-Ourthe 37, 6940 Durbuy",
      coordinates: { lat: 50.3507, lng: 5.4561 },
      contact_phone: "+32 86 21 24 39",
      contact_email: "info@durbuygolf.be",
      contact_social: { website: "https://www.durbuygolf.be" },
    },

    // CULTURE
    {
      title: "Château de Lavaux-Sainte-Anne",
      category: "culture",
      comment: "Château médiéval magnifiquement restauré. Musées de la chasse et de la ruralité. Parc animalier avec des animaux de nos forêts.",
      location: "Rue du Château 8, 5580 Lavaux-Sainte-Anne",
      coordinates: { lat: 50.1089, lng: 5.1347 },
      contact_phone: "+32 84 38 83 62",
      contact_social: { website: "https://www.chateau-lavaux.com" },
      opening_hours: {
        monday: "Fermé",
        tuesday: "10:00-17:30",
        wednesday: "10:00-17:30",
        thursday: "10:00-17:30",
        friday: "10:00-17:30",
        saturday: "10:00-18:00",
        sunday: "10:00-18:00"
      },
    },
    {
      title: "Musée de la Bataille des Ardennes",
      category: "culture",
      comment: "Musée consacré à la Seconde Guerre mondiale. Collection impressionnante de véhicules militaires et d'objets d'époque.",
      location: "Rue du Vivier 5, 6600 Bastogne",
      coordinates: { lat: 50.0039, lng: 5.7186 },
      contact_phone: "+32 61 21 14 13",
      contact_social: { website: "https://www.bastognewarmuseum.be" },
    },
    {
      title: "Basilique Saint-Hubert",
      category: "culture",
      comment: "Magnifique basilique gothique, lieu de pèlerinage. Architecture impressionnante et histoire fascinante.",
      location: "Place du Marché 1, 6870 Saint-Hubert",
      coordinates: { lat: 50.0272, lng: 5.3756 },
      contact_phone: "+32 61 61 10 88",
    },

    // NATURE
    {
      title: "Fourneau Saint-Michel",
      category: "nature",
      comment: "Musée en plein air avec forge du 18ème siècle. Promenades balisées dans la forêt. Parfait pour une journée nature !",
      location: "Fourneau Saint-Michel 2, 6870 Saint-Hubert",
      coordinates: { lat: 50.0597, lng: 5.4336 },
      contact_phone: "+32 61 23 04 90",
      opening_hours: {
        monday: "09:00-18:00",
        tuesday: "09:00-18:00",
        wednesday: "09:00-18:00",
        thursday: "09:00-18:00",
        friday: "09:00-18:00",
        saturday: "09:00-18:00",
        sunday: "09:00-18:00"
      },
    },
    {
      title: "Parc Naturel des Deux Ourthes",
      category: "nature",
      comment: "Nombreux sentiers de randonnée balisés. Faune et flore riches. Cartes disponibles à l'office du tourisme.",
      location: "Monceau-en-Ardenne, 6997 Erezée",
      coordinates: { lat: 50.2942, lng: 5.5622 },
      contact_phone: "+32 86 32 35 70",
    },
    {
      title: "Point de vue du Hérou",
      category: "nature",
      comment: "Vue panoramique exceptionnelle sur la vallée de l'Ourthe. Petit parking à proximité. 10 minutes de marche facile.",
      location: "Nadrin, 6982 La Roche-en-Ardenne",
      coordinates: { lat: 50.1906, lng: 5.6050 },
    },

    // SHOPPING
    {
      title: "Marché de Marche",
      category: "shopping",
      comment: "Marché hebdomadaire tous les samedis matin. Produits locaux, fromages, charcuterie. Ambiance conviviale !",
      location: "Place aux Foires, 6900 Marche-en-Famenne",
      coordinates: { lat: 50.2272, lng: 5.3445 },
      opening_hours: {
        saturday: "08:00-13:00"
      },
    },
    {
      title: "La Ferme des Champs",
      category: "shopping",
      comment: "Produits fermiers : fromages, yaourts, viandes. Tout est produit localement. Excellent rapport qualité-prix !",
      location: "Rue des Champs 12, 6900 Aye",
      coordinates: { lat: 50.2156, lng: 5.3089 },
      contact_phone: "+32 84 31 55 22",
      opening_hours: {
        tuesday: "09:00-18:00",
        wednesday: "09:00-18:00",
        thursday: "09:00-18:00",
        friday: "09:00-18:00",
        saturday: "09:00-17:00"
      },
    },
    {
      title: "Boulangerie Artisanale Dupont",
      category: "shopping",
      comment: "Pain cuit au feu de bois, pâtisseries maison. Leurs cramiques sont exceptionnels ! Pensez à commander vos pains spéciaux la veille.",
      location: "Rue de la Station 23, 6900 Marche-en-Famenne",
      coordinates: { lat: 50.2245, lng: 5.3412 },
      contact_phone: "+32 84 31 78 45",
      promo_code: "PAIN5",
    },

    // SERVICES
    {
      title: "Location de vélos - Ardenne Bike",
      category: "services",
      comment: "Location de VTT et vélos électriques. Itinéraires conseillés fournis. Possibilité de livraison à la villa !",
      location: "Avenue de France 18, 6900 Marche-en-Famenne",
      coordinates: { lat: 50.2289, lng: 5.3401 },
      contact_phone: "+32 84 31 99 88",
      contact_email: "info@ardennebike.be",
      contact_social: { website: "https://www.ardennebike.be" },
      promo_code: "VILLA20",
    },
    {
      title: "Pharmacie Centrale",
      category: "services",
      comment: "Pharmacie de garde le week-end. Petit coin parapharmacie.",
      location: "Rue Victor Libert 15, 6900 Marche-en-Famenne",
      coordinates: { lat: 50.2268, lng: 5.3440 },
      contact_phone: "+32 84 31 12 23",
      opening_hours: {
        monday: "08:30-12:30, 14:00-18:30",
        tuesday: "08:30-12:30, 14:00-18:30",
        wednesday: "08:30-12:30, 14:00-18:30",
        thursday: "08:30-12:30, 14:00-18:30",
        friday: "08:30-12:30, 14:00-18:30",
        saturday: "09:00-12:30"
      },
    },
    {
      title: "Médecin de garde",
      category: "services",
      comment: "Maison médicale de garde - appelez le 1733 pour connaître le médecin de garde. Urgences : appelez le 112.",
      contact_phone: "1733",
    },
  ]
};

async function generateDemoData() {
  console.log('🎨 Génération des données de démo...\n');

  try {
    // 1. Récupérer le client demo
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('slug', 'demo')
      .single();

    if (clientError || !client) {
      console.error('❌ Client "demo" introuvable');
      return;
    }

    console.log('✅ Client trouvé:', client.id);

    // 2. Créer/récupérer les catégories
    console.log('\n📂 Création des catégories...');
    const categoryMap = {};

    for (const cat of demoData.categories) {
      // Vérifier si la catégorie existe déjà
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', cat.slug)
        .single();

      if (existing) {
        categoryMap[cat.slug] = existing.id;
        console.log(`   ✓ ${cat.name} (existe déjà)`);
      } else {
        const { data: newCat, error } = await supabase
          .from('categories')
          .insert(cat)
          .select()
          .single();

        if (error) {
          console.error(`   ❌ Erreur pour ${cat.name}:`, error.message);
        } else {
          categoryMap[cat.slug] = newCat.id;
          console.log(`   ✅ ${cat.name} créée`);
        }
      }
    }

    // 3. Supprimer les anciens conseils du client demo (optionnel - décommenter si nécessaire)
    // console.log('\n🗑️  Suppression des anciens conseils...');
    // await supabase.from('tips').delete().eq('client_id', client.id);

    // 4. Créer les conseils
    console.log('\n💡 Création des conseils...');
    let successCount = 0;
    let errorCount = 0;

    for (const tip of demoData.tips) {
      const tipData = {
        client_id: client.id,
        title: tip.title,
        comment: tip.comment || null,
        location: tip.location || null,
        coordinates: tip.coordinates || null,
        contact_phone: tip.contact_phone || null,
        contact_email: tip.contact_email || null,
        contact_social: tip.contact_social || null,
        promo_code: tip.promo_code || null,
        opening_hours: tip.opening_hours || null,
        route_url: tip.route_url || null,
        category_id: tip.category ? categoryMap[tip.category] : null,
      };

      const { error } = await supabase.from('tips').insert(tipData);

      if (error) {
        console.log(`   ❌ ${tip.title}: ${error.message}`);
        errorCount++;
      } else {
        console.log(`   ✅ ${tip.title}`);
        successCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ:');
    console.log('='.repeat(60));
    console.log(`✅ Catégories: ${Object.keys(categoryMap).length}`);
    console.log(`✅ Conseils créés: ${successCount}`);
    if (errorCount > 0) {
      console.log(`❌ Erreurs: ${errorCount}`);
    }
    console.log('='.repeat(60));
    console.log('\n🎉 Données de démo générées avec succès !');
    console.log('👉 Rechargez http://localhost:3001/demo pour voir les résultats');

  } catch (error) {
    console.error('❌ Erreur fatale:', error.message);
  }
}

generateDemoData();
