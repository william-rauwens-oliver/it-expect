#!/usr/bin/env node

// Tests Fonctionnels Finance Flow - 5 tests essentiels
const fetch = require('node-fetch');

const API_BASE = 'http://127.0.0.1:4000';
const LEDGER_BASE = 'http://127.0.0.1:5000';

console.log('🔧 Tests Fonctionnels Finance Flow - 5 Tests Essentiels\n');

let passed = 0;
let failed = 0;

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

function testResult(testName, success, details = '') {
  if (success) {
    console.log(`✅ ${testName}`);
    if (details) console.log(`   ${details}`);
    passed++;
  } else {
    console.log(`❌ ${testName}`);
    if (details) console.log(`   ${details}`);
    failed++;
  }
}

async function runFunctionalTests() {
  // Test Fonctionnel 1: Création complète d'un revenu
  console.log('Test Fonctionnel 1: Création complète d\'un revenu');
  const revenue = await makeRequest(`${API_BASE}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label: 'Salaire Fonctionnel', amount: 3000 })
  });
  testResult('Création revenu', 
    revenue.status === 201 && revenue.data.label === 'Salaire Fonctionnel',
    `ID: ${revenue.data?.id}, Montant: ${revenue.data?.amount}€`);

  // Test Fonctionnel 2: Création complète d'une dépense
  console.log('\nTest Fonctionnel 2: Création complète d\'une dépense');
  const expense = await makeRequest(`${API_BASE}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label: 'Courses Fonctionnel', amount: -200 })
  });
  testResult('Création dépense', 
    expense.status === 201 && expense.data.amount === -200,
    `ID: ${expense.data?.id}, Montant: ${expense.data?.amount}€`);

  // Test Fonctionnel 3: Validation métier - Refus montant nul
  console.log('\nTest Fonctionnel 3: Validation métier - Refus montant nul');
  const zeroReject = await makeRequest(`${API_BASE}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label: 'Zero Fonctionnel', amount: 0 })
  });
  testResult('Refus montant nul', 
    zeroReject.status === 422 && zeroReject.data.reason === 'zero_amount',
    `Erreur: ${zeroReject.data?.error}, Raison: ${zeroReject.data?.reason}`);

  // Test Fonctionnel 4: Flux complet API → Ledger → Stockage
  console.log('\nTest Fonctionnel 4: Flux complet API → Ledger → Stockage');
  
  // Étape 1: Validation Ledger
  const ledgerValidation = await makeRequest(`${LEDGER_BASE}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label: 'Test Flux', amount: 1500 })
  });
  
  // Étape 2: Création via API (qui appelle le Ledger)
  const apiTransaction = await makeRequest(`${API_BASE}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label: 'Test Flux Complet', amount: 1500 })
  });
  
  testResult('Flux complet API → Ledger → Stockage', 
    ledgerValidation.status === 200 && ledgerValidation.data.approved === true &&
    apiTransaction.status === 201 && apiTransaction.data.label === 'Test Flux Complet',
    `Ledger: ${ledgerValidation.data?.approved}, API: ${apiTransaction.status}`);

  // Test Fonctionnel 5: Analyse financière complète
  console.log('\nTest Fonctionnel 5: Analyse financière complète');
  const allTransactions = await makeRequest(`${API_BASE}/api/transactions`);
  if (allTransactions.status === 200) {
    const transactions = allTransactions.data;
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    const revenus = transactions.filter(t => t.amount > 0);
    const depenses = transactions.filter(t => t.amount < 0);
    const totalRevenus = revenus.reduce((sum, t) => sum + t.amount, 0);
    const totalDepenses = Math.abs(depenses.reduce((sum, t) => sum + t.amount, 0));
    
    testResult('Analyse financière complète', 
      transactions.length > 0 && !isNaN(total) && 
      revenus.length > 0 && depenses.length > 0,
      `Total: ${total}€, Revenus: ${revenus.length} (${totalRevenus}€), Dépenses: ${depenses.length} (${totalDepenses}€)`);
  } else {
    testResult('Analyse financière complète', false, 'Impossible de récupérer les transactions');
  }

  // Résumé
  console.log('\n📊 Résumé Tests Fonctionnels');
  console.log('==============================');
  console.log(`✅ Tests réussis: ${passed}`);
  console.log(`❌ Tests échoués: ${failed}`);
  console.log(`🎯 Taux de réussite: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    console.log('\n🎉 Tous les tests fonctionnels sont passés !');
  } else {
    console.log('\n⚠️  Certains tests fonctionnels ont échoué.');
  }
}

// Exécution des tests
runFunctionalTests().catch(console.error);
