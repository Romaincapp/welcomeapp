/**
 * Script pour tester le système d'automatisation des emails
 * Lance manuellement le cron job en local
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger .env.local explicitement
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const CRON_SECRET = process.env.CRON_SECRET;
const BASE_URL = 'http://localhost:3000';

async function testEmailAutomations() {
  console.log('🤖 [TEST AUTOMATIONS] Démarrage du test...\n');

  if (!CRON_SECRET) {
    console.error('❌ CRON_SECRET non trouvé dans .env.local');
    process.exit(1);
  }

  try {
    console.log('📡 [TEST AUTOMATIONS] Appel du cron job...');
    const response = await fetch(`${BASE_URL}/api/cron/email-automations`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${CRON_SECRET}`,
      },
    });

    console.log(`📊 [TEST AUTOMATIONS] Status: ${response.status}\n`);

    const data = await response.json();

    if (response.ok) {
      console.log('✅ [TEST AUTOMATIONS] Succès !');
      console.log('\n📋 [RÉSULTATS]');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.error('❌ [TEST AUTOMATIONS] Erreur !');
      console.error(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ [TEST AUTOMATIONS] Erreur de connexion:', error.message);
    console.log('\n💡 Assurez-vous que le serveur dev tourne avec `npm run dev`');
  }
}

testEmailAutomations();
