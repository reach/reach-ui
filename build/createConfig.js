// https://github.com/jaredpalmer/tsdx#customization
let globals = {
  tslib: "TSLib",
  "prop-types": "PropTypes",
  "react-dom": "ReactDOM",
  "@reach/visually-hidden": "ReachVisuallyHidden",
  "@reach/utils": "ReachUtils"
};

let createConfig = (overrides = {}) => {
  overrides.globals = overrides.globals || {};
  globals = Object.assign(globals, overrides.globals);
  return {
    rollup(config) {
      // config.external is either an array or a function
      // https://rollupjs.org/guide/en/#core-functionality
      config.external = config.external || [];
      if (typeof config.external === "function") {
        let fn = config.external;
        config.external = id => {
          if (Object.keys(globals).includes(id)) {
            return true;
          } else {
            return fn(id);
          }
        };
      } else {
        let e = config.external;
        config.external = [...e, ...Object.keys(globals)];
      }
      config.output = config.output || {};
      config.output.globals = config.output.globals || {};
      config.output.globals = {
        ...config.output.globals,
        ...globals
      };
      return config;
    }
  };
};

module.exports = createConfig;
