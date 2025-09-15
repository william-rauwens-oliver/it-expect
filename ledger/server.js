const app = require('./app');
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Ledger listening on http://0.0.0.0:${port}`);
});
