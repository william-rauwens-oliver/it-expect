const http = require('http');
const fetch = require('node-fetch');
const apiApp = require('../../api/app');
const ledgerApp = require('../../ledger/app');

let apiServer;
let ledgerServer;
let ledgerPort;
let apiPort;

jest.setTimeout(20000);

beforeAll((done) => {
  ledgerServer = http.createServer(ledgerApp);
  ledgerServer.listen(0, () => {
    const addr = ledgerServer.address();
    ledgerPort = typeof addr === 'object' ? addr.port : 5000;
    process.env.LEDGER_URL = `http://127.0.0.1:${ledgerPort}/validate`;

    apiServer = http.createServer(apiApp);
    apiServer.listen(0, () => {
      const a = apiServer.address();
      apiPort = typeof a === 'object' ? a.port : 4000;
      done();
    });
  });
});

afterAll((done) => {
  const closeApi = (cb) => (apiServer ? apiServer.close(cb) : cb());
  const closeLedger = (cb) => (ledgerServer ? ledgerServer.close(cb) : cb());
  closeApi(() => closeLedger(done));
});

test('E2E: ajout transaction approuvée via ledger réel', async () => {
  const baseUrl = `http://127.0.0.1:${apiPort}`;
  const res = await fetch(`${baseUrl}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label: 'Prime', amount: 200 })
  });
  expect(res.status).toBe(201);
  const body = await res.json();
  expect(body).toMatchObject({ label: 'Prime', amount: 200 });

  const list = await fetch(`${baseUrl}/api/transactions`);
  expect(list.status).toBe(200);
  const arr = await list.json();
  expect(arr.some(t => t.label === 'Prime' && t.amount === 200)).toBe(true);
});
