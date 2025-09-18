#!/usr/bin/env node

const fetch = require('node-fetch');

const API_BASE = 'http://127.0.0.1:4000';

// Fonction utilitaire pour faire des requêtes
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

// Tests fonctionnels
async function runFunctionalTests() {
  console.log('🧪 Tests Fonctionnels - Finance Flow\n');
  
  let passed = 0;
  let failed = 0;

  // Test 1: Healthcheck
  console.log('1. Test Healthcheck API...');
  const health = await makeRequest(`${API_BASE}/api/health`);
  if (health.status === 200 && health.data.status === 'ok') {
    console.log('   ✅ API est opérationnelle');
    passed++;
  } else {
    console.log('   ❌ API non disponible');
    failed++;
  }

  // Test 2: Liste des transactions
  console.log('\n2. Test Consultation des transactions...');
  const transactions = await makeRequest(`${API_BASE}/api/transactions`);
  if (transactions.status === 200 && Array.isArray(transactions.data)) {
    console.log(`   ✅ ${transactions.data.length} transactions trouvées`);
    passed++;
  } else {
    console.log('   ❌ Impossible de récupérer les transactions');
    failed++;
  }

  // Test 3: Ajout d'un revenu
  console.log('\n3. Test Ajout d\'un revenu...');
  const newRevenue = await makeRequest(`${API_BASE}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label: 'Test Fonctionnel Revenu', amount: 1500 })
  });
  if (newRevenue.status === 201 && newRevenue.data.label === 'Test Fonctionnel Revenu') {
    console.log('   ✅ Revenu ajouté avec succès');
    passed++;
  } else {
    console.log('   ❌ Échec de l\'ajout du revenu');
    failed++;
  }

  // Test 4: Ajout d'une dépense
  console.log('\n4. Test Ajout d\'une dépense...');
  const newExpense = await makeRequest(`${API_BASE}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label: 'Test Fonctionnel Dépense', amount: -300 })
  });
  if (newExpense.status === 201 && newExpense.data.amount === -300) {
    console.log('   ✅ Dépense ajoutée avec succès');
    passed++;
  } else {
    console.log('   ❌ Échec de l\'ajout de la dépense');
    failed++;
  }

  // Test 5: Validation montant nul
  console.log('\n5. Test Validation montant nul...');
  const zeroAmount = await makeRequest(`${API_BASE}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label: 'Test Zero', amount: 0 })
  });
  if (zeroAmount.status === 422 && zeroAmount.data.reason === 'zero_amount') {
    console.log('   ✅ Montant nul correctement rejeté');
    passed++;
  } else {
    console.log('   ❌ Validation montant nul échouée');
    failed++;
  }

  // Test 6: Validation payload invalide
  console.log('\n6. Test Validation payload invalide...');
  const invalidPayload = await makeRequest(`${API_BASE}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label: 123, amount: 'invalid' })
  });
  if (invalidPayload.status === 400 && invalidPayload.data.error === 'invalid_payload') {
    console.log('   ✅ Payload invalide correctement rejeté');
    passed++;
  } else {
    console.log('   ❌ Validation payload invalide échouée');
    failed++;
  }

  // Test 7: Calcul du solde
  console.log('\n7. Test Calcul du solde...');
  const finalTransactions = await makeRequest(`${API_BASE}/api/transactions`);
  if (finalTransactions.status === 200) {
    const total = finalTransactions.data.reduce((sum, t) => sum + t.amount, 0);
    console.log(`   ✅ Solde total calculé: ${total}€`);
    passed++;
  } else {
    console.log('   ❌ Impossible de calculer le solde');
    failed++;
  }

  // Test 8: Interface utilisateur (Homepage React)
  console.log('\n8. Test Interface utilisateur (Homepage)...');
  try {
    const homepageTest = await fetch('http://127.0.0.1:8080/');
    if (homepageTest.status === 200) {
      const htmlContent = await homepageTest.text();
      // Vérifier que la homepage React contient les éléments essentiels
      if (htmlContent.includes('React App') && 
          htmlContent.includes('root') && 
          htmlContent.includes('main.b82f7fcc.js')) {
        console.log('   ✅ Homepage React accessible et fonctionnelle');
        passed++;
      } else {
        console.log('   ❌ Homepage React incomplète');
        failed++;
      }
    } else {
      console.log('   ❌ Homepage React non accessible');
      failed++;
    }
  } catch (error) {
    console.log('   ❌ Erreur lors du test de la homepage React');
    failed++;
  }

  // Résumé
  console.log('\n📊 Résumé des Tests Fonctionnels');
  console.log('================================');
  console.log(`✅ Tests réussis: ${passed}`);
  console.log(`❌ Tests échoués: ${failed}`);
  console.log(`📈 Taux de réussite: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 Tous les tests fonctionnels sont passés !');
  } else {
    console.log('\n⚠️  Certains tests ont échoué. Vérifiez les services.');
  }
}

// Exécution des tests
runFunctionalTests().catch(console.error);
