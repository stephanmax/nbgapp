const config = require('./config')
const apiServer = require('./server.api')
const appServer = require('./server.webpack')

const PORT = process.env.PORT || config.port
const PROD = process.env.NODE_ENV === 'production'

if (PROD) {
  apiServer(PORT)
}
else {
  apiServer(PORT - 1)
  appServer(PORT)
}
