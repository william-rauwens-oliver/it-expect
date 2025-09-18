# Stratégie de test

Objectif: garantir la qualité fonctionnelle, la non-régression et la robustesse de l’application Finance Flow via une pyramide de tests.

## Pyramide de tests
- Tests unitaires (majoritaires): valider les unités de code (ex: `ledger/app.js` route `/validate`, utilitaires `src/utils/math.js`).
- Tests d’intégration: vérifier l’interaction entre modules (ex: `api/app.js` qui contacte le Ledger avec `node-fetch`).
- Tests end-to-end (E2E): valider les parcours critiques utilisateur/app (ex: ajout réel d’une transaction avec Ledger opérationnel, Cypress UI si front utilisé).

## Portée et priorités (basée sur le cahier de recettes)
- REC-001 Healthcheck API → Test intégration (Jest) + E2E minimal.
- REC-002 Liste des transactions → Test intégration (Jest) + E2E.
- REC-003 Ajout approuvé → Unit Ledger + Intégration API (mock) + E2E réel.
- REC-004 Refus montant nul → Unit Ledger + Intégration API (mock) + E2E.
- REC-005 Payload invalide → Unit Ledger + Intégration API.
- REC-006 Ledger indisponible → Intégration API (rejet fetch) + E2E négatif.

## Priorisation des tests
- Critiques (P0): REC-003 (ajout), REC-004 (refus), REC-006 (panne ledger)
- Importants (P1): REC-001 (health), REC-002 (liste)
- Normaux (P2): REC-005 (payload invalide)

## Cycle de vie des tests
1. Rédaction cas (cahier de recettes)
2. Implémentation tests unitaires (fondations)
3. Implémentation tests d’intégration (mocks)
4. Implémentation tests E2E (environnement proche prod)
5. Exécution, analyse, correction, re-exécution (boucle)
6. Rapports et critères de sortie

## Analyse des risques (AMDEC simplifiée)
| Risque | Effet | Probabilité | Gravité | Mitigation |
|---|---|---|---|---|
| Ledger indisponible | Blocage création | Moyenne | Haute | Test REC-006, timeouts, messages 502 |
| Payload invalide | Erreurs 500 | Basse | Moyenne | Validation input, test REC-005 |
| Régression API | Parcours cassés | Moyenne | Haute | CI, suites smoke et intégration |

## Critères d’acceptation génériques
- Tous les cas REC-001 → REC-006 passent en local.
- Couverture unitaire ≥ 60% sur cibles: `ledger/app.js`, `src/utils/math.js`.
- Aucun test rouge sur CI.

## Outils
- Unit/Integration: Jest + Supertest.
- E2E: Cypress et/ou Jest HTTP contre services démarrés.

## Environnements
- Local: API `:4000`, Ledger `:5000`. Front (optionnel) via build CRA.
- CI: exécution headless des tests unitaires, intégration et Cypress.

## Données de test
- Mocks pour `node-fetch` côté `api/app.test.js`.
- Données simples JSON pour Cypress via `fixtures/` si nécessaire.


