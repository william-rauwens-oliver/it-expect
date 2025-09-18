# Plan de test

Objectif
- Définir les suites de tests, leurs périmètres et priorités.

Couverture cible
- Unitaire: utilitaires/composants purs (si code source disponible) ≥ 60% lignes.
- Intégration: interactions module + API mockée sur écrans clés.
- E2E: parcours critiques (chargement app, navigation, affichage listes/détails).

Matrice de correspondance (Cahier → Fichiers tests)
- REC-001 Healthcheck API → `api/app.test.js` (GET /api/health)
- REC-002 Liste transactions → `api/app.test.js` (GET /api/transactions) + `src/integration/e2e.flow.test.js`
- REC-003 Ajout approuvé → `ledger/app.test.js`, `api/app.test.js` (mock fetch approved), `src/integration/e2e.flow.test.js`
- REC-004 Refus montant nul → `ledger/app.test.js`, `api/app.test.js` (mock approved:false)
- REC-005 Payload invalide → `ledger/app.test.js`, `api/app.test.js`
- REC-006 Ledger indisponible → `api/app.test.js` (fetch rejeté)

Planification hebdomadaire (exemple)

| Semaine | Lundi | Mardi | Mercredi | Jeudi | Vendredi |
|---|---|---|---|---|---|
| 1 | Préparer envs | Rédiger cas de test | Revue cas | Exécuter unitaires | Exécuter unitaires |
| 2 | Intégration | Intégration | Analyse résultats | Corrections | Revue corrections |
| 3 | Régressions | Régressions | Performance | Performance | Analyse résultats |
| 4 | Sécurité | Sécurité | Préparer rapport | Revue rapport | Livrer rapport |

Critères de sortie
- Taux de réussite: ≥ 95% des tests basiques; 100% des tests critiques verts.
- Performance (si mesurée): pages < 2s sous charge normale.
- Aucune régression critique ouverte.

Exécution
- Local Unit/Int: `npm test`
- E2E (headless): `npm run test:e2e`
- E2E (services + run): `npm run test:e2e:full`
