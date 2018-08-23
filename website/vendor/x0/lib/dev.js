const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const serve = require('webpack-serve')
const history = require('connect-history-api-fallback')
const convert = require('koa-connect')
const MiniHTMLWebpackPlugin = require('mini-html-webpack-plugin')
const merge = require('webpack-merge')

const baseConfig = require('./config')
const createTemplate = require('./createTemplate')

const dev = {
  hot: true,
  logLevel: 'error',
  clientLogLevel: 'none',
  stats: 'errors-only'
}

module.exports = async (opts) => {
  if (opts.basename) delete opts.basename
  const config = merge(baseConfig, opts.webpack)
  const template = createTemplate(opts)

  config.mode = 'development'
  config.context = opts.dirname
  config.entry = opts.entry || path.join(__dirname, '../src/entry')
  config.output = {
    path: path.join(process.cwd(), 'dev'),
    filename: 'dev.js',
    publicPath: '/'
  }

  config.resolve.modules.unshift(
    opts.dirname,
    path.join(opts.dirname, 'node_modules')
  )

  if (config.resolve.alias) {
    const whcAlias = config.resolve.alias['webpack-hot-client/client']
    if (!fs.existsSync(whcAlias)) {
      const whcPath = path.dirname(require.resolve('webpack-hot-client/client'))
      config.resolve.alias['webpack-hot-client/client'] = whcPath
    }
  }

  config.plugins.push(
    new webpack.DefinePlugin({
      DEV: JSON.stringify(true),
      OPTIONS: JSON.stringify(opts),
      DIRNAME: JSON.stringify(opts.dirname),
      MATCH: JSON.stringify(opts.match)
    })
  )

  config.plugins.push(
    new MiniHTMLWebpackPlugin({
      context: opts,
      template
    })
  )

  if (opts.analyze) {
    const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
    const analyzerPort = typeof opts.analyze === 'string'
      ? opts.analyze
      : 8888
    config.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerPort
      })
    )
  }

  if (opts.debug) {
    config.stats = 'verbose'
    // todo: enable other logging
  }

  const serveOpts = {
    config,
    dev,
    logLevel: 'error',
    content: opts.dirname,
    port: opts.port,
    hot: { logLevel: 'error' },
    add: (app, middleware, options) => {
      app.use(convert(history({})))
    }
  }

  return new Promise((resolve, reject) => {
    serve(serveOpts)
      .then(server => {
        server.compiler.hooks.done.tap({ name: 'x0' }, (stats) => {
          resolve({ server, stats })
        })
      })
      .catch(reject)
  })
}
