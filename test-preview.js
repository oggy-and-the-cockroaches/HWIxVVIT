/**
 * Automated QA & Static Test Suite
 * Validates module syntax, file dependencies, and DOM contract.
 */

const { execSync } = require('child_process');

console.log('Running test suite for HWI x VVITU platform...\n');

try {
  console.log('1. Checking JavaScript ES Modules syntax:');
  const jsFiles = [
    'js/config.js',
    'js/utils/dom.js',
    'js/utils/formatters.js',
    'js/modules/navigation.js',
    'js/modules/hackathonsModule.js',
    'js/modules/eventsModule.js',
    'js/modules/settingsModule.js',
    'js/supabaseClient.js',
    'js/auth.js',
    'js/authGuard.js',
    'js/admin/dashboard.js',
    'js/main.js'
  ];

  for (const file of jsFiles) {
    execSync(`node --check ${file}`, { stdio: 'inherit' });
    console.log(`   [PASS] ${file}`);
  }

  console.log('\n2. Running Static & Content Integrity Audit:');
  execSync('node verify-integrity.js', { stdio: 'inherit' });

  console.log('\nAll tests passed successfully!');
} catch (err) {
  console.error('\nTest suite failed:', err.message);
  process.exit(1);
}
