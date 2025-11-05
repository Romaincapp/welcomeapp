/**
 * Script de test simple pour l'envoi d'emails
 * Usage: node scripts/test-email-simple.mjs
 */

const API_URL = 'http://localhost:3000/api/admin/send-campaign';

console.log('🧪 Test de l\'API Route /api/admin/send-campaign\n');

const payload = {
  templateType: 'welcome',
  subject: '🧪 Test Email - WelcomeApp',
  segment: 'all',
  testMode: true, // IMPORTANT: Envoie uniquement à l'admin
};

console.log('📨 Envoi de la requête...');
console.log('Payload:', JSON.stringify(payload, null, 2));
console.log('');

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
    console.log('✅ SUCCÈS !');
    console.log(`📧 Total envoyés: ${data.totalSent}`);
    console.log(`❌ Total échoués: ${data.totalFailed}`);
    console.log('\n📊 Détails:');
    data.results.forEach((result, index) => {
      const status = result.status === 'sent' ? '✅' : '❌';
      console.log(`  ${status} ${result.email} (${result.status})`);
      if (result.id) {
        console.log(`     ID Resend: ${result.id}`);
      }
      if (result.error) {
        console.log(`     Erreur: ${result.error}`);
      }
    });
    console.log('\n🎉 Vérifiez votre boîte email (romainfrancedumoulin@gmail.com) !');
  } else {
    console.error('\n❌ ERREUR !');
    console.error(`Status: ${response.status}`);
    console.error('Message:', data.error || data);

    if (response.status === 401) {
      console.error('\n⚠️  Vous n\'êtes pas authentifié comme admin.');
      console.error('Solution: Connectez-vous sur http://localhost:3000/login avec romainfrancedumoulin@gmail.com');
    }
  }
} catch (error) {
  console.error('\n❌ ERREUR DE CONNEXION:');
  console.error(error.message);
  console.error('\n⚠️  Assurez-vous que le serveur Next.js est lancé:');
  console.error('   npm run dev');
}
