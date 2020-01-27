const { TsConfigPathsPlugin } = require("awesome-typescript-loader");
const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const packagesDir = path.resolve(__dirname, "../packages");
const packages = fs.readdirSync(packagesDir);

const alias = packages.reduce((memo, pkg) => {
  memo[`@reach/${pkg}/styles.css`] = path.join(
    packagesDir,
    `${pkg}/styles.css`
  );
  memo[`@reach/${pkg}`] = path.join(packagesDir, `${pkg}/src`);
  return memo;
}, {});

module.exports = {
  // stories: ["../packages/**/examples/*.example.(js|ts|tsx)"],
  addons: [
    "@storybook/addon-actions/register",
    "@storybook/addon-docs/register",
    "@storybook/addon-links/register"
  ],
  webpackFinal: async config => {
    config.module.rules = [
      ...config.module.rules,
      {
        test: /\.(ts|tsx)?$/,
        use: [
          {
            loader: "awesome-typescript-loader",
            options: {
              transpileOnly: true
            }
          },
          {
            loader: "react-docgen-typescript-loader",
            options: {}
          }
        ]
      }
    ];
    config.resolve = {
      ...config.resolve,
      alias: {
        ...(config.resolve.alias || {}),
        ...alias
      },
      extensions: [...(config.resolve.extensions || []), ".ts", ".tsx"],
      plugins: [new TsConfigPathsPlugin({})]
    };
    config.plugins = [
      ...config.plugins,
      new webpack.DefinePlugin({
        __DEV__: process.env.NODE_ENV === "development"
      })
    ];
    return config;
  }
};
