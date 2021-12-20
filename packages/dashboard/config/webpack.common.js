const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[name].[contenthash].js'
  },
  // Vue allows you to write .vue Single File Components
  // See: https://kr.vuejs.org/v2/guide/single-file-components.html.
  // So tell webpack to make sure to load up those files too.
  resolve: {
    extensions: ['.js', '.vue']
  },
  module: {
    rules: [
      // This rule is not Vue-specific, it is 'dashboard' specific because of some font files etc.
      {
        test: /\.(png|jpe?g|gif|woff|svg|eot|ttf)$/i,
        use: [
          { loader: 'file-loader' }
        ]
      },
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.scss|\.css$/,
        use: ['vue-style-loader', 'style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime']
          }
        }
      }
    ]
  },
  plugins: [new VueLoaderPlugin()]
}
