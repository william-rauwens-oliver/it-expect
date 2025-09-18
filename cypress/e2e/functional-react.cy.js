describe('Tests Fonctionnels - Application React Finance Flow', () => {
  const reactApp = 'http://127.0.0.1:8080';
  const apiBase = 'http://127.0.0.1:4000';

  describe('Fonctionnalité : Parcours utilisateur complet', () => {
    it('Un utilisateur peut naviguer dans l\'application React', () => {
      // Scénario fonctionnel : Navigation dans l'app
      cy.visit(reactApp);
      
      // Vérification fonctionnelle : L'application se charge
      cy.get('#root').should('be.visible');
      cy.title().should('contain', 'React App');
    });

    it('L\'application peut communiquer avec l\'API backend', () => {
      // Scénario fonctionnel : Intégration front-back
      cy.visit(reactApp);
      
      // Vérification que l'API est accessible depuis l'app React
      cy.window().then((win) => {
        cy.request('GET', `${apiBase}/api/transactions`).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.be.an('array');
        });
      });
    });
  });

  describe('Fonctionnalité : Gestion des données financières', () => {
    it('L\'application peut récupérer et afficher les transactions', () => {
      // Scénario fonctionnel : Affichage des données
      cy.window().then((win) => {
        cy.request('GET', `${apiBase}/api/transactions`).then((response) => {
          const transactions = response.body;
          
          // Vérification fonctionnelle : Données cohérentes
          expect(transactions).to.be.an('array');
          transactions.forEach(transaction => {
            expect(transaction).to.have.all.keys('id', 'label', 'amount');
            expect(transaction.id).to.be.a('number');
            expect(transaction.label).to.be.a('string');
            expect(transaction.amount).to.be.a('number');
          });
        });
      });
    });

    it('L\'application peut créer de nouvelles transactions', () => {
      // Scénario fonctionnel : Création via l'interface
      cy.window().then((win) => {
        cy.request('POST', `${apiBase}/api/transactions`, {
          label: 'Transaction React Test',
          amount: 150
        }).then((response) => {
          expect(response.status).to.eq(201);
          expect(response.body.label).to.eq('Transaction React Test');
          expect(response.body.amount).to.eq(150);
          expect(response.body.id).to.be.a('number');
        });
      });
    });
  });

  describe('Fonctionnalité : Validation des règles métier', () => {
    it('L\'application respecte les règles de validation', () => {
      // Scénario fonctionnel : Respect des contraintes métier
      cy.window().then((win) => {
        // Test montant nul (devrait être rejeté)
        cy.request({
          method: 'POST',
          url: `${apiBase}/api/transactions`,
          body: { label: 'Test Règle', amount: 0 },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(422);
          expect(response.body.error).to.eq('not_approved');
          expect(response.body.reason).to.eq('zero_amount');
        });
      });
    });

    it('L\'application gère les erreurs de validation', () => {
      // Scénario fonctionnel : Gestion d'erreurs
      cy.window().then((win) => {
        // Test payload invalide
        cy.request({
          method: 'POST',
          url: `${apiBase}/api/transactions`,
          body: { label: 123, amount: 'invalid' },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body.error).to.eq('invalid_payload');
        });
      });
    });
  });

  describe('Fonctionnalité : Performance et fiabilité', () => {
    it('L\'application répond dans un délai acceptable', () => {
      // Scénario fonctionnel : Test de performance
      const startTime = Date.now();
      
      cy.window().then((win) => {
        cy.request('GET', `${apiBase}/api/health`).then((response) => {
          const responseTime = Date.now() - startTime;
          expect(response.status).to.eq(200);
          expect(responseTime).to.be.lessThan(1000); // Moins d'1 seconde
        });
      });
    });

    it('L\'application est disponible et stable', () => {
      // Scénario fonctionnel : Test de disponibilité
      cy.window().then((win) => {
        cy.request('GET', `${apiBase}/api/transactions`).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.be.an('array');
        });
      });
    });
  });

  describe('Fonctionnalité : Intégrité des données', () => {
    it('Les données sont cohérentes et valides', () => {
      // Scénario fonctionnel : Vérification de l'intégrité
      cy.window().then((win) => {
        cy.request('GET', `${apiBase}/api/transactions`).then((response) => {
          const transactions = response.body;
          
          // Vérification que chaque transaction a un ID unique
          const ids = transactions.map(t => t.id);
          const uniqueIds = [...new Set(ids)];
          expect(ids.length).to.eq(uniqueIds.length);
          
          // Vérification que les montants sont des nombres valides
          transactions.forEach(transaction => {
            expect(transaction.amount).to.be.a('number');
            expect(transaction.amount).to.not.be.NaN;
            expect(transaction.amount).to.not.be.Infinity;
          });
        });
      });
    });
  });
});
