const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;
const buildPath = path.join(__dirname, '..', 'build');

app.use(express.static(buildPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Web server serving build at http://127.0.0.1:${port}`);
});


