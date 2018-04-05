import axios from 'axios'
import CloudproxyStats from '../models/CloudproxyStats'
import CloudproxySettings from '../models/CloudproxySettings'
import FilesystemEntry from '../models/FilesystemEntry'

export default class Cloudproxy {
  stats = null
  statInterval = null
  onProgress = null

  constructor(server, onProgress) {
    this.onProgress = onProgress
    if (server) this.initialize(server)
  }

  initialize(server) {
    const url = 'http://' + server + ':8090'
    if (this.cloudproxy && this.cloudproxy.baseURL === url) return
    this.cloudproxy = axios.create({
      baseURL: url,
      headers: { withCredentials: true },
    })
  }

  start() {
    if (!this.cloudproxy) return
    if (this.statInterval) clearInterval(this.statInterval)
    this.getStats(true /* immediate */)
    this.statInterval = setInterval(this.getStats, 1500)
  }

  stop() {
    clearInterval(this.statInterval)
    this.statInterval = null
  }

  getStats = immediate => {
    if (!this.cloudproxy) return
    this.cloudproxy
      .get('/api/v1/stats', { timeout: 1000 })
      .then(response => {
        console.log('CloudproxyStats: ' + JSON.stringify(response.data))
        if (!this.stats)
          setTimeout(_ => this.onProgress(this.stats), immediate ? 1 : 1500)
        this.stats = new CloudproxyStats(response.data)
      })
      .catch(error => {
        console.log('Error getting stats: ' + error)
      })
  }

  import = (archivistUrl, hmacKey, authUser, paths) => {
    const settings = new CloudproxySettings({
      archivistUrl,
      hmacKey,
      authUser,
      paths,
      startNow: true,
      schedule: null,
      threads: 1,
      pipelineId: -1,
    })
    console.log('Starting cloudproxy: ' + JSON.stringify(settings))
    this.cloudproxy
      .put('/api/v1/settings', settings)
      .then(response => {
        console.log('Started cloudproxy: ' + JSON.stringify(response.data))
      })
      .catch(error => {
        console.log('Cloudproxy error: ' + error)
      })
  }

  cancel = () => {
    if (!this.stats || !this.stats.active) return
    console.log('Canceling cloudproxy')
    this.cloudproxy
      .delete('/api/v1/import')
      .then(response => {
        console.log('Deleted ' + JSON.stringify(response.data))
      })
      .catch(error => {
        console.log('Error canceling cloudproxy: ' + error)
      })
  }

  listDirectory = (path, closure) => {
    this.cloudproxy
      .put('/api/v1/files/_path', { path })
      .then(response => {
        console.log(
          'Got files at ' + path + ': ' + JSON.stringify(response.data),
        )
        const files = response.data.map(f => new FilesystemEntry(f))
        closure(files)
      })
      .catch(console.log('Error getting files at path: ' + path))
  }
}
