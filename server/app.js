const path = require('path')
const os = require('os')

const express = require('express')
const proxy = require('http-proxy-middleware')

const app = express()
const PORT = process.env.CURATOR_PORT || 8081
const ARCHIVIST_API_URL =
  process.env.ARCHIVIST_API_URL || 'http://localhost:8066'

const archivistProxy = proxy({
  target: ARCHIVIST_API_URL,
  changeOrigin: true,
  // TODO work with devops to fix UNABLE_TO_VERIFY_LEAF_SIGNATURE so secure can be set to `true`
  secure: false,
})

// Serve static files such as CSS and JS
app.use(express.static('bin'))

// These routes should be proxied to the Archivist server
app.use(['/api/*', '/saml/logout', '/actuator/*', '/debug', '/info'], archivistProxy)

// All other routes should be handled by the Curator
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'bin', 'index.html'))
})

// Starts the server
app.listen(PORT, () =>
  console.log(
    `App running\n`,
    `Host: http://${os.hostname().toLowerCase()}:${PORT}\n`,
    `Archivist API host: ${ARCHIVIST_API_URL}\n`,
  ),
)
