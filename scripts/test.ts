#!/usr/bin/env node

import * as jest from "jest";
import { paths } from "./constants";

const jestConfig = {
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
  rootDir: paths.appRoot,
  watchPlugins: [
    require.resolve("jest-watch-typeahead/filename"),
    require.resolve("jest-watch-typeahead/testname"),
  ],
};

async function testAction() {
  // Do this as the first thing so that any code reading it knows the right env.
  process.env.BABEL_ENV = "test";
  process.env.NODE_ENV = "test";
  // Makes the script crash on unhandled rejections instead of silently
  // ignoring them. In the future, promise rejections that are not handled will
  // terminate the Node.js process with a non-zero exit code.
  process.on("unhandledRejection", err => {
    throw err;
  });

  const argv = process.argv.slice(2);

  argv.push(
    "--config",
    JSON.stringify({
      ...jestConfig,
    })
  );

  // console.log(jest);

  const [, ...argsToPassToJestCli] = argv;
  jest.run(argsToPassToJestCli);
}

testAction();
