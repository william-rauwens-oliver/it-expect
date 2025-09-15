function sum(a, b) {
  return a + b;
}

function average(numbers) {
  if (!Array.isArray(numbers) || numbers.length === 0) return 0;
  const total = numbers.reduce((acc, n) => acc + n, 0);
  return total / numbers.length;
}

module.exports = { sum, average };
