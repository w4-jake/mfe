const { merge } = require('webpack-merge')
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')
const commonConfig = require('./webpack.common')
const packageJson = require('../package.json')

const devConfig = {
  mode: 'development',
  output: {
    publicPath: 'http://localhost:8084/'
  },
  devServer: {
    port: 8084,
    historyApiFallback: {
      index: '/index.html'
    }
  },
  plugins: [
    // Here, container is the host, so we have to define where it needs to find the remote files.
    new ModuleFederationPlugin({
      // Since container is the host, this name isn't used. Convention to add anyways.
      name: 'container',
      remotes: {
        auth: 'auth@http://localhost:8082/remoteEntry.js',
        dashboard: 'dashboard@http://localhost:8083/remoteEntry.js',
        // In MarketingApp, we have: "import { mount } from 'marketing/MarketingApp';"
        // This 'marketing' module that we import from is the KEY here.
        // First webpack looks in node_modules to see if there is a 'marketing'.
        // There's not, so it looks here in the remotes object.
        //
        // The 'marketing' that is the prefix to the value relates to the name of the exposed
        // marketing app, set up in marketing/config/webpack.dev.js
        //
        // When we run container and marketing locally and then open localhost:8084, then take a
        // look at the remoteEntry.js file fetched through JS request from localhost:8081, we see
        // near the top 'var marketing', and at the very bottom marketing is set to
        // __webpack_exports_. It is precisely this variable that we are looking for here in terms
        // of the prefix 'marketing@...'.
        //
        // So it had better be set up right in marketing/config/webpack.dev.js!
        //
        // If we change 'marketing@' to 'wrongName@' below, then when we try to load container we
        // will get errors like "ScriptExternalLoadError: Loading script failed".
        //
        // ALSO, VERY IMPORTANT! If this below name of 'marketing' matches an id of some element in
        // the container's index.html, then we see a weird error: "TypeError: fn is not a function".
        //
        // Why? Open container browser and type in 'marketing'. We see that the variable has been
        // loaded and is available to the browser as a global variable, with get and init function!
        // This is basically how we get all the info we need for marketing.
        //
        // BUT! When we assign an id to an element in HTML, the browser is going to try to create
        // a global variable with that same name. Try it with 'root'. And this overwrites the
        // value coming over from the remoteEntry.js file.
        //
        // SO USE GOOD NAMES FOR YOUR MODULES THAT ARE UNLIKELY TO COLLIDE. THE 'marketing' PREFIX
        // HERE MEANS THAT A GLOBAL VARIABLE CALLED 'marketing' IS GOING TO TRY TO BE CREATED!
        // marketing: 'marketing@http://localhost:8081/remoteEntry.js',
      },
      // When we run container and marketing locally and then open up container and look at JS
      // requests, we see that there are some 'vendors-' files coming in from localhost:8084
      // (container) and then others from localhost:8081 (marketing). Butt the names of these files
      // are kinda randomly generated and the name itself doesn't tell you everything about what is
      // actually being imported.
      //
      // Without using the below option or similar, when you open each request's response and search
      // for something like 'node_modules/react/index.js' or whatever, you will find some duplicate
      // information. This duplicate info should go away once using shared. Compare MB of data, too.
      //
      // (Of course, in development these files are not minified so size will still be a bit hefty.)
      //
      // Remember, this is only the dependencies object, not devDependencies which we don't need. If
      // you want to be very very specific about the versions of individual libraries, use array.
      shared: packageJson.dependencies
    }),
  ]
};

module.exports = merge(commonConfig, devConfig);
