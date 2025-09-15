# Types de tests et critères

Tests unitaires
- Petites unités de code, rapides, isolés.
- Outils: Jest, @testing-library/*.

Tests d’intégration
- Modules assemblés, mocks pour I/O externes.

Tests end-to-end (E2E)
- Parcours utilisateur bout en bout.
- Outil: Cypress.

Critères d’acceptation
- Tests unitaires/integ critiques au vert.
- Parcours E2E critiques passent en local et CI.
