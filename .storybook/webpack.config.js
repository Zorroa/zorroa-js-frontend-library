const webpackConfig = require('../webpack.config.js')

module.exports = {
  module: {
    rules: webpackConfig.module.rules,
  },
};
