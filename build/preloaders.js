const paths = require('./paths.js')

module.exports = function getPreloaders(env) {
  const preloaders = []

  if (env === 'DEV') {
    preloaders.push({
      test: /\.(js|jsx)$/,
      enforce: 'pre',
      loader: 'eslint',
      exclude: /(node_modules|bower_components)/,
      include: paths.appSrc,
    })
  }

  return preloaders
}
