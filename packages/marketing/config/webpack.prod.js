const { merge } = require('webpack-merge')
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')
const commonConfig = require('./webpack.common')
const packageJson = require('../package.json')

// See details from packages/container/config/webpack.prod.js.

const prodConfig = {
  mode: 'production',
  output: {
    filename: '[name].[contenthash].js',
    publicPath: '/marketing/latest/'
  },
  plugins: [
    // In the below case, this is actually the same as in dev config. We could extract to common
    // config, but in a lot of other projects you're gonna want to alter the config between dev and
    // prod, so for this tutorial we just leave them separate.
    //
    // Note that it's for the remotes that the MFP config can be the same...for container it has to
    // be different because browser needs to look to different places for the resources.
    new ModuleFederationPlugin({
      name: 'marketing',
      filename: 'remoteEntry.js',
      exposes: {
        './MarketingApp': './src/bootstrap'
      },
      shared: packageJson.dependencies
    }),
  ]
};

module.exports = merge(commonConfig, prodConfig);
