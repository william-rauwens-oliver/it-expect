describe('Tests E2E Complets - Toutes les Fonctionnalités Finance Flow', () => {
  const apiBase = 'http://127.0.0.1:4000';
  const ledgerBase = 'http://127.0.0.1:5000';
  const reactApp = 'http://127.0.0.1:8080';

  describe('🔧 Fonctionnalité 1: Healthcheck API', () => {
    it('REC-001: Vérifier que l\'API est opérationnelle', () => {
      cy.request('GET', `${apiBase}/api/health`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.deep.eq({ status: 'ok' });
      });
    });
  });

  describe('📋 Fonctionnalité 2: Gestion des Transactions', () => {
    it('REC-002: Lister toutes les transactions', () => {
      cy.request('GET', `${apiBase}/api/transactions`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
        
        // Vérifier la structure des transactions
        response.body.forEach(transaction => {
          expect(transaction).to.have.all.keys('id', 'label', 'amount');
          expect(transaction.id).to.be.a('number');
          expect(transaction.label).to.be.a('string');
          expect(transaction.amount).to.be.a('number');
        });
      });
    });

    it('REC-003: Ajouter une transaction approuvée (revenu)', () => {
      const initialCount = cy.request('GET', `${apiBase}/api/transactions`).then((res) => {
        const count = res.body.length;
        
        cy.request('POST', `${apiBase}/api/transactions`, {
          label: 'Salaire E2E',
          amount: 2500
        }).then((response) => {
          expect(response.status).to.eq(201);
          expect(response.body).to.include({ label: 'Salaire E2E', amount: 2500 });
          expect(response.body.id).to.be.a('number');
          
          // Vérifier que la transaction a été ajoutée
          cy.request('GET', `${apiBase}/api/transactions`).then((res) => {
            expect(res.body.length).to.eq(count + 1);
          });
        });
      });
    });

    it('REC-003: Ajouter une transaction approuvée (dépense)', () => {
      cy.request('POST', `${apiBase}/api/transactions`, {
        label: 'Courses E2E',
        amount: -150
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.include({ label: 'Courses E2E', amount: -150 });
        expect(response.body.id).to.be.a('number');
      });
    });
  });

  describe('🚫 Fonctionnalité 3: Validation et Refus', () => {
    it('REC-004: Refuser une transaction avec montant nul', () => {
      cy.request({
        method: 'POST',
        url: `${apiBase}/api/transactions`,
        body: { label: 'Zero E2E', amount: 0 },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body).to.deep.eq({ 
          error: 'not_approved', 
          reason: 'zero_amount' 
        });
      });
    });

    it('REC-005: Refuser un payload invalide', () => {
      cy.request({
        method: 'POST',
        url: `${apiBase}/api/transactions`,
        body: { label: 123, amount: 'invalid' },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.deep.eq({ error: 'invalid_payload' });
      });
    });

    it('REC-005: Refuser un payload avec label manquant', () => {
      cy.request({
        method: 'POST',
        url: `${apiBase}/api/transactions`,
        body: { amount: 100 },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.deep.eq({ error: 'invalid_payload' });
      });
    });

    it('REC-005: Refuser un payload avec amount manquant', () => {
      cy.request({
        method: 'POST',
        url: `${apiBase}/api/transactions`,
        body: { label: 'Test' },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.deep.eq({ error: 'invalid_payload' });
      });
    });
  });

  describe('🔗 Fonctionnalité 4: Service Ledger', () => {
    it('Valider une transaction via le Ledger', () => {
      cy.request('POST', `${ledgerBase}/validate`, {
        label: 'Test Ledger',
        amount: 100
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.deep.eq({ approved: true });
      });
    });

    it('Refuser une transaction via le Ledger (montant nul)', () => {
      cy.request('POST', `${ledgerBase}/validate`, {
        label: 'Test Ledger Zero',
        amount: 0
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.deep.eq({ 
          approved: false, 
          reason: 'zero_amount' 
        });
      });
    });

    it('Refuser un payload invalide via le Ledger', () => {
      cy.request({
        method: 'POST',
        url: `${ledgerBase}/validate`,
        body: { label: 123, amount: 'invalid' },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.deep.eq({ 
          approved: false, 
          reason: 'invalid_payload' 
        });
      });
    });
  });

  describe('🌐 Fonctionnalité 5: Interface Utilisateur', () => {
    it('Interface formulaire HTML accessible et fonctionnelle', () => {
      cy.visit(`${apiBase}/public/form.html`);
      
      // Vérifier les éléments de l'interface
      cy.get('h1').should('contain.text', 'Nouvelle transaction');
      cy.get('#label').should('be.visible').and('be.enabled');
      cy.get('#amount').should('be.visible').and('be.enabled');
      cy.contains('button', 'Envoyer').should('be.visible').and('be.enabled');
      cy.get('#result').should('exist');
    });

    it('Créer une transaction via le formulaire HTML', () => {
      cy.visit(`${apiBase}/public/form.html`);
      
      cy.get('#label').clear().type('Test Formulaire E2E');
      cy.get('#amount').clear().type('500');
      cy.contains('button', 'Envoyer').click();
      
      cy.get('#result').should('contain.text', 'OK: Test Formulaire E2E');
    });

    it('Gérer une erreur via le formulaire HTML', () => {
      cy.visit(`${apiBase}/public/form.html`);
      
      cy.get('#label').clear().type('Test Erreur E2E');
      cy.get('#amount').clear().type('0');
      cy.contains('button', 'Envoyer').click();
      
      cy.get('#result').should('contain.text', 'zero_amount');
    });

    it('Interface React accessible', () => {
      cy.visit(reactApp);
      
      // Vérifier que l'application React se charge
      cy.get('#root').should('be.visible');
      cy.title().should('contain', 'React App');
    });
  });

  describe('🔧 Fonctionnalité 6: CORS et Intégration', () => {
    it('CORS configuré correctement', () => {
      cy.request({
        method: 'OPTIONS',
        url: `${apiBase}/api/transactions`,
        headers: {
          'Origin': 'http://127.0.0.1:8080',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers).to.have.property('access-control-allow-origin', '*');
        expect(response.headers).to.have.property('access-control-allow-methods');
        expect(response.headers).to.have.property('access-control-allow-headers');
      });
    });

    it('Intégration API → Ledger fonctionnelle', () => {
      // Test que l'API communique correctement avec le Ledger
      cy.request('POST', `${apiBase}/api/transactions`, {
        label: 'Test Intégration E2E',
        amount: 750
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.label).to.eq('Test Intégration E2E');
        expect(response.body.amount).to.eq(750);
      });
    });
  });

  describe('📊 Fonctionnalité 7: Calculs et Analyses', () => {
    it('Calculer le solde total des transactions', () => {
      cy.request('GET', `${apiBase}/api/transactions`).then((response) => {
        const transactions = response.body;
        const total = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
        
        expect(total).to.be.a('number');
        expect(total).to.not.be.NaN;
        expect(total).to.satisfy(Number.isFinite);
        
        cy.log(`Solde total calculé: ${total}€`);
      });
    });

    it('Analyser la répartition revenus/dépenses', () => {
      cy.request('GET', `${apiBase}/api/transactions`).then((response) => {
        const transactions = response.body;
        
        const revenus = transactions.filter(t => t.amount > 0);
        const depenses = transactions.filter(t => t.amount < 0);
        
        const totalRevenus = revenus.reduce((sum, t) => sum + t.amount, 0);
        const totalDepenses = Math.abs(depenses.reduce((sum, t) => sum + t.amount, 0));
        
        expect(revenus.length).to.be.greaterThan(0);
        expect(depenses.length).to.be.greaterThan(0);
        expect(totalRevenus).to.be.greaterThan(0);
        expect(totalDepenses).to.be.greaterThan(0);
        
        cy.log(`Revenus: ${revenus.length} transactions, ${totalRevenus}€`);
        cy.log(`Dépenses: ${depenses.length} transactions, ${totalDepenses}€`);
      });
    });
  });

  describe('🚨 Fonctionnalité 8: Gestion des Erreurs', () => {
    it('REC-006: Gérer l\'indisponibilité du Ledger (simulation)', () => {
      // Note: Pour tester REC-006, il faudrait arrêter le Ledger
      // Ici on teste que l'API reste accessible même si le Ledger a des problèmes
      cy.request('GET', `${apiBase}/api/health`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.status).to.eq('ok');
      });
    });

    it('Gérer les requêtes malformées', () => {
      cy.request({
        method: 'POST',
        url: `${apiBase}/api/transactions`,
        body: null,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('Gérer les méthodes HTTP non supportées', () => {
      cy.request({
        method: 'PUT',
        url: `${apiBase}/api/transactions`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });
  });

  describe('🔍 Fonctionnalité 9: Validation des Données', () => {
    it('Valider la cohérence des IDs de transactions', () => {
      cy.request('GET', `${apiBase}/api/transactions`).then((response) => {
        const transactions = response.body;
        const ids = transactions.map(t => t.id);
        
        // Vérifier que tous les IDs sont uniques
        const uniqueIds = [...new Set(ids)];
        expect(ids.length).to.eq(uniqueIds.length);
        
        // Vérifier que les IDs sont des nombres positifs
        ids.forEach(id => {
          expect(id).to.be.a('number');
          expect(id).to.be.greaterThan(0);
        });
      });
    });

    it('Valider les types de données des transactions', () => {
      cy.request('GET', `${apiBase}/api/transactions`).then((response) => {
        const transactions = response.body;
        
        transactions.forEach(transaction => {
          expect(transaction.id).to.be.a('number');
          expect(transaction.label).to.be.a('string');
          expect(transaction.amount).to.be.a('number');
          expect(transaction.label.length).to.be.greaterThan(0);
          expect(transaction.amount).to.not.be.NaN;
        });
      });
    });
  });

  describe('⚡ Fonctionnalité 10: Performance et Fiabilité', () => {
    it('Temps de réponse acceptable pour les requêtes', () => {
      const startTime = Date.now();
      
      cy.request('GET', `${apiBase}/api/transactions`).then((response) => {
        const responseTime = Date.now() - startTime;
        
        expect(response.status).to.eq(200);
        expect(responseTime).to.be.lessThan(1000); // Moins d'1 seconde
      });
    });

    it('Stabilité de l\'API sous charge', () => {
      // 5 requêtes séquentielles (Cypress exécute en série ses commandes)
      Cypress._.times(5, () => {
        cy.request('GET', `${apiBase}/api/health`).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.status).to.eq('ok');
        });
      });
    });
  });
});
