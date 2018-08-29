const path = require('path')
const os = require('os')
const http = require('http')
const https = require('https')
const fs = require('fs')

const express = require('express')
const proxy = require('http-proxy-middleware')

const privateKey = fs.readFileSync('key.pem', 'utf8')
const certificate = fs.readFileSync('cert.pem', 'utf8')
var credentials = { key: privateKey, cert: certificate }

const app = express()

const PORT = process.env.CURATOR_PORT || 8081
const PORT_SECURE = process.env.CURATOR_PORT_SECURE || 8443
const ARCHIVIST_API_URL =
  process.env.ARCHIVIST_API_URL || 'http://localhost:8080'
const WHITELABEL_CONFIGURATION = process.env.WHITELABEL_CONFIGURATION || '{}'

const archivistProxy = proxy({
  target: ARCHIVIST_API_URL,
  changeOrigin: true,
  // TODO work with devops to fix UNABLE_TO_VERIFY_LEAF_SIGNATURE so secure can be set to `true`
  secure: false,
})

// Redirect insecure requests first
app.use((req, res, next) => {
  if (req.secure) {
    return next()
  }

  const redirectUrl = `https://${req.hostname}/`
  res.redirect(301, redirectUrl)
})

// Serve static files such as CSS and JS
app.use(express.static('bin'))

// These routes should be proxied to the Archivist server
app.use(['/api/*', '/saml/*', '/actuator/*', '/debug', '/info'], archivistProxy)

app.get('/curator/api/whitelabel', (req, res) => {
  res.json(JSON.parse(WHITELABEL_CONFIGURATION))
})

// All other routes should be handled by the Curator
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'bin', 'index.html'))
})

const httpServer = http.createServer(app)
const httpsServer = https.createServer(credentials, app)

httpServer.listen(PORT)
httpsServer.listen(PORT_SECURE)
const appRunning = `App running\n`
const url = `Host: http://${os.hostname().toLowerCase()}:${PORT}\n`
const seureURL = `Host: https://${os.hostname().toLowerCase()}:${PORT_SECURE}\n`
const apiUrl = `Archivist API host: ${ARCHIVIST_API_URL}\n`
console.log(appRunning, url, seureURL, '\n========================\n\n', apiUrl)
