const fs = require("fs");
const path = require("path");
const webpack = require("webpack");

const packagesDir = path.resolve(__dirname, "../../packages");
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
  stories: ["../stories/**/*.story.@(js|ts|tsx)"],
  addons: [
    "@storybook/addon-actions/register",
    "@storybook/addon-links/register",
    // {
    //   name: "@storybook/addon-postcss",
    //   options: {
    //     postcssLoaderOptions: {
    //       implementation: require("postcss"),
    //     },
    //   },
    // },
  ],
  core: {
    builder: "webpack5",
  },
  /**
   *
   * @param {webpack.Configuration} config
   * @returns {Promise<webpack.Configuration>}
   */
  async webpackFinal(config) {
    config.plugins = [
      ...(config.plugins || []),
      new webpack.DefinePlugin({
        __DEV__: "true",
      }),
    ];
    config.resolve = {
      ...config.resolve,
      alias: {
        ...(config.resolve.alias || {}),
        ...alias,
      },
    };
    return config;
  },
};
