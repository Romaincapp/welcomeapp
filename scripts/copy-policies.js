const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('📋 Préparation du SQL pour l\'application des policies...\n');

// Lire le fichier SQL
const sqlPath = path.join(__dirname, '..', 'supabase', 'policies.sql');
const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

// Copier dans le presse-papier (Windows)
exec(`echo ${sqlContent.replace(/"/g, '\\"')} | clip`, (error) => {
  if (error) {
    console.error('❌ Erreur lors de la copie:', error.message);
    console.log('\n📄 Voici le contenu à copier manuellement:\n');
    console.log('='.repeat(50));
    console.log(sqlContent);
    console.log('='.repeat(50));
  } else {
    console.log('✅ Le SQL a été copié dans votre presse-papier!\n');
  }

  console.log('🌐 Étapes suivantes:');
  console.log('   1. Ouvrez ce lien: https://supabase.com/dashboard/project/nimbzitahumdefggtiob/sql/new');
  console.log('   2. Collez le contenu (Ctrl+V)');
  console.log('   3. Cliquez sur "Run" en bas à droite');
  console.log('\n📊 Statistiques:');
  console.log('   - Taille du fichier:', sqlContent.length, 'caractères');
  console.log('   - Nombre de lignes:', sqlContent.split('\n').length);
  console.log('\n💡 Le lien s\'ouvrira dans votre navigateur dans 5 secondes...');

  // Ouvrir automatiquement le navigateur
  setTimeout(() => {
    exec('start https://supabase.com/dashboard/project/nimbzitahumdefggtiob/sql/new');
  }, 5000);
});
