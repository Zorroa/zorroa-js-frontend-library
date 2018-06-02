const path = require('path')
const getLoaders = require('./loaders')
const getPreloaders = require('./preloaders')
const getPlugins = require('./plugins')
const paths = require('./paths')
const ENV = 'DEV'

module.exports = {
  devtool: 'eval-cheap-module-source-map',
  devServer: {
    disableHostCheck: true,
    port: 8081
  },
  entry: [
    require.resolve('webpack-dev-server/client') + '?/',
    require.resolve('webpack/hot/dev-server'),
    paths.appSrc
  ],
  output: {
    path: paths.appBuild,
    pathinfo: true,
    filename: 'static/js/app.bundle.js',
    publicPath: '/'
  },
  resolve: {
    fallback: paths.nodePaths,
    extensions: ['.js', '.json', '.jsx', '']
  },
  module: {
    noParse: /node_modules\/.bin/,
    preLoaders: getPreloaders(ENV),
    loaders: getLoaders(ENV)
  },
  plugins: getPlugins(ENV),
  eslint: {
    configFile: path.resolve('.eslintrc')
  },
  watchOptions: {
    // let's ignore node_modules and slow down disk polling so the cpu isn't pegged
    ignored: /node_modules/,
    aggregateTimeout: 1000
    // poll: 1000
  }
}
