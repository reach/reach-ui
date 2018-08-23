const path = require('path')

const remark = {
  images: require('remark-images'),
  emoji: require('remark-emoji'),
  slug: require('remark-slug'),
  autolinkHeadings: require('remark-autolink-headings'),
}

const babel = {
  presets: [
    'babel-preset-env',
    'babel-preset-stage-0',
    'babel-preset-react',
  ].map(require.resolve),
  plugins: [
    'babel-plugin-macros',
    'babel-plugin-transform-runtime'
  ].map(require.resolve)
}

const rules = [
  {
    test: /\.js$/,
    exclude: /node_modules/,
    loader: require.resolve('babel-loader'),
    options: babel
  },
  {
    test: /\.js$/,
    exclude: path.resolve(__dirname, '../node_modules'),
    include: [
      path.resolve(__dirname, '..'),
      path.resolve(__dirname, '../src')
    ],
    loader: require.resolve('babel-loader'),
    options: babel
  },
  {
    test: /\.(md|mdx|jsx)$/,
    use: [
      {
        loader: require.resolve('babel-loader'),
        options: babel
      },
      {
        loader: require.resolve('@mdx-js/loader'),
        options: {
          mdPlugins: [
            remark.slug,
            remark.autolinkHeadings,
            remark.images,
            remark.emoji,
          ]
        }
      },
      path.join(__dirname, './mdx-fm-loader'),
    ]
  }
]

// common config
module.exports = {
  stats: 'none',
  resolve: {
    modules: [
      __dirname,
      path.join(__dirname, '../node_modules'),
      path.relative(process.cwd(), path.join(__dirname, '../node_modules')),
      'node_modules'
    ]
  },
  module: {
    rules
  },
  node: {
    fs: 'empty'
  },
  plugins: []
}
