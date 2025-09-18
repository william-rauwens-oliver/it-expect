describe('Front-end Finance Flow - Interface utilisateur', () => {
  const apiBase = 'http://127.0.0.1:4000';

  it('teste l\'interface utilisateur - ajout d\'un revenu', () => {
    // Test avec l'interface utilisateur réelle
    cy.visit(`${apiBase}/public/form.html`);
    
    // Simule les actions utilisateur
    cy.get('#label').should('be.visible').clear().type('Salaire Front-end');
    cy.get('#amount').should('be.visible').clear().type('2500');
    cy.contains('button', 'Envoyer').should('be.visible').click();
    
    // Vérifie le résultat dans l'interface
    cy.get('#result').should('be.visible').and('contain.text', 'OK: Salaire Front-end');
  });

  it('teste l\'interface utilisateur - ajout d\'une dépense', () => {
    cy.visit(`${apiBase}/public/form.html`);
    
    // Test d'une dépense avec montant négatif
    cy.get('#label').clear().type('Courses');
    cy.get('#amount').clear().type('-150');
    cy.contains('button', 'Envoyer').click();
    
    // Vérifie que l'interface affiche le bon résultat
    cy.get('#result').should('contain.text', 'OK: Courses');
  });

  it('teste l\'interface utilisateur - gestion d\'erreur montant nul', () => {
    cy.visit(`${apiBase}/public/form.html`);
    
    // Test d'erreur avec montant nul
    cy.get('#label').clear().type('Test Erreur');
    cy.get('#amount').clear().type('0');
    cy.contains('button', 'Envoyer').click();
    
    // Vérifie que l'interface affiche l'erreur
    cy.get('#result').should('contain.text', 'zero_amount');
  });

  it('teste l\'interface utilisateur - validation des champs', () => {
    cy.visit(`${apiBase}/public/form.html`);
    
    // Vérifie que tous les éléments de l'interface sont présents
    cy.get('h1').should('contain.text', 'Nouvelle transaction');
    cy.get('#label').should('have.attr', 'name', 'label');
    cy.get('#amount').should('have.attr', 'type', 'number');
    cy.contains('button', 'Envoyer').should('have.attr', 'type', 'submit');
    cy.get('#result').should('exist');
  });
});
