module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '<rootDir>/api/**/*.test.js',
    '<rootDir>/ledger/**/*.test.js',
    '<rootDir>/src/**/*.test.js'
  ]
};
