module.exports = {
  plugins: ["babel-plugin-annotate-pure-calls", "babel-plugin-macros"],
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
