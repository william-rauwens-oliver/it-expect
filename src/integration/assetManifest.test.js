const fs = require('fs');
const path = require('path');

test('asset-manifest contient les entrées principales', () => {
  const manifestPath = path.join(__dirname, '../../build/asset-manifest.json');
  const raw = fs.readFileSync(manifestPath, 'utf-8');
  const manifest = JSON.parse(raw);
  expect(manifest.files['main.js'] || manifest.files['static/js/main.b82f7fcc.js']).toBeTruthy();
  expect(manifest.files['main.css'] || manifest.files['static/css/main.228a68de.css']).toBeTruthy();
});
