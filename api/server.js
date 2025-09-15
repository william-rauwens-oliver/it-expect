const app = require('./app');
const path = require('path');

app.use('/public', require('express').static(path.join(__dirname, 'public')));

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API listening on http://0.0.0.0:${port}`);
});
