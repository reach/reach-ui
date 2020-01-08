// TODO: This isn't what BABEL_ENV is for. Once we are using
// Rollup for builds (using rollup-plugin-babel) we won't need
// this anymore anyway.
const moduleFormat = process.env.MODULE_FORMAT || "esm";

module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        loose: true,
        modules: moduleFormat === "esm" ? false : moduleFormat
      }
    ],
    "@babel/preset-react"
  ],
  plugins: [
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-nullish-coalescing-operator",
    "@babel/plugin-proposal-optional-chaining",
    "babel-plugin-dev-expression"
  ]
};
