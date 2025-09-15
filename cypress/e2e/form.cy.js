describe('Formulaire UI - création transaction via API', () => {
  it('remplit et soumet le formulaire', () => {
    cy.visit('http://127.0.0.1:4000/public/form.html');
    cy.get('#label').type('UI Achat');
    cy.get('#amount').type('-15');
    cy.contains('Envoyer').click();
    cy.get('#result').should('contain.text', 'UI Achat');
  });
});
