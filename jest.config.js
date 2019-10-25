module.exports = {
  transform: {
    "^.+\\.jsx?$": "./jest-transformer.js"
  },
  resetMocks: true,
  resetModules: true,
  globals: {
    __DEV__: true
  }
};
