module.exports = () => ({
  plugins: [
    require(`postcss-preset-env`)({
      stage: 2
    })
  ]
});
