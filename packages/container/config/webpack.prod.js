const { merge } = require('webpack-merge')
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')
const commonConfig = require('./webpack.common')
const packageJson = require('../package.json')

// This prod config is used for building. Try doing 'npm run build' and notice that in the dist
// folder the output has been created. There should be a main.010f2b3b02ebd.js file or something
// like that with a content hash, and then an index.html file with the script tag injected.

// This is a variable that WE define in the CI/CD pipeline.
const domain = process.env.PRODUCTION_DOMAIN;

const prodConfig = {
  // Causes webpack to run slightly differently. Dependency files are optimized/minimized.
  // Takes a little longer to build.
  mode: 'production',
  output: {
    // This is a template. For caching issues...
    filename: '[name].[contenthash].js',
    // Anytime some part of webpack, like the HTML plugin (which injects the main.js script into
    // index.html) needs to refer to some file that is built by webpack.
    //
    // This makes sure that HTML plugin etc. will prepend the filename with this path! So this means
    // the browser will be able to find the right files in S3 since the index.html will be properly
    // injected with the right path.
    //
    // Example when I visit my production site once, it looks like this:
    // <script src="/container/latest/main.c0f9767a68e6d531041a.js"></script>
    publicPath: '/container/latest/'
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'container',
      // Remember, these remotes' locations need to be fixed at build time!
      // Obviously there are multiple remoteEntry.js files, so we set this up to require that the
      // below paths are actually where the files are being served from.
      remotes: {
        auth: `auth@${domain}/auth/latest/remoteEntry.js`,
        dashboard: `dashboard@${domain}/dashboard/latest/remoteEntry.js`,
        marketing: `marketing@${domain}/marketing/latest/remoteEntry.js`,
      },
      shared: packageJson.dependencies
    })
  ]
};

module.exports = merge(commonConfig, prodConfig);
