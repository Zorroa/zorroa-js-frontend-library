import React, { Component, PropTypes } from 'react'
import Dropbox from 'dropbox'

import domUtils from '../../services/domUtils'

export default class DropboxChooser extends Component {
  static propTypes = {
    appKey: PropTypes.string.isRequired,
    path: PropTypes.string
  }

  static defaultProps = {
    path: ''
  }

  state = {
    cursor: '',
    entries: [],
    loading: false,
    accessToken: '',
    authUrl: ''
  }

  authorized = (ev) => {
    if (ev.key === 'DropboxURL') {
      const message = ev.newValue
      const response = domUtils.parseQueryString(message)
      const accessToken = response['http://localhost:8080/dbxauth#access_token']
      console.log('Received: ' + accessToken)
      this.authenticating = false
      this.setState({accessToken, loading: true})
      localStorage.removeItem(ev.key)
      this.loadFiles(accessToken)
    }
  }

  loadFiles = (accessToken) => {
    // Create an instance of Dropbox with the access token and use it to
    // fetch and render the files in the users root directory.
    const dbx = new Dropbox({ accessToken })
    dbx.filesListFolder({path: ''})
      .then((response) => {
        console.log(response)
        const files = response.entries
        const cursor = response.cursor
        this.setState({files, cursor, loading: false})
      })
      .catch((error) => {
        console.log(error)
        this.setState({files: [], loading: false})
      })
  }

  componentWillMount () {
    const { accessKey } = this.state
    const { appKey, path } = this.props

    // Listen for changes to local storage to capture return URL from
    // Dropbox OAuth2 redirect in popup window
    window.addEventListener('storage', this.authorized)

    if (accessKey && accessKey.length) {
      this.loadFiles(accessKey)
    } else {
      // const authUrl = 'http://localhost:8066/#access_token=gnXMnC4kaSAAAAAAAAABcjGEFV6hNSMs-L3xJ3D6qGF9SFNW2LJ2YcdSUTwNX4h8&token_type=bearer&uid=542065014&account_id=dbid%3AAAALlZIpNztmWVNtxx53n-gH4N0bhq_YnJQ'
      // Set the login anchors href using dbx.getAuthenticationUrl()
      const dbx = new Dropbox({ clientId: appKey })
      const state = Math.random().toString(36).substring(7)
      const authUrl = dbx.getAuthenticationUrl('http://localhost:8080/dbxauth', state)
      console.log('Auth URL: ' + authUrl)
      this.setState({authUrl})
    }
  }

  popupAuthenticator = () => {
    if (this.authenticating) return
    this.authenticating = true
    console.log('Popup Dropbox authenticator')
    const { authUrl } = this.state
    const w = 420
    const h = 420
    const left = screen.width / 2 - w / 2
    const top = screen.height / 2 - h / 2
    const strWindowFeatures = `left=${left},top=${top},width=${w},height=${h},dialog=yes,resizable=no,status=no,dependent=yes,toolbar=no,location=no,directories=no,menubar=no,copyhistory=no`
    window.open(authUrl, 'Zorroa Dropbox', strWindowFeatures)
  }

  render () {
    const { files, loading, accessToken } = this.state
    const wait = require('../Assets/ellipsis.gif')
    if (!accessToken || !accessToken.length) {
      this.popupAuthenticator()
    }
    return (
      <div className="DropboxChooser">
        <div className="DropboxChooser-title">
          <div className="icon-folder-subfolders"/>
          <div className="DropboxChooser-title-label">Dropbox Chooser</div>
        </div>
        { (loading || this.authenticating) && <img src={wait} className="DropboxChooser-wait"/> }
        { files && files.map(file => (
          <div key={file.id} className="DropboxChooser-file">
            <div className={`DropboxChooser-file-icon icon-${file['.tag'] === 'folder' ? 'folder' : 'file-empty'}`}/>
            {file.name}
          </div>
        ))}
      </div>
    )
  }
}
