describe('Parcours métier - Transactions', () => {
  it('création de transaction et vérification de la liste', () => {
    cy.request('http://127.0.0.1:4000/api/transactions').then((res1) => {
      expect(res1.status).to.eq(200);
      const initialCount = res1.body.length;
      cy.request('POST', 'http://127.0.0.1:4000/api/transactions', { label: 'E2E Achat', amount: -42 }).then((res2) => {
        expect(res2.status).to.eq(201);
        cy.request('http://127.0.0.1:4000/api/transactions').then((res3) => {
          expect(res3.status).to.eq(200);
          expect(res3.body.length).to.eq(initialCount + 1);
        });
      });
    });
  });

  it('gestion d’erreur à la création (payload invalide)', () => {
    cy.request({
      method: 'POST',
      url: 'http://127.0.0.1:4000/api/transactions',
      body: { label: 123, amount: 'oops' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it('refus de ledger (montant zéro)', () => {
    cy.request({
      method: 'POST',
      url: 'http://127.0.0.1:4000/api/transactions',
      body: { label: 'Zero', amount: 0 },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([422, 502]);
    });
  });
});
