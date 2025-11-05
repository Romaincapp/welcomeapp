/**
 * Script de test pour l'envoi d'emails
 *
 * Usage:
 *   npx ts-node scripts/test-email.ts
 *
 * Ce script teste l'API Route /api/admin/send-campaign en mode test
 * (envoie uniquement à l'admin)
 */

async function testEmailCampaign() {
  const API_URL = 'http://localhost:3000/api/admin/send-campaign';

  console.log('🧪 Test de l\'API Route /api/admin/send-campaign\n');

  const payload = {
    templateType: 'welcome',
    subject: '🧪 Test - Bienvenue sur WelcomeApp !',
    segment: 'all',
    testMode: true, // IMPORTANT: Envoie uniquement à l'admin
  };

  console.log('📨 Envoi de la requête...');
  console.log('Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ Succès !');
      console.log(`Total envoyés: ${data.totalSent}`);
      console.log(`Total échoués: ${data.totalFailed}`);
      console.log('\nRésultats:', JSON.stringify(data.results, null, 2));
    } else {
      console.error('\n❌ Erreur !');
      console.error('Status:', response.status);
      console.error('Message:', data.error || data);
    }
  } catch (error) {
    console.error('\n❌ Erreur de connexion:');
    console.error(error);
    console.error('\nAssurez-vous que le serveur Next.js est lancé (npm run dev)');
  }
}

testEmailCampaign();
