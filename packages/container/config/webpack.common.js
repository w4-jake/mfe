const HtmlWebpackPlugin = require('html-webpack-plugin')

// This is just copied from the marketing config.

module.exports = {
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react', '@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime']
          }
        }
      }
    ]
  },
  plugins: [
    // We ALWAYS will populate index.html this way for container, so in common config file.
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ],
}
