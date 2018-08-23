const { generateJSReferences } = require('mini-html-webpack-plugin')
const { minify } = require('html-minifier')
const defaultTemplate = require('./template')

module.exports = opts => {
  const template = opts.template || defaultTemplate
  return context => {
    const scripts = generateJSReferences(context.js, context.publicPath)
    return minify(
      template(Object.assign({}, context, {
        scripts
      })),
      {
        collapseWhitespace: true
      }
    )
  }
}
