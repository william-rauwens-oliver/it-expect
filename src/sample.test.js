test('addition simple', () => {
  expect(1 + 1).toBe(2);
});

test('truthiness', () => {
  expect(true).toBeTruthy();
});

test('array contains item', () => {
  expect(['a', 'b', 'c']).toContain('b');
});
