module.exports = {
  testMatch: ['**/tests/**/*.test.js'],

  setupFilesAfterEnv: ['./tests/setup.js'],

  collectCoverage: true,
  coverageDirectory: 'coverage',

  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/config/db.js',
  ],

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  testTimeout: 30000,
  testEnvironment: 'node',
  verbose: true,
};
