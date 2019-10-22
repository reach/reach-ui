const path = require("path");

module.exports = ({ config }) => {
  const packagesPath = path.resolve(__dirname, "../packages");
  config.resolve = {
    ...config.resolve,
    alias: {
      "@reach/alert": path.join(packagesPath, "/alert/src/"),
      "@reach/alert-dailog": path.join(packagesPath, "/alert-dailog/src/"),
      "@reach/auto-id": path.join(packagesPath, "/auto-id/src/"),
      "@reach/checkbox": path.join(packagesPath, "/checkbox/src/"),
      "@reach/combobox": path.join(packagesPath, "/combobox/src/"),
      "@reach/component-component": path.join(
        packagesPath,
        "/component-component/src/"
      ),
      "@reach/dailog": path.join(packagesPath, "/dailog/src/"),
      "@reach/menu-button": path.join(packagesPath, "/menu-button/src/"),
      "@reach/popover": path.join(packagesPath, "/popover/src/"),
      "@reach/portal": path.join(packagesPath, "/portal/src/"),
      "@reach/rect": path.join(packagesPath, "/rect/src/"),
      "@reach/skip-nav": path.join(packagesPath, "/skip-nav/src/"),
      "@reach/slider": path.join(packagesPath, "/slider/src/"),
      "@reach/tabs": path.join(packagesPath, "/tabs/src/"),
      "@reach/tooltip": path.join(packagesPath, "/tooltip/src/"),
      "@reach/utils": path.join(packagesPath, "/utils/src/"),
      "@reach/visually-hidden": path.join(
        packagesPath,
        "/visually-hidden/src/"
      ),
      "@reach/window-size": path.join(packagesPath, "/window-size/src/")
    },
    extensions: [".js"]
  };
  return config;
};
