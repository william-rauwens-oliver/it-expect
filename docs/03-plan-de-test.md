# Plan de test

Objectif
- Définir les suites de tests, leurs périmètres et priorités.

Couverture cible
- Unitaire: utilitaires/composants purs (si code source disponible) ≥ 60% lignes.
- Intégration: interactions module + API mockée sur écrans clés.
- E2E: parcours critiques (chargement app, navigation, affichage listes/détails).

Matrice (exemple)
- Smoke: app se charge sans erreur.
- Navigation: liens principaux fonctionnent.
- Détails: une page de détail s’affiche (si dispo).

Exécution
- Local: `npm test` (unit/int), `npm run test:e2e`.
- CI: headless, génération de rapports.

Critères de sortie
- 0 test rouge sur suites smoke/critique.
