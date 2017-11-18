const path = require('path')

const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const PATHS = {
  SRC: path.resolve(__dirname, 'app'),
  DIST: path.resolve(__dirname, 'dist')
}

module.exports = {
  entry: [
    path.join(PATHS.SRC, 'index.js'),
    'webpack/hot/dev-server'
  ],
  output: {
    path: PATHS.DIST,
    filename: 'app.bundle.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(PATHS.SRC, 'index.html')
    }),
    new ExtractTextPlugin('style.bundle.css'),
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: [{
        loader: 'babel-loader',
        options: {
          cacheDirectory: true
        }
      }]
    }, {
      test: /\.css$/,
      loader: ExtractTextPlugin.extract({
        use: 'css-loader'
      }),
    }]
  },
  resolve: {
    extensions: ['.js']
  }
}
