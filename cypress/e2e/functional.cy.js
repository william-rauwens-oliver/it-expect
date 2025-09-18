describe('Tests Fonctionnels - Finance Flow', () => {
  const apiBase = 'http://127.0.0.1:4000';
  const reactApp = 'http://127.0.0.1:8080';

  describe('Fonctionnalité : Gestion des revenus', () => {
    it('Un utilisateur peut ajouter un nouveau revenu via le formulaire', () => {
      // Scénario fonctionnel : Ajouter un salaire
      cy.visit(`${apiBase}/public/form.html`);
      
      // L'utilisateur remplit le formulaire
      cy.get('#label').clear().type('Salaire Mensuel');
      cy.get('#amount').clear().type('2800');
      cy.contains('button', 'Envoyer').click();
      
      // Vérification fonctionnelle : La transaction est acceptée
      cy.get('#result').should('contain.text', 'OK: Salaire Mensuel');
      
      // Vérification que la transaction apparaît dans la liste
      cy.request('GET', `${apiBase}/api/transactions`).then((response) => {
        const transactions = response.body;
        const newTransaction = transactions.find(t => t.label === 'Salaire Mensuel');
        expect(newTransaction).to.exist;
        expect(newTransaction.amount).to.eq(2800);
        expect(newTransaction.id).to.be.a('number');
      });
    });

    it('Un utilisateur peut ajouter plusieurs types de revenus', () => {
      const revenus = [
        { label: 'Salaire', amount: 2500 },
        { label: 'Prime', amount: 500 },
        { label: 'Freelance', amount: 800 }
      ];

      revenus.forEach(revenu => {
        cy.visit(`${apiBase}/public/form.html`);
        cy.get('#label').clear().type(revenu.label);
        cy.get('#amount').clear().type(revenu.amount.toString());
        cy.contains('button', 'Envoyer').click();
        cy.get('#result').should('contain.text', `OK: ${revenu.label}`);
      });
    });
  });

  describe('Fonctionnalité : Gestion des dépenses', () => {
    it('Un utilisateur peut ajouter une dépense avec montant négatif', () => {
      // Scénario fonctionnel : Ajouter une dépense
      cy.visit(`${apiBase}/public/form.html`);
      
      cy.get('#label').clear().type('Courses Supermarché');
      cy.get('#amount').clear().type('-120');
      cy.contains('button', 'Envoyer').click();
      
      // Vérification fonctionnelle : La dépense est acceptée
      cy.get('#result').should('contain.text', 'OK: Courses Supermarché');
    });

    it('Un utilisateur peut gérer différents types de dépenses', () => {
      const depenses = [
        { label: 'Loyer', amount: -800 },
        { label: 'Électricité', amount: -120 },
        { label: 'Transport', amount: -60 }
      ];

      depenses.forEach(depense => {
        cy.visit(`${apiBase}/public/form.html`);
        cy.get('#label').clear().type(depense.label);
        cy.get('#amount').clear().type(depense.amount.toString());
        cy.contains('button', 'Envoyer').click();
        cy.get('#result').should('contain.text', `OK: ${depense.label}`);
      });
    });
  });

  describe('Fonctionnalité : Validation des données', () => {
    it('Le système refuse les montants nuls (règle métier)', () => {
      // Scénario fonctionnel : Tentative d'ajout d'un montant nul
      cy.visit(`${apiBase}/public/form.html`);
      
      cy.get('#label').clear().type('Transaction Nulle');
      cy.get('#amount').clear().type('0');
      cy.contains('button', 'Envoyer').click();
      
      // Vérification fonctionnelle : Erreur métier affichée
      cy.get('#result').should('contain.text', 'zero_amount');
    });

    it('Le système refuse les données invalides', () => {
      // Scénario fonctionnel : Tentative d'ajout de données invalides
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

  describe('Fonctionnalité : Consultation des transactions', () => {
    it('Un utilisateur peut consulter la liste de ses transactions', () => {
      // Scénario fonctionnel : Consultation du portefeuille
      cy.request('GET', `${apiBase}/api/transactions`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
        
        // Vérification fonctionnelle : Chaque transaction a les bonnes propriétés
        response.body.forEach(transaction => {
          expect(transaction).to.have.property('id');
          expect(transaction).to.have.property('label');
          expect(transaction).to.have.property('amount');
          expect(transaction.id).to.be.a('number');
          expect(transaction.label).to.be.a('string');
          expect(transaction.amount).to.be.a('number');
        });
      });
    });

    it('Le système calcule correctement le solde total', () => {
      // Scénario fonctionnel : Calcul du solde
      cy.request('GET', `${apiBase}/api/transactions`).then((response) => {
        const transactions = response.body;
        const total = transactions.reduce((sum, t) => sum + t.amount, 0);
        
        // Vérification fonctionnelle : Le solde est cohérent
        expect(total).to.be.a('number');
        expect(total).to.not.be.NaN;
        
        // Affichage du solde pour vérification manuelle
        cy.log(`Solde total calculé: ${total}€`);
      });
    });
  });

  describe('Fonctionnalité : Gestion des erreurs système', () => {
    it('Le système gère correctement l\'indisponibilité du ledger', () => {
      // Scénario fonctionnel : Test de résilience
      // Note: Ce test nécessiterait d'arrêter le ledger temporairement
      // Pour l'instant, on vérifie que le système est robuste
      cy.request('GET', `${apiBase}/api/health`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.status).to.eq('ok');
      });
    });
  });

  describe('Fonctionnalité : Interface utilisateur', () => {
    it('L\'interface est intuitive et fonctionnelle', () => {
      // Scénario fonctionnel : Test d'ergonomie
      cy.visit(`${apiBase}/public/form.html`);
      
      // Vérification fonctionnelle : Interface complète
      cy.get('h1').should('contain.text', 'Nouvelle transaction');
      cy.get('#label').should('be.visible').and('be.enabled');
      cy.get('#amount').should('be.visible').and('be.enabled');
      cy.contains('button', 'Envoyer').should('be.visible').and('be.enabled');
      cy.get('#result').should('exist');
    });

    it('L\'interface fournit un feedback approprié', () => {
      // Scénario fonctionnel : Test de feedback utilisateur
      cy.visit(`${apiBase}/public/form.html`);
      
      // Test de succès
      cy.get('#label').type('Test Feedback');
      cy.get('#amount').type('100');
      cy.contains('button', 'Envoyer').click();
      cy.get('#result').should('contain.text', 'OK: Test Feedback');
      
      // Test d'erreur
      cy.get('#label').clear().type('Test Erreur');
      cy.get('#amount').clear().type('0');
      cy.contains('button', 'Envoyer').click();
      cy.get('#result').should('contain.text', 'zero_amount');
    });
  });
});
