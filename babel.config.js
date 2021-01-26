module.exports = {
  plugins: [
    "babel-plugin-annotate-pure-calls",
    "babel-plugin-dev-expression",
    ["@babel/plugin-proposal-class-properties", { loose: true }],
    "@babel/plugin-proposal-optional-chaining",
    "@babel/plugin-proposal-nullish-coalescing-operator",
    "babel-plugin-macros",
  ],
  presets: [
    "@babel/preset-typescript",
    "@babel/preset-react",
    [
      "@babel/preset-env",
      {
        modules: false,
        loose: true,
      },
    ],
  ],
};
