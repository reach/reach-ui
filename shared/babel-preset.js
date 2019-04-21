const BABEL_ENV = process.env.BABEL_ENV;
const building = BABEL_ENV !== undefined && BABEL_ENV !== "cjs";

const plugins = [
  "@babel/plugin-proposal-class-properties",
  "@babel/plugin-proposal-object-rest-spread",
  "babel-plugin-dev-expression",
  [
    "babel-plugin-transform-inline-environment-variables",
    {
      include: ["COMPAT"]
    }
  ]
];

if (BABEL_ENV === "umd") {
  plugins.push("@babel/plugin-external-helpers");
}

module.exports = function(api) {
  api.cache(true);

  return {
    presets: [
      [
        "@babel/preset-env",
        {
          loose: true,
          modules: building ? false : "commonjs"
        }
      ],
      "@babel/preset-react"
    ],
    plugins: plugins
  };
};
