# Types de tests

## Unitaires
- Objectif: valider une unité de code isolée.
- Outils: Jest.
- Exemples: `ledger/app.test.js`, `src/utils/math.test.js`.

## Fonctionnels
- Objectif: vérifier les fonctionnalités métiers via l’API (interaction modules/services).
- Outils: Jest + Supertest, mocks.
- Exemples: `api/app.test.js` (mock `node-fetch`).

## End to End (E2E)
- Objectif: valider un parcours de bout en bout (proche prod).
- Outils: Cypress, ou Jest HTTP avec services démarrés.
- Exemples: `cypress/e2e/*.cy.js`.
