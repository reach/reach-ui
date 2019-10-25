module.exports = {
  setupFilesAfterEnv: ["./jest.setup.js"],
  transform: {
    "^.+\\.jsx?$": "./jest-transformer.js"
  },
  resetMocks: true,
  resetModules: true,
  globals: {
    __DEV__: true
  }
};
