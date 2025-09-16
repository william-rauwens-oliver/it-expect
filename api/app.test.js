const request = require('supertest');
const app = require('./app');

jest.mock('node-fetch', () => jest.fn());
const fetch = require('node-fetch');

describe('API integration', () => {
  beforeEach(() => jest.resetAllMocks());

  it('GET /api/health -> 200 ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('POST /api/transactions appelle ledger et approuve', async () => {
    fetch.mockResolvedValue({ json: async () => ({ approved: true }) });
    const res = await request(app)
      .post('/api/transactions')
      .send({ label: 'Test', amount: 100 });
    expect(fetch).toHaveBeenCalled();
    expect(res.status).toBe(201);
  });

  it('POST /api/transactions refuse si ledger non approuve', async () => {
    fetch.mockResolvedValue({ json: async () => ({ approved: false, reason: 'zero_amount' }) });
    const res = await request(app)
      .post('/api/transactions')
      .send({ label: 'Zero', amount: 0 });
    expect(res.status).toBe(422);
    expect(res.body.error).toBe('not_approved');
  });

  it('POST /api/transactions retourne 400 si payload invalide', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .send({ label: 123, amount: 'oops' });
    expect(res.status).toBe(400);
  });

  it('POST /api/transactions -> 502 si ledger unreachable', async () => {
    fetch.mockRejectedValue(new Error('down'));
    const res = await request(app)
      .post('/api/transactions')
      .send({ label: 'X', amount: 1 });
    expect(res.status).toBe(502);
    expect(res.body.error).toBe('ledger_unreachable');
  });
});
