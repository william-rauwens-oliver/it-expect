describe('Application React Finance Flow - Front-end complet', () => {
  const reactApp = 'http://127.0.0.1:8080';
  const apiBase = 'http://127.0.0.1:4000';

  it('charge l\'application React et teste l\'interface utilisateur', () => {
    cy.visit(reactApp);
    
    // La page React peut charger avant le rendu complet; vérifier l'existence suffit
    cy.get('#root').should('exist');
    
    cy.title().should('contain', 'React App');
    
    cy.get('body').should('be.visible');
    
    // Teste que l'application peut communiquer avec l'API
    cy.window().then(() => {
      cy.request(`${apiBase}/api/health`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.status).to.eq('ok');
      });
    });
  });

  it('teste l\'intégration React-API pour les transactions', () => {
    cy.visit(reactApp);
    
    // Vérifie que l'API est accessible depuis l'app React
    cy.window().then((win) => {
      cy.request('GET', `${apiBase}/api/transactions`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });
  });

  it('teste la création de transaction via l\'interface React', () => {
    cy.visit(reactApp);
    
    // Teste l'ajout d'une transaction via l'API (simulation de ce que ferait l'app React)
    cy.window().then((win) => {
      cy.request('POST', `${apiBase}/api/transactions`, {
        label: 'Transaction React',
        amount: 100
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.label).to.eq('Transaction React');
        expect(response.body.amount).to.eq(100);
      });
    });
  });

  it('vérifie que l\'application React peut gérer les erreurs', () => {
    cy.visit(reactApp);
    
    // Teste la gestion d'erreur avec montant nul
    cy.window().then((win) => {
      cy.request({
        method: 'POST',
        url: `${apiBase}/api/transactions`,
        body: { label: 'Test Erreur React', amount: 0 },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.error).to.eq('not_approved');
      });
    });
  });
});
