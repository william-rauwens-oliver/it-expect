const { sum, average } = require('./math');

test('sum additionne correctement', () => {
  expect(sum(2, 3)).toBe(5);
});

test('average calcule la moyenne', () => {
  expect(average([2, 4, 6])).toBe(4);
});

test('average retourne 0 pour tableau vide', () => {
  expect(average([])).toBe(0);
});
