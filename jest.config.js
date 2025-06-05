module.exports = {
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: ['focus-flow.js'],

  // The test environment that will be used for testing
  testEnvironment: 'jsdom',

  // A map from regular expressions to paths to transformers
  transform: {
    '^.+\\.js$': 'babel-jest',
  },

  // Indicates whether each individual test should be reported during the run
  verbose: true,
};
