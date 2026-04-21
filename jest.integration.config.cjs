

module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testMatch: ['<rootDir>/tests/integration/**/*.test.js'],
};
