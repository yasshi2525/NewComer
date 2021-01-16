module.exports = {
  collectCoverage: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: ["./src/**/*.ts"],
  coverageReporters: ["lcov"],
  moduleFileExtensions: ["ts", "js"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/spec/tsconfig.json",
    },
  },
  testMatch: ["<rootDir>/spec/**/*.ts"],
  modulePaths: ["<rootDir>/src"],
};
