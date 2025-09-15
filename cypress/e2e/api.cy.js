describe('API Mock - disponibilité', () => {
  it('GET /api/health renvoie ok (via nginx proxy)', () => {
    cy.request('http://127.0.0.1:5173/api/health').its('status').should('eq', 200);
  });
});
