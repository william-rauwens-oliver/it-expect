#!/usr/bin/env node

// Script principal pour exécuter tous les tests (5 unitaires + 5 fonctionnels + 5 E2E)
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 EXÉCUTION COMPLÈTE DES TESTS FINANCE FLOW');
console.log('=============================================\n');

let totalPassed = 0;
let totalFailed = 0;
let totalTests = 0;

function runTest(testType, testFile) {
  return new Promise((resolve) => {
    console.log(`\n🧪 ${testType}`);
    console.log('='.repeat(50));
    
    const testProcess = spawn('node', [path.join(__dirname, 'tests', testFile)], {
      stdio: 'pipe'
    });
    
    let output = '';
    let errorOutput = '';
    
    testProcess.stdout.on('data', (data) => {
      output += data.toString();
      process.stdout.write(data);
    });
    
    testProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      process.stderr.write(data);
    });
    
    testProcess.on('close', (code) => {
      // Analyser les résultats
      const lines = output.split('\n');
      let passed = 0;
      let failed = 0;
      
      lines.forEach(line => {
        if (line.includes('✅')) passed++;
        if (line.includes('❌')) failed++;
      });
      
      totalPassed += passed;
      totalFailed += failed;
      totalTests += (passed + failed);
      
      console.log(`\n📊 ${testType} - Résultat: ${passed} réussis, ${failed} échoués`);
      
      if (code === 0) {
        console.log(`✅ ${testType} terminé avec succès`);
      } else {
        console.log(`❌ ${testType} terminé avec des erreurs`);
      }
      
      resolve({ passed, failed, code });
    });
  });
}

async function runAllTests() {
  console.log('🎯 Objectif: 5 tests unitaires + 5 tests fonctionnels + 5 tests E2E\n');
  
  try {
    // 1. Tests Unitaires
    await runTest('Tests Unitaires (5 tests)', 'unit-tests.js');
    
    // 2. Tests Fonctionnels  
    await runTest('Tests Fonctionnels (5 tests)', 'functional-tests.js');
    
    // 3. Tests E2E
    await runTest('Tests E2E (5 tests)', 'e2e-tests.js');
    
    // Résumé final
    console.log('\n🎉 RÉSUMÉ FINAL DE TOUS LES TESTS');
    console.log('==================================');
    console.log(`📈 Total des tests exécutés: ${totalTests}`);
    console.log(`✅ Tests réussis: ${totalPassed}`);
    console.log(`❌ Tests échoués: ${totalFailed}`);
    console.log(`🎯 Taux de réussite global: ${Math.round((totalPassed / totalTests) * 100)}%`);
    
    if (totalFailed === 0) {
      console.log('\n🚀 TOUS LES TESTS SONT PASSÉS !');
      console.log('💯 Finance Flow est prêt pour la production !');
    } else {
      console.log('\n⚠️  Certains tests ont échoué.');
      console.log('🔧 Vérifiez les services et relancez les tests.');
    }
    
    // Informations sur la page de base
    console.log('\n🌐 PAGE DE BASE DISPONIBLE:');
    console.log('• Application React: http://127.0.0.1:8080');
    console.log('• Formulaire HTML: http://127.0.0.1:4000/public/form.html');
    console.log('• API Health: http://127.0.0.1:4000/api/health');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution des tests:', error);
    process.exit(1);
  }
}

// Vérification des services avant de commencer
console.log('🔍 Vérification des services...');
const fetch = require('node-fetch');

async function checkServices() {
  try {
    const apiHealth = await fetch('http://127.0.0.1:4000/api/health');
    const reactApp = await fetch('http://127.0.0.1:8080/');
    
    if (apiHealth.status === 200 && reactApp.status === 200) {
      console.log('✅ Tous les services sont opérationnels\n');
      await runAllTests();
    } else {
      console.log('❌ Services non disponibles. Veuillez démarrer:');
      console.log('   node api/server.js &');
      console.log('   node ledger/server.js &');
      console.log('   python3 -m http.server 8080 --directory build &');
      process.exit(1);
    }
  } catch (error) {
    console.log('❌ Impossible de vérifier les services:', error.message);
    console.log('💡 Assurez-vous que tous les services sont démarrés.');
    process.exit(1);
  }
}

checkServices();
