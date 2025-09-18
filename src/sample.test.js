describe('Échantillon (basics utiles)', () => {
  test('addition simple', () => {
    expect(1 + 1).toBe(2);
  });

  test('valeurs truthy/falsy', () => {
    expect(true).toBeTruthy();
    expect(0).toBeFalsy();
    expect('').toBeFalsy();
  });

  test('array contains item', () => {
    expect(['a', 'b', 'c']).toContain('b');
  });

  test('objet correspond partiellement', () => {
    const obj = { id: 1, label: 'Test', amount: 100 };
    expect(obj).toEqual(expect.objectContaining({ label: 'Test' }));
  });
});
