module.exports = {
  extends: "react-app",
  globals: {
    __DEV__: "readonly"
  },
  rules: {
    "no-unused-vars": [
      1,
      {
        args: "after-used",
        ignoreRestSiblings: true,
        argsIgnorePattern: "^(event|_)$"
      }
    ],
    "import/first": 0,
    "jsx-a11y/no-static-element-interactions": [
      1,
      {
        handlers: [
          "onClick",
          "onMouseDown",
          "onMouseUp",
          "onKeyPress",
          "onKeyDown",
          "onKeyUp"
        ]
      }
    ]
  }
};
