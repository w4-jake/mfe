const { merge } = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')
const commonConfig = require('./webpack.common')
const packageJson = require('../package.json')

// Additional configs for dev. Notice that npm start runs wih this file.

// Webpack in general: what does it do?
// It finds an index.jx file, which in turn has a bunch of dependencies.

// When you run 'npm run start' notice that it outputs a lot tof 'modules by path' log info, which
// has to do with these dependencies, like in this case react-dom and react-router-dom and so on.

// So it takes all these files, like from my own sources and also from node_modules, and then
// bundles them all into a file called in our case 'main.js' which we can see in the Sources tab
// for Google web development tools.

// The imported libraries are these eval() statements with really long lines, those are the
// individual files related to the libraries. Ex. 'node_modules/querystring/encodes.js'. We can also
// find that '.src/index.js' is also being evaluated there.

const devConfig = {
  mode: 'development',
  output: {
    publicPath: 'http://localhost:8081/'
  },
  // This is what actually makes the main.js file become available to a browser at a port. With
  // just mode: 'development' set, and where 'npm run start' is just "webpack", it would create
  // the file in dist I think. But now it is "webpack serve".
  //
  // In fact when it's running in the browser, you can go to http://localhost:8081/main.js and see
  // that the file there is available.
  //
  // But without a public/index.html file, we wouldn't get actual HTML. Notice that our index.html
  // file doesn't have a script tag. This is inserted automatically by webpack and we can see in the
  // actual Elements that it has been done:
  //
  // <!DOCTYPE html>
  // <html>
  // <head></head>
  // <body>
  //   <div id="_marketing-dev-root"></div>
  //   <script src="http://localhost:8081/main.js"></script>
  //   <script src="http://localhost:8081/remoteEntry.js"></script>
  // </body>
  // </html>
  //
  // Of course we can just insert those files statically in the source, but in production builds, we
  // are not going to be able to predict the name of the files, like "main.c0f9767a68e6d531041a.js".
  //
  // This is being done by the HtmlWebpackPlugin...see below.
  devServer: {
    port: 8081,
    historyApiFallback: {
      // NOTE: this needs a slash at the front or else accessing from http://localhost:8081/pricing
      // will fail. Also, 'true' for historyApiFallback is also possible.
      index: '/index.html'
    }
  },
  plugins: [
    // We need to use this to expose resources that can be used by the container app.
    // Run 'npm run start' locally for both marketing and container, and then look at JS requests
    // for the Network tab in container.
    //
    // You can see that there is a request to main.js for container: http://localhost:8084/main.js
    // and also for the src_bootstrap_js.js file at this port. This is just from the normal work
    // done by webpack bundling. And notice that localhost:8081/main.js is also being output just
    // as normal and we can see it by going to localhost:8081.
    //
    // But because of this plugin, marketing also makes these files:
    //   - remoteEntry.js: gives a guide of all the other below files and how to load them.
    //   - src_bootstrap_js.js: version of src/bootstrap.js that can be safely loaded into browser.
    //      If you actually open up this file you'll see source code like from Landing.js.
    //   - vendors-* and others: versions of dependencies that can be safely loaded into browser.
    new ModuleFederationPlugin({
      // Must be identical to prefix in container remote value: `${name}@http://...`.
      // If they do not match, you might get a ScriptExternalLoadError.
      name: 'marketing',
      // Always a good idea to just go by convention and keep this filename.
      filename: 'remoteEntry.js',
      exposes: {
         // We can actually choose which files to expose and not. So here we expose bootstrap.
         // Basically it's an alias, so we can rename this part for use by external code that does
         // not know some context of the actual product. Ex. if the local file for a barchart is at
         // charts/barchart/index.js, we can just alias it to just './Barchart' for cleaner use.
        './MarketingApp': './src/bootstrap'
      },
      // Ensures that when container fetches marketing remoteEntry.js file, it also looks at other
      // remoteEntry.js files that have the same 'shared' configuration, and then choose to load
      // only one copy from either, and then make available to both.
      //
      // 'shared' also accepts an array of just some module names, like ['faker'].
      //
      // Notice that marking these dependencies as shared modules ensures that they are loaded
      // asynchronously, so we can no longer do a static load of the bootstrap code when running
      // marketing alone in isolation! Must load bootstrap asynchronously as well.
      //
      // Should see fewer redundancies in JS requests from container when using this setting.
      //
      // Notes on versioning...if both marketing and container have ['faker'] here, and then in the
      // package.js one uses 5.x.x and the other uses 4.x.x, then webpack will recognize these are
      // two different versions and ensure that both are provided. (And it analyzes semantic
      // versioning with ~ and ^ correctly, too.)
      //
      // And note that some libraries, like React, cannot be loaded up twice in the browser...causes
      // a problem. React doesn't allow that. So it's possible to use { faker: { singleton: true }}
      // as the object given to shared to enforce that just one version be loaded, and if there are
      // incompatible versions then webpack for container will complain with a warning:
      //
      // 'Unsatisfied version 5.1.0 of shared singleton module faker (required ^4.1.0)'
      shared: packageJson.dependencies
    }),
    new HtmlWebpackPlugin({
      // Says, "Take all the files that are coming out of the webpack process them and put in into
      // script tags in this template!" Notice how it is needed only for dev.
      //
      // If you get "Uncaught TypeError: Cannot set property 'innerHTML' of null", then it's likely
      // that there is a mismatch between the public/index.html id and the one you are querying for
      // in bootstrap.js.
      template: './public/index.html'
    })
  ]
};

// We put devConfig second to give it priority over commonConfig for similar object config paths.
module.exports = merge(commonConfig, devConfig);
