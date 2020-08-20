import * as fs from "fs-extra";
import * as path from "path";

const appDirectory = fs.realpathSync(process.cwd());
const rootDir = path.resolve(appDirectory, ".");

export default {
  collectCoverageFrom: ["packages/**/src/**/*.{ts,tsx,js}"],
  globals: {
    __DEV__: "boolean",
  },
  transform: {
    ".(ts|tsx)$": require.resolve("ts-jest/dist"),
    ".(js|jsx)$": require.resolve("babel-jest"), // jest's default
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleNameMapper: {
    "\\$test(.*)$": "<rootDir>/test/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/test/setupTests.ts"],
  testMatch: ["<rootDir>/**/*.(spec|test).{ts,tsx,js,jsx}"],
  testURL: "http://localhost",
  transformIgnorePatterns: [
    "[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$",
    "^.+\\.js$",
  ],
  // projects: ["<rootDir>", "<rootDir>/packages/*"],
  rootDir,
  watchPlugins: [
    require.resolve("jest-watch-typeahead/filename"),
    require.resolve("jest-watch-typeahead/testname"),
  ],
};
