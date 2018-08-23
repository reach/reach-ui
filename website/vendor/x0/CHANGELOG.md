
# Changelog

## 5.0.0

- x0 now accepts a folder of components as the entry argument
- Automatic routing based on filename
- Dev server uses [webpack-serve](https://github.com/webpack-contrib/webpack-serve) under the hood
- Uses [mini-html-webpack-plugin](https://github.com/styleguidist/mini-html-webpack-plugin)
- Default HTML head contents for UTF-8 charset and viewport meta tag
- Minimal base CSS styling
- Rendering the `<head>` in the component is no longer supported
- Webpack is used both for the client and static rendering, enabling webpack features in `getInitialProps`
- Support for [babel-plugin-macros](https://github.com/kentcdodds/babel-plugin-macros)
- Default props can no longer be passed through the `package.json` config
- The `routes` array in `package.json` is no longer supported
- Adding [react-router](https://github.com/ReactTraining/react-router) is no longer necessary
- Removes [react-loadable](https://github.com/jamiebuilds/react-loadable) support
- Proxy option is no longer supported, but can be configured with a custom webpack config
- Automatically looks for a `webpack.config.js` file in the directory
- The `--config` flag has been renamed to `--webpack`
- Automatic support for [styled-components](https://github.com/styled-components/styled-components)
- Automatic support for [emotion](https://github.com/emotion-js/emotion)
- Custom HTML template option
- Supports custom App component to wrap all routes
- Support for [JSX](https://github.com/c8r/jsx-loader) file format
- Support for [MDX](https://github.com/mdx-js/mdx) file format

### Migrating from v4

- A directory should be passed to the x0 command, instead of a single file
- React router is not necessary for routing
- The `routes` option is no longer supported
- HTML head contents should be removed from components
- Viewport and charset meta tags are included by default
- Use the custom template option or head options to populate HTML head contents
- Default props set in options should be added to the components
- Custom usage of react-loadable will require additional setup
- The `--config` flag should be renamed to `--webpack`
- The `proxy` option is no longer supported
- The `cssLibrary` option is no longer required
- Support for automatic static rendering with `glamor`, `glamorous`, and `fela` is no longer supported
- The `getInitialProps` method's `pathname` argument has be renamed to `path`
- The `getInitialProps` method *only* receives the `path` argument, all other arguments are deprecated

