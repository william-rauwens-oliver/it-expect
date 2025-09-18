# Cahier de recettes

Contexte
- Application API sur `http://127.0.0.1:4000`
- Service Ledger sur `http://127.0.0.1:5000`
- Front (build CRA) servi localement, non requis pour les recettes API

Pré-requis généraux
- Services démarrés si scénario E2E: `npm run test:e2e:full` (ou lancer ledger et api)

Cas de test (tableau)

| ID | Fonctionnalité | Préconditions | Étapes | Résultat attendu |
|---|---|---|---|---|
| REC-001 | Healthcheck API | API démarrée | Requêter `GET /api/health` | 200, body `{ status: 'ok' }` |
| REC-002 | Lister transactions | API démarrée | Requêter `GET /api/transactions` | 200, JSON tableau avec objets `{ id,label,amount }` |
| REC-003 | Ajouter transaction approuvée | API et Ledger démarrés; payload valide | `POST /api/transactions` body `{ label:'Salaire', amount:100 }` | 201, JSON avec `{ id,label,amount }`; Ledger appelé; item ajouté |
| REC-004 | Refus ledger: montant nul | API et Ledger démarrés | `POST /api/transactions` body `{ label:'Zero', amount:0 }` | 422, `{ error:'not_approved', reason:'zero_amount' }` |
| REC-005 | Payload invalide | API seule | `POST /api/transactions` body `{ label:123, amount:'oops' }` | 400, `{ error:'invalid_payload' }` |
| REC-006 | Ledger indisponible | API démarrée, Ledger down | `POST /api/transactions` body `{ label:'X', amount:1 }` | 502, `{ error:'ledger_unreachable' }` |

Notes
- Les endpoints ci-dessus proviennent de `api/app.js` et `ledger/app.js`.
- Les tests automatisés correspondants sont dans Jest (unitaires/fonctionnels) et Cypress (E2E).
