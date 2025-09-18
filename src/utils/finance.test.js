const { sum, average } = require('./math');

describe('Finance utils (unit)', () => {
  test('sum addition avec positifs et négatifs', () => {
    expect(sum(2500, -800)).toBe(1700);
    expect(sum(-150, -50)).toBe(-200);
  });

  test('average gère tableau vide et valeurs', () => {
    expect(average([])).toBe(0);
    expect(average([100, 200, 300])).toBe(200);
  });

  test('average gère décimales (tolérance)', () => {
    const val = average([0.1, 0.2, 0.3]);
    expect(Math.round(val * 100) / 100).toBe(0.2);
  });

  test('sum est commutative', () => {
    expect(sum(5, 7)).toBe(sum(7, 5));
  });

  test('average d\'un singleton renvoie la valeur', () => {
    expect(average([42])).toBe(42);
  });
});


