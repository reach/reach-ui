#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const meow = require('meow')
const findup = require('find-up')
const readPkg = require('read-pkg-up').sync
const openBrowser = require('react-dev-utils/openBrowser')
const log = require('@compositor/log')
const chalk = require('chalk')
const clipboard = require('clipboardy')

const config = require('pkg-conf').sync('x0')
const pkg = readPkg().pkg

log.name = 'x0'

const cli = meow(`
  ${chalk.gray('Usage')}

    ${chalk.gray('Dev Server')}

      ${chalk.cyan('x0 pages')}

    ${chalk.gray('Build')}

      ${chalk.cyan('x0 build pages')}

  ${chalk.gray('Options')}

      --webpack       Path to webpack config file
      --match         String to match routes against using minimatch

    ${chalk.gray('Dev Server')}

      -o --open       Open dev server in default browser
      -p --port       Port for dev server
      --analyze       Runs with webpack-bundle-analyzer plugin

    ${chalk.gray('Build')}

      -d --out-dir    Output directory (default dist)
      -s --static     Output static HTML without JS bundle
      -t --template   Path to custom HTML template
      --basename      Basename for URL paths
      --title         Page title
`, {
  flags: {
    // dev
    open: {
      type: 'boolean',
      alias: 'o'
    },
    port: {
      type: 'string',
      alias: 'p'
    },
    analyze: {},
    // build
    outDir: {
      type: 'string',
      alias: 'd'
    },
    static: {
      type: 'boolean',
    },
    template: {
      type: 'string',
      alias: 't'
    },
    // shared
    config: {
      type: 'string',
      alias: 'c'
    },
    match: {
      type: 'string'
    },
    scope: {
      type: 'string',
    },
    webpack: {
      type: 'string',
    },
    debug: {
      type: 'boolean'
    }
  }
})

const [ cmd, file ] = cli.input

if (!cmd) {
  cli.showHelp(0)
}

const input = path.resolve(file || cmd)
const stats = fs.statSync(input)
const dirname = stats.isDirectory() ? input : path.dirname(input)
const filename = stats.isDirectory() ? null : input

const opts = Object.assign({
  input,
  dirname,
  filename,
  stats,
  outDir: 'dist',
  basename: '',
  scope: {},
  pkg,
}, config, cli.flags)

opts.outDir = path.resolve(opts.outDir)
if (opts.config) opts.config = path.resolve(opts.config)
if (opts.webpack) {
  opts.webpack = require(path.resolve(opts.webpack))
} else {
  const webpackConfig = findup.sync('webpack.config.js', { cwd: dirname })
  if (webpackConfig) opts.webpack = require(webpackConfig)
}

if (opts.template) {
  opts.template = require(path.resolve(opts.template))
}

const handleError = err => {
  log.error(err)
  process.exit(1)
}

log(chalk.cyan('@compositor/x0'))

switch (cmd) {
  case 'build':
    log.start('building static site')
    const build = require('./lib/build')
    build(opts)
      .then(res => {
        log.stop('site saved to ' + opts.outDir)
      })
      .catch(handleError)
    break
  case 'dev':
  default:
    log.start('starting dev server')
    const dev = require('./lib/dev')
    dev(opts)
      .then(({ server }) => {
        const { port } = server.options
        const url = `http://localhost:${port}`
        log.stop(
          'dev server listening on',
          chalk.green(url),
          chalk.gray('(copied to clipboard)')
        )
        clipboard.write(url)
        if (opts.open) {
          openBrowser(url)
        }
      })
      .catch(handleError)
    break
}

require('update-notifier')({
  pkg: require('./package.json')
}).notify()
