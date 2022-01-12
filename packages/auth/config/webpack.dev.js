const { merge } = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')
const commonConfig = require('./webpack.common')
const packageJson = require('../package.json')

const devConfig = {
  mode: 'development',
  // If we didn't give this publicPath, then when running in local and gong to
  // 'localhost:8082/auth/signup', we'd see that the browser is looking for
  // the main.js file at 'http://localhost:8082/auth/main.js', because it sees
  // 'localhost:8082/auth/' as the path, and then without public path it just
  // goes for appending 'main.js' to there. But that's not where main.js is!
  //
  // One solution is to set publicPath below to '/', so script src would be
  // injected as '/main.js' in the index.html file and the browser would look
  // correctly in 'http://localhost:8082/main.js'. BUT, if running through
  // container, then when container reaches out through remoteEntry.js it will
  // see '/' but see it relative from :8084, so look for auth's main.js file at
  // 'http://localhost:8084/main.js', which is where main.js for container is!
  //
  // So, we fix it with the whole path including the port number for auth. And
  // the slash at the end is very important because just 'main.js' and other
  // names of files will simply be appended!
  //
  // Why was this not an issue for marketing? If publicPath is not set, then
  // when loading up scripts from remoteEntry.js, it just looks relative to the
  // URL where the remoteEntry.js file is! So, since marketing's was at
  // 'http://localhost:8081/remoteEntry.js', it jus looked for main.js at that
  // same path of 'http://localhost:8081/main.js'.
  output: {
    publicPath: 'http://localhost:8082/'
  },
  devServer: {
    port: 8082,
    historyApiFallback: {
      index: '/index.html'
    }
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'auth',
      filename: 'remoteEntry.js',
      exposes: {
        './AuthApp': './src/bootstrap'
      },
      shared: packageJson.dependencies
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ]
};

module.exports = merge(commonConfig, devConfig);
