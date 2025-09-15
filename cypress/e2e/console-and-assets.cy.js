describe('Qualité - console et assets', () => {
  it('aucune erreur console au chargement', () => {
    const errors = [];
    cy.on('window:before:load', (win) => {
      const originalError = win.console.error;
      win.console.error = function(...args) {
        errors.push(args.join(' '));
        // appeler l’original si besoin
        originalError && originalError.apply(win.console, args);
      };
    });
    cy.visit('/');
    cy.then(() => {
      expect(errors, `Erreurs console: ${errors.join('\n')}`).to.have.length(0);
    });
  });

  it('charge le root et les ressources principales', () => {
    cy.visit('/');
    cy.get('#root').should('exist');
    cy.window().then((win) => {
      const links = Array.from(win.document.querySelectorAll('link[rel="stylesheet"]'));
      const scripts = Array.from(win.document.querySelectorAll('script[src]'));
      expect(links.length).to.be.greaterThan(0);
      expect(scripts.length).to.be.greaterThan(0);
    });
  });
});
