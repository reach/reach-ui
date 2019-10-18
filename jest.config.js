module.exports = {
  transform: {
    "^.+\\.jsx?$": "./jest-transformer.js"
  },
  globals: {
    __DEV__: true
  }
};
