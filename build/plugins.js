const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const paths = require('./paths.js')

function BuildFinishedOutputPlugin (options) {
  this.apply = function (compiler) {
    compiler.plugin('emit', function (compilation, callback) {
      console.log(`\r${new Date().toLocaleString()} build finished`)
      callback()
    })
  }
}

module.exports = function getPlugins (env) {
  let plugins = [
    new BuildFinishedOutputPlugin({}),
    new webpack.optimize.OccurenceOrderPlugin(),
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
      hash: true
    }),
    new webpack.DefinePlugin({
      'process.env': {
        BUILD_ENV: process.env.ENV,
        'ROOT_URL': JSON.stringify('http://localhost:3090')
      },
      'DEBUG': (env === 'DEV'),
      'PROD': (env === 'PROD')
    })
  ]

  if (env === 'PROD') {
    const prodPlugins = [
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.AggressiveMergingPlugin({}),
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: true,
        compress: {
          booleans: true,
          cascade: true,
          comparisons: true,
          conditionals: true,
          dead_code: true,
          drop_console: true,
          drop_debugger: true,
          evaluate: true,
          hoist_funs: true,
          hoist_vars: true,
          if_return: true,
          join_vars: true,
          loops: true,
          negate_iife: true,
          properties: true,
          sequences: true,
          unsafe: false,
          unused: true,
          warnings: false
        },
        mangle: {
          toplevel: true,
          sort: true,
          eval: true,
          properties: true
        },
        output: {
          space_colon: false,
          comments: false
        }
      })
    ]

    plugins = plugins.concat(prodPlugins)
  }

  return plugins
}

  // new CaseSensitivePathsPlugin(),
 // new WatchMissingNodeModulesPlugin(PATHS.appNodeModules)
