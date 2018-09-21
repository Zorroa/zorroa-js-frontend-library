const os = require('os')
const http = require('http')
const https = require('https')
const fs = require('fs')
const webpack = require('webpack')
const packageJson = require('../package.json')
const middleware = require('webpack-dev-middleware')
const webpackConfig = require('../build/webpack.config.js')
const compiler = webpack(webpackConfig)
const express = require('express')
const app = express()
const proxy = require('http-proxy-middleware')
const PORT = process.env.CURATOR_PORT || 8081
const PORT_SECURE = process.env.CURATOR_PORT_SECURE
const ARCHIVIST_API_URL =
  process.env.ARCHIVIST_API_URL || 'http://localhost:8080'
const WHITELABEL_CONFIGURATION = process.env.WHITELABEL_CONFIGURATION || '{}'
const NODE_ENV = process.env.NODE_ENV || 'production'

const archivistProxy = proxy({
  target: ARCHIVIST_API_URL,
  changeOrigin: true,
  // TODO work with devops to fix UNABLE_TO_VERIFY_LEAF_SIGNATURE so secure can be set to `true`
  secure: false,
  proxyTimeout: 10000,
  timeout: 10000,
})

function getWhitelabelConfiguration() {
  try {
    return JSON.parse(WHITELABEL_CONFIGURATION) || {}
  } catch (error) {
    console.error(error)
    return {}
  }
}

if (NODE_ENV === 'development') {
  app.use(middleware(compiler, {}))
}

// Redirect insecure requests first
if (PORT_SECURE) {
  app.use((req, res, next) => {
    if (req.secure) {
      return next()
    }

    const redirectUrl = `https://${req.hostname}/`
    res.redirect(301, redirectUrl)
  })
}

// Serve static files such as CSS and JS
app.use(express.static('dist'))

// These routes should be proxied to the Archivist server
app.use(['/api/*', '/saml/*', '/actuator/*', '/debug', '/info'], archivistProxy)

app.get('/curator/api/whitelabel', (req, res) => {
  res.json(getWhitelabelConfiguration())
})

app.get('/favicon.ico', (req, res) => {
  const whitelabelSettings = getWhitelabelConfiguration()

  if (!whitelabelSettings.favicon) {
    res.status(404)
    res.send('No favicon configured')
    return
  }

  const icon = Buffer.from(whitelabelSettings.favicon || '', 'base64')
  res.setHeader('Content-Length', icon.length)
  res.setHeader('Content-Type', 'image/x-icon')
  res.end(icon)
})

app.get('/version.html', (req, res) => {
  res.send(packageJson.version)
})

// All other routes should be handled by the Curator
app.get('*', (req, res) => {
  const whitelabelSettings = getWhitelabelConfiguration()
  const context = Object.assign(whitelabelSettings)
  // TODO add version details

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
        <title>${context.title || 'Zorroa'}</title>
      </head>
      <body>
        <script type="application/javascript" src="/app.js?${
          context.version
        }"></script>
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
