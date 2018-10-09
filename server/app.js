const os = require('os')
const http = require('http')
const https = require('https')
const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const middleware = require('webpack-dev-middleware')
const webpackConfig = require('../build/webpack.config.js')
const compiler = webpack(webpackConfig)
const express = require('express')
const app = express()
const PORT = Number(process.env.CURATOR_PORT) || 8081
const PORT_SECURE = Number(process.env.CURATOR_PORT_SECURE)
const ARCHIVIST_API_URL =
  process.env.ARCHIVIST_API_URL || 'http://localhost:8080'
const NODE_ENV = process.env.NODE_ENV || 'production'

if (NODE_ENV === 'development') {
  app.use(middleware(compiler, {}))
}

// Redirect insecure requests first
if (Number.isNaN(PORT_SECURE) === false) {
  app.use((req, res, next) => {
    if (req.secure) {
      return next()
    }

    let urlPort = ''

    if (PORT_SECURE !== 443) {
      urlPort = `:${PORT_SECURE}`
    }

    const redirectUrl = `https://${req.hostname}${urlPort}/`
    res.redirect(301, redirectUrl)
  })
}

// Serve static files such as CSS and JS
app.use(express.static('dist'))

app.get('/favicon.ico', (req, res) => {
  res.sendFile('favicon.ico', {
    root: path.join(__dirname, '..', 'src', 'assets'),
  })
})

// All other routes should be handled by the Curator
app.get('*', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="HandheldFriendly" content="true">
        <meta name="MobileOptimized" content="width">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <title>Zorroa Design Library</title>
      </head>
      <body>
        <script type="application/javascript" src="/app.js"></script>
      </body>
    </html>
  `)
})

const httpServer = http.createServer(app)
httpServer.listen(PORT)

if (PORT_SECURE) {
  const privateKey = fs.readFileSync('key.pem', 'utf8')
  const certificate = fs.readFileSync('cert.pem', 'utf8')
  var credentials = { key: privateKey, cert: certificate }
  const httpsServer = https.createServer(credentials, app)
  httpsServer.listen(PORT_SECURE)
}

const appRunning = `App running\n`
const url = `Host: http://${os.hostname().toLowerCase()}:${PORT}\n`
const seureURL = `Host: https://${os.hostname().toLowerCase()}:${PORT_SECURE}\n`
const apiUrl = `Archivist API host: ${ARCHIVIST_API_URL}\n`
console.log(appRunning, url, seureURL, '\n========================\n\n', apiUrl)
