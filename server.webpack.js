const webpack = require('webpack')
const webpackDevServer = require('webpack-dev-server')

const config = require('./webpack.config.js')

module.exports = (PORT) => {
  config.entry.push(`webpack-dev-server/client?http://localhost:${PORT}/`)

  const server = new webpackDevServer(webpack(config), {
    contentBase: 'app',
    hot: true,
    proxy: {
      "*" : `http://localhost:${PORT - 1}`
    }
  })

  server.listen(PORT, 'localhost')
}
