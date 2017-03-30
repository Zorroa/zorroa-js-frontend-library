import React, { Component, PropTypes } from 'react'
import Dropbox from 'dropbox'
import classnames from 'classnames'
import domUtils from '../../services/domUtils'

export const DropboxAuth = () => {
  const response = domUtils.parseQueryString(window.location.toString())
  const accessToken = response[DropboxChooser.redirectURL()]
  localStorage.setItem('DropboxAccessToken', accessToken)
  window.close()
  return <div>Dropbox Authorized</div>
}

export default class DropboxChooser extends Component {
  static propTypes = {
    appKey: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    path: PropTypes.string
  }

  static defaultProps = {
    path: ''
  }

  state = {
    files: [],
    cursor: '',
    entries: [],
    loading: false,
    accessToken: localStorage.getItem('DropboxAccessToken'),
    authUrl: '',
    selectedFiles: new Map()
  }

  static redirectURL = () => (`${window.location.origin}/dbxauth#access_token`)

  authorized = (ev) => {
    if (ev.key === 'DropboxAccessToken') {
      const accessToken = ev.newValue
      console.log('Received: ' + accessToken)
      this.authenticating = false
      this.setState({accessToken, loading: true})
      this.loadFiles(accessToken)
    }
  }

  deauthorize = () => {
    localStorage.removeItem('DropboxURL')
    localStorage.removeItem('DropboxAccessToken')
    this.setState({files: [], cursor: '', entries: [], accessToken: '', authUrl: '', selectedFiles: new Map()})
    this.authorize()
  }

  authorize = () => {
    const { appKey } = this.props
    // const authUrl = 'http://localhost:8066/#access_token=gnXMnC4kaSAAAAAAAAABcjGEFV6hNSMs-L3xJ3D6qGF9SFNW2LJ2YcdSUTwNX4h8&token_type=bearer&uid=542065014&account_id=dbid%3AAAALlZIpNztmWVNtxx53n-gH4N0bhq_YnJQ'
    // Set the login anchors href using dbx.getAuthenticationUrl()
    const dbx = new Dropbox({ clientId: appKey })
    const state = Math.random().toString(36).substring(7)
    const authUrl = dbx.getAuthenticationUrl(DropboxChooser.redirectURL(), state)
    console.log('Auth URL: ' + authUrl)
    this.setState({authUrl})
  }

  loadFiles = (accessToken) => {
    // Create an instance of Dropbox with the access token and use it to
    // fetch and render the files in the users root directory.
    const dbx = new Dropbox({ accessToken })
    dbx.usersGetCurrentAccount()
      .then((response) => {
      console.log(response)
        this.setState({userAccount: response})
      })

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
    const { accessToken } = this.state

    // Listen for changes to local storage to capture return URL from
    // Dropbox OAuth2 redirect in popup window
    window.addEventListener('storage', this.authorized)

    if (accessToken && accessToken.length) {
      this.loadFiles(accessToken)
    } else {
      this.authorize()
    }
  }

  popupAuthenticator = () => {
    if (this.authenticating) return
    this.authenticating = true
    console.log('Popup Dropbox authenticator')
    const { authUrl } = this.state
    const w = 420
    const h = 460
    const wLeft = window.screenLeft ? window.screenLeft : window.screenX;
    const wTop = window.screenTop ? window.screenTop : window.screenY;
    const left = wLeft + (window.innerWidth / 2) - (w / 2);
    const top = wTop + (window.innerHeight / 2) - (h / 2);
    const strWindowFeatures = `left=${left},top=${top},width=${w},height=${h},dialog=yes,resizable=no,status=no,dependent=yes,toolbar=no,location=no,directories=no,menubar=no,copyhistory=no`
    window.open(authUrl, 'Zorroa Dropbox', strWindowFeatures)
  }

  selectFile = (file, event) => {
    console.log('Select file: ' + file)
    const selectedFiles = new Map(this.state.selectedFiles)
    if (selectedFiles.has(file.id)) {
      selectedFiles.delete(file.id)
    } else {
      selectedFiles.set(file.id, file)
    }
    this.setState({selectedFiles})
    this.props.onChange(selectedFiles, this.state.accessToken)
  }

  render () {
    const { files, loading, accessToken, selectedFiles, userAccount } = this.state
    const wait = require('../Assets/ellipsis.gif')
    if (!accessToken || !accessToken.length) {
      this.popupAuthenticator()
    }
    return (
      <div className="DropboxChooser">
        <div className="DropboxChooser-title">
          <div className="DropboxChooser-title-left">
            <div className="icon-folder-subfolders"/>
            <div className="DropboxChooser-title-label">{userAccount && userAccount.name ? userAccount.name.display_name + '\'s' : 'Unknown'} Dropbox</div>
          </div>
          <div className="DropboxChooser-logout" onClick={this.deauthorize}>Logout</div>
        </div>
        <div className="DropboxChooser-body">
          { (loading || this.authenticating) && <img src={wait} className="DropboxChooser-wait"/> }
          { files && files.map(file => (
            <div key={file.id} onClick={e => this.selectFile(file, e)}
                 className={classnames('DropboxChooser-file', {selected: selectedFiles.has(file.id)})}>
              <div className={`DropboxChooser-file-icon icon-${file['.tag'] === 'folder' ? 'folder' : 'file-empty'}`}/>
              {file.name}
            </div>
          ))}
        </div>
      </div>
    )
  }
}
