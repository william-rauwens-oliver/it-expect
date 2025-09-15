const express = require('express');
const app = express();
app.use(express.json());

app.post('/validate', (req, res) => {
  const { label, amount } = req.body || {};
  if (typeof label !== 'string' || typeof amount !== 'number') {
    return res.status(400).json({ approved: false, reason: 'invalid_payload' });
  }
  if (amount === 0) {
    return res.json({ approved: false, reason: 'zero_amount' });
  }
  return res.json({ approved: true });
});

module.exports = app;
