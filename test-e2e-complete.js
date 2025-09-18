#!/usr/bin/env node

const fetch = require('node-fetch');

const API_BASE = 'http://127.0.0.1:4000';
const LEDGER_BASE = 'http://127.0.0.1:5000';
const REACT_APP = 'http://127.0.0.1:8080';

// Fonction utilitaire pour faire des requêtes
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data, headers: response.headers };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

// Tests E2E complets
async function runCompleteE2ETests() {
  console.log('🧪 Tests E2E Complets - Toutes les Fonctionnalités Finance Flow\n');
  
  let passed = 0;
  let failed = 0;
  let totalTests = 0;

  // Fonction helper pour les tests
  function testResult(testName, success, details = '') {
    totalTests++;
    if (success) {
      console.log(`   ✅ ${testName}`);
      if (details) console.log(`      ${details}`);
      passed++;
    } else {
      console.log(`   ❌ ${testName}`);
      if (details) console.log(`      ${details}`);
      failed++;
    }
  }

  // Fonctionnalité 1: Healthcheck API
  console.log('🔧 Fonctionnalité 1: Healthcheck API');
  const health = await makeRequest(`${API_BASE}/api/health`);
  testResult('REC-001: API opérationnelle', 
    health.status === 200 && health.data.status === 'ok');

  // Fonctionnalité 2: Gestion des Transactions
  console.log('\n📋 Fonctionnalité 2: Gestion des Transactions');
  
  const transactions = await makeRequest(`${API_BASE}/api/transactions`);
  testResult('REC-002: Lister transactions', 
    transactions.status === 200 && Array.isArray(transactions.data),
    `${transactions.data?.length || 0} transactions trouvées`);

  // Test structure des transactions
  if (transactions.status === 200 && transactions.data.length > 0) {
    const validStructure = transactions.data.every(t => 
      t.hasOwnProperty('id') && t.hasOwnProperty('label') && t.hasOwnProperty('amount') &&
      typeof t.id === 'number' && typeof t.label === 'string' && typeof t.amount === 'number'
    );
    testResult('Structure des transactions valide', validStructure);
  }

  // Ajouter une transaction approuvée (revenu)
  const newRevenue = await makeRequest(`${API_BASE}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label: 'Salaire E2E', amount: 2500 })
  });
  testResult('REC-003: Ajouter revenu', 
    newRevenue.status === 201 && newRevenue.data.label === 'Salaire E2E');

  // Ajouter une transaction approuvée (dépense)
  const newExpense = await makeRequest(`${API_BASE}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label: 'Courses E2E', amount: -150 })
  });
  testResult('REC-003: Ajouter dépense', 
    newExpense.status === 201 && newExpense.data.amount === -150);

  // Fonctionnalité 3: Validation et Refus
  console.log('\n🚫 Fonctionnalité 3: Validation et Refus');
  
  const zeroAmount = await makeRequest(`${API_BASE}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label: 'Zero E2E', amount: 0 })
  });
  testResult('REC-004: Refus montant nul', 
    zeroAmount.status === 422 && zeroAmount.data.reason === 'zero_amount');

  const invalidPayload = await makeRequest(`${API_BASE}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label: 123, amount: 'invalid' })
  });
  testResult('REC-005: Refus payload invalide', 
    invalidPayload.status === 400 && invalidPayload.data.error === 'invalid_payload');

  const missingLabel = await makeRequest(`${API_BASE}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 100 })
  });
  testResult('Refus label manquant', 
    missingLabel.status === 400 && missingLabel.data.error === 'invalid_payload');

  // Fonctionnalité 4: Service Ledger
  console.log('\n🔗 Fonctionnalité 4: Service Ledger');
  
  const ledgerValidation = await makeRequest(`${LEDGER_BASE}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label: 'Test Ledger', amount: 100 })
  });
  testResult('Validation Ledger', 
    ledgerValidation.status === 200 && ledgerValidation.data.approved === true);

  const ledgerReject = await makeRequest(`${LEDGER_BASE}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label: 'Test Zero', amount: 0 })
  });
  testResult('Refus Ledger (montant nul)', 
    ledgerReject.status === 200 && ledgerReject.data.approved === false);

  // Fonctionnalité 5: Interface Utilisateur
  console.log('\n🌐 Fonctionnalité 5: Interface Utilisateur');
  
  try {
    const formResponse = await fetch(`${API_BASE}/public/form.html`);
    const formContent = await formResponse.text();
    const hasFormElements = formContent.includes('Nouvelle transaction') && 
                           formContent.includes('id="label"') && 
                           formContent.includes('id="amount"') && 
                           formContent.includes('Envoyer');
    testResult('Interface formulaire HTML', formResponse.status === 200 && hasFormElements);
  } catch (error) {
    testResult('Interface formulaire HTML', false, error.message);
  }

  try {
    const reactResponse = await fetch(`${REACT_APP}/`);
    const reactContent = await reactResponse.text();
    const hasReactElements = reactContent.includes('React App') && 
                            reactContent.includes('root') && 
                            reactContent.includes('main.b82f7fcc.js');
    testResult('Interface React accessible', reactResponse.status === 200 && hasReactElements);
  } catch (error) {
    testResult('Interface React accessible', false, error.message);
  }

  // Fonctionnalité 6: CORS et Intégration
  console.log('\n🔧 Fonctionnalité 6: CORS et Intégration');
  
  try {
    const corsResponse = await fetch(`${API_BASE}/api/transactions`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://127.0.0.1:8080',
        'Access-Control-Request-Method': 'POST'
      }
    });
    const corsHeaders = corsResponse.headers.get('access-control-allow-origin');
    testResult('CORS configuré', 
      corsResponse.status === 200 && corsHeaders === '*');
  } catch (error) {
    testResult('CORS configuré', false, error.message);
  }

  // Fonctionnalité 7: Calculs et Analyses
  console.log('\n📊 Fonctionnalité 7: Calculs et Analyses');
  
  const finalTransactions = await makeRequest(`${API_BASE}/api/transactions`);
  if (finalTransactions.status === 200) {
    const total = finalTransactions.data.reduce((sum, t) => sum + t.amount, 0);
    const revenus = finalTransactions.data.filter(t => t.amount > 0);
    const depenses = finalTransactions.data.filter(t => t.amount < 0);
    
    testResult('Calcul solde total', 
      typeof total === 'number' && !isNaN(total) && isFinite(total),
      `Solde: ${total}€`);
    
    testResult('Analyse revenus/dépenses', 
      revenus.length > 0 && depenses.length > 0,
      `${revenus.length} revenus, ${depenses.length} dépenses`);
  }

  // Fonctionnalité 8: Gestion des Erreurs
  console.log('\n🚨 Fonctionnalité 8: Gestion des Erreurs');
  
  const malformedRequest = await makeRequest(`${API_BASE}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: null
  });
  testResult('Gestion requêtes malformées', malformedRequest.status === 400);

  // Fonctionnalité 9: Validation des Données
  console.log('\n🔍 Fonctionnalité 9: Validation des Données');
  
  if (finalTransactions.status === 200) {
    const ids = finalTransactions.data.map(t => t.id);
    const uniqueIds = [...new Set(ids)];
    testResult('IDs de transactions uniques', ids.length === uniqueIds.length);
    
    const validTypes = finalTransactions.data.every(t => 
      typeof t.id === 'number' && typeof t.label === 'string' && typeof t.amount === 'number'
    );
    testResult('Types de données valides', validTypes);
  }

  // Fonctionnalité 10: Performance
  console.log('\n⚡ Fonctionnalité 10: Performance et Fiabilité');
  
  const startTime = Date.now();
  const perfTest = await makeRequest(`${API_BASE}/api/health`);
  const responseTime = Date.now() - startTime;
  
  testResult('Temps de réponse acceptable', 
    perfTest.status === 200 && responseTime < 1000,
    `${responseTime}ms`);

  // Résumé final
  console.log('\n📊 RÉSUMÉ DES TESTS E2E COMPLETS');
  console.log('==================================');
  console.log(`📈 Total des tests: ${totalTests}`);
  console.log(`✅ Tests réussis: ${passed}`);
  console.log(`❌ Tests échoués: ${failed}`);
  console.log(`🎯 Taux de réussite: ${Math.round((passed / totalTests) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 Tous les tests E2E sont passés !');
    console.log('🚀 Finance Flow est prêt pour la production !');
  } else {
    console.log('\n⚠️  Certains tests ont échoué. Vérifiez les services.');
  }

  // Détail des fonctionnalités testées
  console.log('\n📋 FONCTIONNALITÉS TESTÉES:');
  console.log('• Healthcheck API');
  console.log('• Gestion des transactions (CRUD)');
  console.log('• Validation et refus (règles métier)');
  console.log('• Service Ledger (validation)');
  console.log('• Interfaces utilisateur (HTML + React)');
  console.log('• CORS et intégration');
  console.log('• Calculs et analyses financières');
  console.log('• Gestion des erreurs');
  console.log('• Validation des données');
  console.log('• Performance et fiabilité');
}

// Exécution des tests
runCompleteE2ETests().catch(console.error);
