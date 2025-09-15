const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

const transactions = [
  { id: 1, label: 'Salaire', amount: 2500 },
  { id: 2, label: 'Loyer', amount: -900 }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/transactions', (req, res) => {
  res.json(transactions);
});

app.post('/api/transactions', async (req, res) => {
  const { label, amount } = req.body || {};
  if (typeof label !== 'string' || typeof amount !== 'number') {
    return res.status(400).json({ error: 'invalid_payload' });
  }
  try {
    const r = await fetch(process.env.LEDGER_URL || 'http://127.0.0.1:5000/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label, amount })
    });
    const verdict = await r.json();
    if (!verdict.approved) {
      return res.status(422).json({ error: 'not_approved', reason: verdict.reason || 'unknown' });
    }
  } catch (e) {
    return res.status(502).json({ error: 'ledger_unreachable' });
  }
  const id = transactions.length ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
  const tx = { id, label, amount };
  transactions.push(tx);
  res.status(201).json(tx);
});

module.exports = app;
