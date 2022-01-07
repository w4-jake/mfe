module.exports = {
  module: {
    // This rules array contains a loader. This tells webpack to process some different files as we
    // import them into the project. Babel takes ES 2015, 2016, etc. and puts it into ES5 code that
    // will work in a browser. Very common.
    rules: [
      {
        // This means whenever we import a file ending with .mjs or .js, we want Babel to process
        test: /\.m?js$/,
        // But don't run Babel on any files in this directory.
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            // First preset is for .jsx files as in react-related code, and second takes all the new
            // syntax like ES 2016 and gets it into the form we want.
            presets: ['@babel/preset-react', '@babel/preset-env'],
            // And this adds some additional features like async await syntax.
            plugins: ['@babel/plugin-transform-runtime']
          }
        }
      }
    ]
  }
}
