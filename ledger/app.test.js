const request = require('supertest');
const app = require('./app');

describe('Ledger /validate', () => {
  test('approuve un payload valide non nul', async () => {
    const res = await request(app)
      .post('/validate')
      .send({ label: 'Salaire', amount: 100 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ approved: true });
  });

  test('rejette payload invalide (types)', async () => {
    const res = await request(app)
      .post('/validate')
      .send({ label: 123, amount: 'oops' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ approved: false, reason: 'invalid_payload' });
  });

  test('rejette montant nul', async () => {
    const res = await request(app)
      .post('/validate')
      .send({ label: 'Zero', amount: 0 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ approved: false, reason: 'zero_amount' });
  });

  test('rejette payload manquant', async () => {
    const res = await request(app)
      .post('/validate')
      .send(null);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ approved: false, reason: 'invalid_payload' });
  });
});
