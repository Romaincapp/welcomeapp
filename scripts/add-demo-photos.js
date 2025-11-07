const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Images Unsplash par catégorie/type
const photoData = {
  "Le Comptoir des Ardennes": [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80", // restaurant intérieur
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80", // plat gastronomique
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80", // vue restaurant
  ],
  "Pizzeria Da Marco": [
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80", // pizza
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80", // pizza four
    "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&q=80", // restaurant pizza
  ],
  "Brasserie du Parc": [
    "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80", // brasserie
    "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&q=80", // bières belges
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80", // plat brasserie
  ],
  "Grottes de Hotton": [
    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80", // grotte
    "https://images.unsplash.com/photo-1585016495481-91613a3ab1bc?w=800&q=80", // stalactites
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // cave naturelle
  ],
  "Kayak Lesse": [
    "https://images.unsplash.com/photo-1502933691298-84fc14542831?w=800&q=80", // kayak rivière
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80", // kayak nature
    "https://images.unsplash.com/photo-1609825488888-3a766db05542?w=800&q=80", // kayak groupe
  ],
  "Parc Chlorophylle": [
    "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=800&q=80", // parc aventure
    "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=800&q=80", // tyrolienne
    "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&q=80", // parc enfants
  ],
  "Golf de Durbuy": [
    "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80", // golf panorama
    "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&q=80", // terrain golf
    "https://images.unsplash.com/photo-1592919505780-303950717480?w=800&q=80", // club house
  ],
  "Château de Lavaux-Sainte-Anne": [
    "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80", // château médiéval
    "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80", // château jardin
    "https://images.unsplash.com/photo-1582278033712-d9ce6fe52f3a?w=800&q=80", // intérieur château
  ],
  "Musée de la Bataille des Ardennes": [
    "https://images.unsplash.com/photo-1549887534-1541e9326642?w=800&q=80", // musée militaire
    "https://images.unsplash.com/photo-1585314062340-f1978166b677?w=800&q=80", // véhicule militaire
    "https://images.unsplash.com/photo-1591882785392-d0c7b087c9c8?w=800&q=80", // exposition
  ],
  "Basilique Saint-Hubert": [
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80", // église gothique
    "https://images.unsplash.com/photo-1554939437-ecc492c67b78?w=800&q=80", // basilique intérieur
    "https://images.unsplash.com/photo-1562693702-0db31c6f3c89?w=800&q=80", // architecture religieuse
  ],
  "Fourneau Saint-Michel": [
    "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&q=80", // forge ancienne
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80", // forêt ardennes
    "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&q=80", // musée plein air
  ],
  "Parc Naturel des Deux Ourthes": [
    "https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=800&q=80", // forêt sentier
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80", // nature ardennes
    "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&q=80", // paysage nature
  ],
  "Point de vue du Hérou": [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // point de vue montagne
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80", // panorama nature
    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80", // vallée vue
  ],
  "Marché de Marche": [
    "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80", // marché extérieur
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80", // marché fruits légumes
    "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800&q=80", // marché fromage
  ],
  "La Ferme des Champs": [
    "https://images.unsplash.com/photo-1500076656116-558758c991c1?w=800&q=80", // ferme
    "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800&q=80", // produits fermiers
    "https://images.unsplash.com/photo-1610988323540-dc84d2c70a6c?w=800&q=80", // fromages artisanaux
  ],
  "Boulangerie Artisanale Dupont": [
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80", // boulangerie
    "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80", // pain artisanal
    "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=800&q=80", // pâtisserie
  ],
  "Location de vélos - Ardenne Bike": [
    "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&q=80", // vélos
    "https://images.unsplash.com/photo-1505705694390-019c3d9c3e36?w=800&q=80", // VTT forêt
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", // vélo électrique
  ],
  "Pharmacie Centrale": [
    "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800&q=80", // pharmacie
    "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&q=80", // pharmacie intérieur
  ],
  "Médecin de garde": [
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80", // médecin
    "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=80", // cabinet médical
  ],
};

async function addDemoPhotos() {
  console.log('📸 Ajout des photos aux conseils...\n');

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

    // 2. Récupérer tous les conseils du client
    const { data: tips, error: tipsError } = await supabase
      .from('tips')
      .select('id, title')
      .eq('client_id', client.id);

    if (tipsError || !tips) {
      console.error('❌ Erreur lors de la récupération des conseils:', tipsError?.message);
      return;
    }

    console.log(`✅ ${tips.length} conseils trouvés\n`);

    // 3. Ajouter les photos pour chaque conseil
    let successCount = 0;
    let errorCount = 0;
    let photoCount = 0;

    for (const tip of tips) {
      const photos = photoData[tip.title];

      if (!photos) {
        console.log(`⚠️  ${tip.title}: Pas de photos définies`);
        continue;
      }

      console.log(`📷 ${tip.title}:`);

      for (let i = 0; i < photos.length; i++) {
        const { error } = await supabase.from('tip_media').insert({
          tip_id: tip.id,
          url: photos[i],
          type: 'image',
          order: i,
        });

        if (error) {
          console.log(`   ❌ Photo ${i + 1}: ${error.message}`);
          errorCount++;
        } else {
          console.log(`   ✅ Photo ${i + 1} ajoutée`);
          photoCount++;
        }
      }

      successCount++;
      console.log('');
    }

    console.log('='.repeat(60));
    console.log('📊 RÉSUMÉ:');
    console.log('='.repeat(60));
    console.log(`✅ Conseils traités: ${successCount}/${tips.length}`);
    console.log(`📸 Photos ajoutées: ${photoCount}`);
    if (errorCount > 0) {
      console.log(`❌ Erreurs: ${errorCount}`);
    }
    console.log('='.repeat(60));
    console.log('\n🎉 Photos ajoutées avec succès !');
    console.log('👉 Rechargez http://localhost:3001/demo pour voir les photos');

  } catch (error) {
    console.error('❌ Erreur fatale:', error.message);
  }
}

addDemoPhotos();
