const webpack = require('webpack')
const path = require('path')
const childProcess = require('child_process')
const NODE_ENV = process.env.NODE_ENV || 'production'

module.exports = {
  entry: './src/index.js',
  mode: NODE_ENV === 'development' ? 'development' : 'production',
  module: {
    rules: [
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader', // creates style nodes from JS strings
          'css-loader', // translates CSS into CommonJS
          'sass-loader', // compiles Sass to CSS, using Node Sass by default
        ],
      },
      {
        test: /\.(ico|jpg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {},
          },
        ],
      },
      {
        test: /\.(geojson|json)$/,
        loader: 'json-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'],
  },
  plugins: [
    (function progressPlugin() {
      if (NODE_ENV === 'development') {
        return new webpack.ProgressPlugin()
      }
    })(),
    (function hotModuleReplacement() {
      if (NODE_ENV === 'development') {
        return new webpack.HotModuleReplacementPlugin({})
      }
    })(),
    (function definePlugin() {
      const date = new Date()
      const zvVersion = JSON.stringify(require('../package.json').version)
        .replace(/"/g, '')
        .trim()
      const zvCommit = childProcess
        .execSync('git rev-parse --short HEAD')
        .toString()
        .trim()
      const zvBranch = childProcess
        .execSync('git rev-parse --abbrev-ref HEAD')
        .toString()
        .trim()
      const zvCount = childProcess
        .execSync('git rev-list HEAD --count')
        .toString()
        .trim()
      const zvDateMs = date.valueOf().toString()
      const zvDateStr = date.toISOString()

      return new webpack.DefinePlugin({
        'process.env': {
          BUILD_ENV: process.env.ENV,
          ROOT_URL: JSON.stringify('http://localhost:3090'),
        },
        DEBUG: NODE_ENV === 'development',
        PROD: NODE_ENV === 'production',
        PRODLOCAL: false, // TODO remove this value from all code, it's legacy
        zvCommit: `"${zvCommit}"`,
        zvBranch: `"${zvBranch}"`,
        zvCount: `"${zvCount}"`,
        zvDateMs: `"${zvDateMs}"`,
        zvDateStr: `"${zvDateStr}"`,
        zvVersion: `"${zvVersion}"`,
      })
    })(),
  ].filter(plugin => plugin !== undefined),
  output: {
    path: path.join(__dirname, '..', 'dist'),
    publicPath: '/',
    filename: 'bundle.js',
  },
}
