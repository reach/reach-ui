const fs = require("fs");
const path = require("path");

const packagesDir = path.resolve(__dirname, "../packages");
const packages = fs.readdirSync(packagesDir);

const alias = packages.reduce((memo, pkg) => {
  memo[`@reach/${pkg}`] = path.join(packagesDir, pkg);
  return memo;
}, {});

module.exports = ({ config }) => {
  config.resolve = {
    ...config.resolve,
    alias: alias,
    extensions: [".js"]
  };
  return config;
};
