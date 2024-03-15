import { JestConfigWithTsJest } from "ts-jest"


export default {
  testEnvironment: "node",
  preset: "ts-jest/presets/default-esm",
  maxWorkers: 1,
  transform: {
    "^.+\\.m?[tj]s?$": [
      "ts-jest",
      {
        useESM: true, 
      },
    ],
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.(m)?js$": "$1",
  },
  testRegex: "/__tests__/.*test.ts$",
  coverageDirectory: "coverage",
  setupFiles: ["<rootDir>/__tests__/jest.setup.ts"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "src/**/*.mts",
    "!src/**/*.d.ts",
    "!src/**/*.d.mts",
  ],
} as JestConfigWithTsJest;
