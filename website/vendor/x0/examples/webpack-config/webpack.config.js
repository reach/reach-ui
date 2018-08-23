module.exports = {
  module: {
    rules: [
      {
        test: /\.md$/,
        use: [
          'html-loader',
          'markdown-loader'
        ]
      }
    ]
  }
}
