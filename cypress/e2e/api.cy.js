describe('API Mock - disponibilité', () => {
  it('GET /api/health renvoie ok (API directe)', () => {
    cy.request('http://127.0.0.1:4000/api/health').its('status').should('eq', 200);
  });
});
