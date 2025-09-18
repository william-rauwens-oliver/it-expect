#!/usr/bin/env node

// Tests Unitaires Finance Flow - 5 tests essentiels
const assert = require('assert');

// Import des modules à tester (simulation)
const ledgerValidation = (label, amount) => {
  if (typeof label !== 'string' || typeof amount !== 'number') {
    return { approved: false, reason: 'invalid_payload' };
  }
  if (amount === 0) {
    return { approved: false, reason: 'zero_amount' };
  }
  return { approved: true };
};

const generateId = (transactions) => {
  return transactions.length ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
};

const validateTransaction = (label, amount) => {
  if (typeof label !== 'string') return false;
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return false;
  return true;
};

const calculateTotal = (transactions) => {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
};

const formatCurrency = (amount) => {
  return `${amount}€`;
};

console.log('🧪 Tests Unitaires Finance Flow - 10 Tests Essentiels\n');

let passed = 0;
let failed = 0;

function runTest(testName, testFunction) {
  try {
    testFunction();
    console.log(`✅ ${testName}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${testName}: ${error.message}`);
    failed++;
  }
}

// Test 1: Validation Ledger - Transaction valide
runTest('Test 1: Validation Ledger - Transaction valide', () => {
  const result = ledgerValidation('Salaire', 2500);
  assert.strictEqual(result.approved, true);
  assert.strictEqual(result.reason, undefined);
});

// Test 2: Validation Ledger - Montant nul
runTest('Test 2: Validation Ledger - Refus montant nul', () => {
  const result = ledgerValidation('Zero', 0);
  assert.strictEqual(result.approved, false);
  assert.strictEqual(result.reason, 'zero_amount');
});

// Test 3: Génération d'ID unique
runTest('Test 3: Génération d\'ID unique', () => {
  const transactions = [
    { id: 1, label: 'Test1', amount: 100 },
    { id: 3, label: 'Test2', amount: 200 },
    { id: 5, label: 'Test3', amount: 300 }
  ];
  const newId = generateId(transactions);
  assert.strictEqual(newId, 6);
  
  const emptyTransactions = [];
  const firstId = generateId(emptyTransactions);
  assert.strictEqual(firstId, 1);
});

// Test 4: Validation de transaction
runTest('Test 4: Validation de transaction', () => {
  assert.strictEqual(validateTransaction('Salaire', 2500), true);
  assert.strictEqual(validateTransaction(123, 2500), false);
  assert.strictEqual(validateTransaction('Salaire', 'invalid'), false);
  assert.strictEqual(validateTransaction('', 2500), true); // string vide valide
  assert.strictEqual(validateTransaction(null, 2500), false);
});

// Test 5: Calcul du total
runTest('Test 5: Calcul du total des transactions', () => {
  const transactions = [
    { id: 1, label: 'Salaire', amount: 2500 },
    { id: 2, label: 'Loyer', amount: -800 },
    { id: 3, label: 'Prime', amount: 500 }
  ];
  const total = calculateTotal(transactions);
  assert.strictEqual(total, 2200);
  
  const emptyTransactions = [];
  const emptyTotal = calculateTotal(emptyTransactions);
  assert.strictEqual(emptyTotal, 0);
});

// Test 6: Formatage monétaire
runTest('Test 6: Formatage monétaire', () => {
  assert.strictEqual(formatCurrency(0), '0€');
  assert.strictEqual(formatCurrency(1234), '1234€');
  assert.strictEqual(formatCurrency(-56.7), '-56.7€');
});

// Test 7: Calcul du total avec décimales (gestion des flottants)
runTest('Test 7: Calcul du total avec décimales', () => {
  const transactions = [
    { id: 1, label: 'A', amount: 0.1 },
    { id: 2, label: 'B', amount: 0.2 },
    { id: 3, label: 'C', amount: -0.3 }
  ];
  const total = calculateTotal(transactions);
  // Tolérance floating point
  const rounded = Math.round(total * 100) / 100;
  assert.strictEqual(rounded, 0);
});

// Test 8: Validation de transaction - cas NaN et undefined
runTest('Test 8: Validation de transaction - NaN et undefined', () => {
  assert.strictEqual(validateTransaction('Salaire', NaN), false);
  assert.strictEqual(validateTransaction('Salaire', undefined), false);
  assert.strictEqual(validateTransaction(undefined, 100), false);
});

// Test 9: Génération d'ID avec grands identifiants non séquentiels
runTest('Test 9: Génération d\'ID avec grands identifiants', () => {
  const transactions = [
    { id: 10, label: 'X', amount: 1 },
    { id: 1000, label: 'Y', amount: 2 },
    { id: 42, label: 'Z', amount: 3 }
  ];
  const newId = generateId(transactions);
  assert.strictEqual(newId, 1001);
});

// Test 10: Calcul du total - grande liste
runTest('Test 10: Calcul du total - grande liste', () => {
  const transactions = [];
  for (let i = 1; i <= 1000; i++) {
    transactions.push({ id: i, label: `T${i}`, amount: i % 2 === 0 ? i : -i });
  }
  const total = calculateTotal(transactions);
  // Somme des pairs 2+4+...+1000 = 250500, somme des impairs 1+3+...+999 = 250000
  // total attendu = 250500 - 250000 = 500
  assert.strictEqual(total, 500);
});

// Résumé
console.log('\n📊 Résumé Tests Unitaires');
console.log('==========================');
console.log(`✅ Tests réussis: ${passed}`);
console.log(`❌ Tests échoués: ${failed}`);
console.log(`🎯 Taux de réussite: ${Math.round((passed / (passed + failed)) * 100)}%`);

if (failed === 0) {
  console.log('\n🎉 Tous les tests unitaires sont passés !');
} else {
  console.log('\n⚠️  Certains tests unitaires ont échoué.');
}

process.exit(failed > 0 ? 1 : 0);
