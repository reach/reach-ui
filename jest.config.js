module.exports = {
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
  timers: "modern",
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/**/*.(spec|test).{ts,tsx,js,jsx}"],
  testURL: "http://localhost",
  transformIgnorePatterns: [
    "[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$",
    "^.+\\.js$",
  ],
  // projects: ["<rootDir>", "<rootDir>/packages/*"],
  // rootDir,
  watchPlugins: [
    require.resolve("jest-watch-typeahead/filename"),
    require.resolve("jest-watch-typeahead/testname"),
  ],
};

if (process.env.USE_REACT_16 === "true") {
  module.exports.cacheDirectory = ".cache/jest-cache-react-16";
  module.exports.moduleNameMapper = {
    ...module.exports.moduleNameMapper,
    "^react-is((\\/.*)?)$": "react-is-16$1",
    "^react-dom((\\/.*)?)$": "react-dom-16$1",
    "^react((\\/.*)?)$": "react-16$1",
  };
}
