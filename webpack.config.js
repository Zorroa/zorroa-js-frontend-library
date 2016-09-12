const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const webpack = require('webpack')

const nodePaths = (process.env.NODE_PATH || '')
  .split(process.platform === 'win32' ? ';' : ':')
  .filter(Boolean)
  .map(p => path.resolve(p))

const PATHS = {
  nodePaths,
  appHtml: path.resolve('index.tmpl.html'),
  appSrc: path.resolve('src/index'),
  appBuild: path.resolve('bin'),
  appNodeModules: path.resolve('node_modules')
}

module.exports = {
  devtool: 'eval',
  entry: [
    require.resolve('webpack-dev-server/client') + '?/',
    require.resolve('webpack/hot/dev-server'),
    // require.resolve('./configs/polyfills'),
    PATHS.appSrc
  ],
  output: {
    path: PATHS.appBuild,
    pathinfo: true,
    filename: 'static/js/app.bundle.js',
    publicPath: '/'
  },
  resolve: {
    fallback: PATHS.nodePaths,
    extensions: ['.js', '.json', '.jsx', '']
  },
  // resolveLoader: {
  //   root: PATHS.appNodeModules,
  //   moduleTemplates: ['*-loader']
  // },
  module: {
    noParse: /node_modules\/.bin/,
    preLoaders: [
      {
        test: /\.(js|jsx)$/,
        loader: 'eslint',
        exclude: /(node_modules|bower_components)/,
        include: PATHS.appSrc
      }
    ],
    loaders: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          cacheDirectory: true
        }
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.less$/,
        loader: 'style-loader!css-loader!less-loader'
      },
      {
        test: /\.scss$/,
        loader: 'style-loader!css-loader!sass-loader'
      },
      {
        test: /\.(ico|jpg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
        exclude: /\/favicon.ico$/,
        loader: 'file',
        query: {
          name: 'static/media/[name].[hash:8].[ext]'
        }
      },
      {
        test: /\/favicon.ico$/,
        include: PATHS.appSrc,
        loader: 'file',
        query: {
          name: 'favicon.ico?[hash:8]'
        }
      },
      {
        test: /\.(mp4|webm)(\?.*)?$/,
        loader: 'url',
        query: {
          limit: 10000,
          name: 'static/media/[name].[hash:8].[ext]'
        }
      },
      {
        test: /\.html$/,
        loader: 'html',
        query: {
          attrs: ['link:href']
        }
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  },
  eslint: {
    configFile: path.resolve('.eslintrc')
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: PATHS.appHtml,
      hash: true
    })
    // new webpack.DefinePlugin(env),
    // new webpack.HotModuleReplacementPlugin()
    // new CaseSensitivePathsPlugin(),
    // new WatchMissingNodeModulesPlugin(PATHS.appNodeModules)
  ]
}
