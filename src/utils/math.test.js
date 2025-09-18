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

// Tests supplémentaires

test('sum gère les nombres négatifs', () => {
  expect(sum(-5, 2)).toBe(-3);
});

test('average gère décimaux et négatifs', () => {
  expect(average([-1, 0.5, 2.5])).toBeCloseTo(0.6666667, 6);
});

test('average gère grands tableaux', () => {
  const arr = Array.from({ length: 1000 }, (_, i) => i + 1); // 1..1000
  const avg = average(arr);
  expect(avg).toBeCloseTo(500.5, 10);
});
