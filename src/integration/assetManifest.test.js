const fs = require('fs');
const path = require('path');

test('asset-manifest contient les entrées principales', () => {
  const manifestPath = path.join(__dirname, '../../build/asset-manifest.json');
  const raw = fs.readFileSync(manifestPath, 'utf-8');
  const manifest = JSON.parse(raw);
  expect(manifest.files['main.js'] || manifest.files['static/js/main.b82f7fcc.js']).toBeTruthy();
  expect(manifest.files['main.css'] || manifest.files['static/css/main.228a68de.css']).toBeTruthy();
});

test('index.html existe dans le build', () => {
  const idx = path.join(__dirname, '../../build/index.html');
  expect(fs.existsSync(idx)).toBe(true);
});

test('manifest JSON est parsable', () => {
  const manifestPath = path.join(__dirname, '../../build/asset-manifest.json');
  expect(() => JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))).not.toThrow();
});
