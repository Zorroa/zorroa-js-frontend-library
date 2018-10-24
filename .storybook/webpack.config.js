const webpackConfig = require('../webpack.config.js')

module.exports = (storybookBaseConfig) => {
  storybookBaseConfig.mode = 'development';
  storybookBaseConfig.module.rules = webpackConfig.module.rules;
  return storybookBaseConfig;
};
