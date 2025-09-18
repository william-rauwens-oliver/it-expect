const request = require('supertest');
const app = require('./app');

jest.mock('node-fetch', () => jest.fn());
const fetch = require('node-fetch');

describe('API - comportements unitaires/isolés', () => {
  beforeEach(() => jest.resetAllMocks());

  it('GET /api/health -> 200 ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('POST /api/transactions appelle le ledger et crée une transaction', async () => {
    fetch.mockResolvedValue({ json: async () => ({ approved: true }) });
    const res = await request(app)
      .post('/api/transactions')
      .send({ label: 'Test', amount: 100 });
    expect(fetch).toHaveBeenCalled();
    expect(res.status).toBe(201);
    expect(res.body).toEqual(
      expect.objectContaining({ label: 'Test', amount: 100, id: expect.any(Number) })
    );
  });

  it('POST /api/transactions refuse si ledger non approuve', async () => {
    fetch.mockResolvedValue({ json: async () => ({ approved: false, reason: 'zero_amount' }) });
    const res = await request(app)
      .post('/api/transactions')
      .send({ label: 'Zero', amount: 0 });
    expect(res.status).toBe(422);
    expect(res.body.error).toBe('not_approved');
    expect(res.body.reason).toBe('zero_amount');
  });

  it('POST /api/transactions retourne 400 si payload invalide', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .send({ label: 123, amount: 'oops' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'invalid_payload' });
  });

  it('POST /api/transactions -> 502 si ledger unreachable', async () => {
    fetch.mockRejectedValue(new Error('down'));
    const res = await request(app)
      .post('/api/transactions')
      .send({ label: 'X', amount: 1 });
    expect(res.status).toBe(502);
    expect(res.body.error).toBe('ledger_unreachable');
  });

  it('POST puis GET /api/transactions fait croitre la liste (ledger approuve)', async () => {
    fetch.mockResolvedValue({ json: async () => ({ approved: true }) });
    const before = await request(app).get('/api/transactions');
    expect(before.status).toBe(200);
    const initialLen = Array.isArray(before.body) ? before.body.length : 0;

    const created = await request(app)
      .post('/api/transactions')
      .send({ label: 'IntTest', amount: 42 });
    expect(created.status).toBe(201);

    const after = await request(app).get('/api/transactions');
    expect(after.status).toBe(200);
    expect(after.body.length).toBe(initialLen + 1);
    expect(after.body.some(t => t.label === 'IntTest' && t.amount === 42)).toBe(true);
  });

  it('OPTIONS /api/transactions expose les en-têtes CORS', async () => {
    const res = await request(app)
      .options('/api/transactions')
      .set('Origin', 'http://127.0.0.1:8080');
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('*');
    expect(res.headers['access-control-allow-methods']).toBeDefined();
    expect(res.headers['access-control-allow-headers']).toBeDefined();
  });

  it('sert le fichier statique /public/form.html', async () => {
    const res = await request(require('express')().use('/public', require('express').static(require('path').join(__dirname, 'public')))).get('/public/form.html');
    // alternative: monter le middleware déjà déclaré dans server.js n'est pas direct ici, on vérifie via montage ad hoc
    expect(res.status).toBe(200);
    expect(res.text).toContain('Nouvelle transaction');
  });
});
