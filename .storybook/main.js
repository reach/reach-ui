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
  stories: ["../packages/**/*/*.story.@(js|ts|tsx)"],
  addons: [
    "@storybook/addon-actions/register",
    "@storybook/addon-docs/register",
    "@storybook/addon-links/register",
    "@storybook/addon-postcss",
  ],
  webpackFinal: async (config) => {
    config.resolve = {
      ...config.resolve,
      alias: {
        ...(config.resolve.alias || {}),
        ...alias,
      },
    };
    config.plugins = [
      ...config.plugins,
      new webpack.DefinePlugin({
        __DEV__: process.env.NODE_ENV === "development",
      }),
    ];
    return config;
  },
};
