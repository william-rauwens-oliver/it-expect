const request = require('supertest');
const app = require('./app');

describe('API integration', () => {
  it('GET /api/health -> 200 ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/transactions -> liste', async () => {
    const res = await request(app).get('/api/transactions');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/transactions -> crée une transaction', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .send({ label: 'Test', amount: 100 });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ label: 'Test', amount: 100 });
  });
});
