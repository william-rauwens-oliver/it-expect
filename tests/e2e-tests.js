#!/usr/bin/env node

// Tests E2E Finance Flow - 5 tests essentiels
const fetch = require('node-fetch');

const API_BASE = 'http://127.0.0.1:4000';
const REACT_APP = 'http://127.0.0.1:8080';

console.log('🌐 Tests E2E Finance Flow - 5 Tests Essentiels\n');

let passed = 0;
let failed = 0;

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

async function runE2ETests() {
  // Test E2E 1: Parcours utilisateur complet - Ajout via formulaire HTML
  console.log('Test E2E 1: Parcours utilisateur complet - Formulaire HTML');
  
  try {
    // Vérifier que le formulaire est accessible
    const formResponse = await fetch(`${API_BASE}/public/form.html`);
    const formContent = await formResponse.text();
    
    const formAccessible = formResponse.status === 200 && 
                          formContent.includes('Nouvelle transaction') &&
                          formContent.includes('id="label"') &&
                          formContent.includes('id="amount"') &&
                          formContent.includes('Envoyer');
    
    // Simuler l'ajout d'une transaction via l'API (comme le ferait le formulaire)
    const transaction = await fetch(`${API_BASE}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: 'E2E Formulaire', amount: 750 })
    });
    const transactionData = await transaction.json();
    
    testResult('Parcours formulaire HTML complet', 
      formAccessible && transaction.status === 201,
      `Formulaire accessible: ${formAccessible}, Transaction créée: ID ${transactionData.id}`);
      
  } catch (error) {
    testResult('Parcours formulaire HTML complet', false, error.message);
  }

  // Test E2E 2: Interface React - Chargement et accessibilité
  console.log('\nTest E2E 2: Interface React - Chargement et accessibilité');
  
  try {
    const reactResponse = await fetch(`${REACT_APP}/`);
    const reactContent = await reactResponse.text();
    
    const reactLoaded = reactResponse.status === 200 &&
                       reactContent.includes('React App') &&
                       reactContent.includes('root') &&
                       reactContent.includes('main.b82f7fcc.js');
    
    testResult('Interface React chargée', 
      reactLoaded,
      `Status: ${reactResponse.status}, Éléments React présents: ${reactLoaded}`);
      
  } catch (error) {
    testResult('Interface React chargée', false, error.message);
  }

  // Test E2E 3: Gestion d'erreur complète - Montant nul via interface
  console.log('\nTest E2E 3: Gestion d\'erreur complète - Montant nul');
  
  try {
    // Simuler une erreur via l'API (comme le ferait l'interface)
    const errorResponse = await fetch(`${API_BASE}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: 'E2E Erreur', amount: 0 })
    });
    const errorData = await errorResponse.json();
    
    const errorHandled = errorResponse.status === 422 &&
                        errorData.error === 'not_approved' &&
                        errorData.reason === 'zero_amount';
    
    testResult('Gestion erreur montant nul', 
      errorHandled,
      `Status: ${errorResponse.status}, Erreur: ${errorData.error}, Raison: ${errorData.reason}`);
      
  } catch (error) {
    testResult('Gestion erreur montant nul', false, error.message);
  }

  // Test E2E 4: Intégration complète - CORS et communication
  console.log('\nTest E2E 4: Intégration complète - CORS et communication');
  
  try {
    // Test CORS
    const corsResponse = await fetch(`${API_BASE}/api/transactions`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://127.0.0.1:8080',
        'Access-Control-Request-Method': 'POST'
      }
    });
    const corsHeader = corsResponse.headers.get('access-control-allow-origin');
    
    // Test communication React → API
    const apiTest = await fetch(`${API_BASE}/api/health`);
    const apiData = await apiTest.json();
    
    const integrationWorking = corsResponse.status === 200 &&
                              corsHeader === '*' &&
                              apiTest.status === 200 &&
                              apiData.status === 'ok';
    
    testResult('Intégration CORS et communication', 
      integrationWorking,
      `CORS: ${corsHeader}, API: ${apiData.status}`);
      
  } catch (error) {
    testResult('Intégration CORS et communication', false, error.message);
  }

  // Test E2E 5: Scénario utilisateur complet - Création et consultation
  console.log('\nTest E2E 5: Scénario utilisateur complet - Création et consultation');
  
  try {
    // Étape 1: Récupérer l'état initial
    const initialResponse = await fetch(`${API_BASE}/api/transactions`);
    const initialData = await initialResponse.json();
    const initialCount = initialData.length;
    
    // Étape 2: Créer une nouvelle transaction
    const createResponse = await fetch(`${API_BASE}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: 'E2E Scénario Complet', amount: 1200 })
    });
    const createData = await createResponse.json();
    
    // Étape 3: Vérifier que la transaction a été ajoutée
    const finalResponse = await fetch(`${API_BASE}/api/transactions`);
    const finalData = await finalResponse.json();
    const finalCount = finalData.length;
    
    // Étape 4: Vérifier que la transaction est dans la liste
    const transactionExists = finalData.some(t => t.id === createData.id && t.label === 'E2E Scénario Complet');
    
    const scenarioComplete = initialResponse.status === 200 &&
                            createResponse.status === 201 &&
                            finalResponse.status === 200 &&
                            finalCount === initialCount + 1 &&
                            transactionExists;
    
    testResult('Scénario utilisateur complet', 
      scenarioComplete,
      `Transactions: ${initialCount} → ${finalCount}, Nouvelle transaction: ID ${createData.id}`);
      
  } catch (error) {
    testResult('Scénario utilisateur complet', false, error.message);
  }

  // Résumé
  console.log('\n📊 Résumé Tests E2E');
  console.log('====================');
  console.log(`✅ Tests réussis: ${passed}`);
  console.log(`❌ Tests échoués: ${failed}`);
  console.log(`🎯 Taux de réussite: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    console.log('\n🎉 Tous les tests E2E sont passés !');
  } else {
    console.log('\n⚠️  Certains tests E2E ont échoué.');
  }
}

// Exécution des tests
runE2ETests().catch(console.error);
