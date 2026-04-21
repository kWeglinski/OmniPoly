
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
    '^.+\\.js$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  testPathIgnorePatterns: ['<rootDir>/tests/e2e/', '<rootDir>/tests/integration/'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'text'],
};
