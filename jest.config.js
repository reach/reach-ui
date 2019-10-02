module.exports = {
  transform: {
    "^.+\\.jsx?$": "./jestTransformer.js"
  },
  globals: {
    __DEV__: true
  }
};
