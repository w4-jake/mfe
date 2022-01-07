// This is an import function call, not an import statement. It is 'dynamic' and does not require
// scripts of type="module".

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports
// When we run 'npm run start' for container, Webpack sees this dynamic import and realizes, oh!
// I can't just statically immediately one time try to load everything in here (since it might not
// be ready yet, it could be loading on a different port.) First must go and fetch whatever
// dependencies are needed, like the library dependencies used for marketing, before actually
// executing this bootstrap code.

// Try opening up the localhost:8084/main.js request and see the response.
// You'll notice that in the eval() statement for ./src/index.js, there is:

// Promise.all(
//   /*! import() */[
//     ...,
//     __webpack_require__.e(\"src_bootstrap_js\")
//   ])
//   .then(__webpack_require__.bind(__webpack_require__, /*! ./bootstrap */ \"./src/bootstrap.js\")

// So rather than immediately try to run bootstrap, it first imports it and some other stuffs and
// only then does it try to execute bootstrap.
// It also means that main.js and bootstrap.js are bundled up into two different files.
import('./bootstrap')

// What happens if we try to statically import here? Well, in local we get these errors:
//   - Failed to load resource: net::ERR_CONNECTION_REFUSED for remoteEntry.js
//     (No resource with given URL found)
//   - main.js:2182 Uncaught Error: Shared module is not available for eager consumption: webpack/sharing/consume/default/react/react
//         at Object.__webpack_require__.m.<computed> (main.js:2182)
//         at __webpack_require__ (main.js:1758)
//         at eval (bootstrap.js:2)
//         at Module../src/bootstrap.js (main.js:767)
//         at __webpack_require__ (main.js:1758)
//         at eval (index.js:2)
//         at Module../src/index.js (main.js:800)
//         at __webpack_require__ (main.js:1758)
//         at main.js:2311
//         at main.js:2314
// So it seems to be trying to use some resources that aren't available yet.
// Also see: https://webpack.js.org/concepts/module-federation/#uncaught-error-shared-module-is-not-available-for-eager-consumption
// import './bootstrap'

// So, when we do 'npm run start' locally for both marketing and container, here is what happens:
//  1. Container main.js is loaded and executed.
//  2. In main.js, browser sess that bootstrap.js is also needed, but is not immediately run.
//  3. So browser starts to fetch what's needed for bootstrap, which means it fetches remoteEntry.
//  4. The remoteEntry for marketing tells browser it needs marketing bootstrap and vendors.
//  5. Following remoteEntry instructions, gets #4, so now fetch and execute container bootstrap.

// We can verify this by looking at the waterfall. First, container main.js is loaded, and then
// container bootstrap and marketing remoteEntry come around the same time, and then all the other
// marketing resources get requested.
// And only after all requests finish does the container bootstrap code run!
// Try throttling to slow 3G to see the steps a little more clearly.
