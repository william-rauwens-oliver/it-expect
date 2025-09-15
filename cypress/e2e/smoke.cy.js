describe('Smoke - Chargement de l\'app', () => {
  it('charge la page d\'accueil avec le root présent', () => {
    cy.visit('/');
    cy.title().should('include', 'React App');
    cy.get('#root').should('exist');
  });
});
