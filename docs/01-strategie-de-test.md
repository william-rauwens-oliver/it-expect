# Stratégie de test

Objectif: garantir la qualité fonctionnelle, la non-régression et la robustesse de l’application Finance Flow via une pyramide de tests.

## Pyramide de tests
- Tests unitaires (large majorité): valider les unités de code (fonctions/utilitaires, composants purs).
- Tests d’intégration: vérifier l’interaction entre modules (requêtes API, routing, store si présent).
- Tests end-to-end (E2E): valider les parcours critiques utilisateur sur l’app servie.

## Portée et priorités
- Parcours critiques: chargement de l’app, navigation principale, affichage des tableaux/listes, création/édition d’objets financiers (si applicable).
- Stabilité des API: mock côté intégration, tests E2E contre environnement local.

## Critères d’acceptation génériques
- Tous les parcours critiques E2E passent en local.
- Couverture unitaire minimale (ex: >= 60%) sur utilitaires critiques si source accessible.
- Aucun test rouge sur CI.

## Outils
- Unit/Integration: Jest + React Testing Library.
- E2E: Cypress.

## Environnements
- Local: serveur statique sur 127.0.0.1:5173.
- CI: exécution headless des tests unitaires et Cypress.

## Données de test
- Mock d’API côté tests d’intégration.
- Fixtures Cypress pour jeux de données E2E.


