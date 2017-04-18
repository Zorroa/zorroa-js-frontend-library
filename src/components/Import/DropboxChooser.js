import React, { Component, PropTypes } from 'react'
import Dropbox from 'dropbox'

import Finder from '../Finder'
import spin from './spin.svg'

const ROOT_ID = 0
const ROOT_PATH = '/'

export default class DropboxChooser extends Component {
  static propTypes = {
    onSelect: PropTypes.func.isRequired,
    accessToken: PropTypes.string.isRequired
  }

  state = {
    files: new Map(),
    rootPath: ROOT_PATH,
    rootId: ROOT_ID,
    cursor: '',
    loading: false
  }

  componentWillMount () {
    this.loadFiles(this.state.rootPath, this.state.rootId)
  }

  loadFiles = (path, parentId) => {
    if (path === '/') path = ''
    // Create an instance of Dropbox with the access token and use it to
    // fetch and render the files in the users root directory.
    const { accessToken } = this.props
    const dbx = new Dropbox({ accessToken })
    dbx.usersGetCurrentAccount()
      .then((response) => {
        console.log(response)
        this.setState({userAccount: response})
      })

    this.setState({loading: true})
    dbx.filesListFolder({path})
      .then((response) => {
        console.log(response)
        const files = new Map(this.state.files)
        const childIds = new Set()
        response.entries.forEach(f => {
          const item = {
            id: f.id,
            childIds: f['.tag'] === 'folder' ? new Set() : undefined,
            name: f.name,
            path: f.path_lower,
            metadata: f
          }
          files.set(f.id, item)
          childIds.add(f.id)
        })
        const parent = files.get(parentId)
        const newParent = parent ? { ...parent } : { id: ROOT_ID, path: ROOT_PATH, name: '/' }
        newParent.childIds = childIds
        files.set(parentId, newParent)
        const cursor = response.cursor
        this.setState({files, cursor, loading: false})
      })
      .catch((error) => {
        console.log(error)
        this.setState({files: new Map(), loading: false})
      })
  }

  loadDirectory = (id) => {
    const file = this.state.files.get(id)
    if (file && file.metadata && file.metadata.path_lower.length > 1) {
      this.loadFiles(file.metadata.path_lower, id)
    }
  }

  setRoot = (rootPath) => {
    const root = [...this.state.files.values()].find(file => (file.path === rootPath))
    if (root) {
      const rootId = root.id
      this.setState({rootPath, rootId})
      this.loadDirectory(rootId)
    }
  }

  render () {
    const { files, loading, rootPath, rootId, userAccount } = this.state
    const title = (userAccount && userAccount.name ? userAccount.name.display_name + '\'s' : 'Unknown') + ' Dropbox'
    const icon = loading ? <img className="DropboxChooser-icon" src={spin} alt="Loading Dropbox"/> : <div className="DropboxChooser-icon icon-folder-subfolders" title={title}/>
    return (
      <div className="DropboxChooser">
        <Finder items={files} rootPath={rootPath} rootId={rootId} loading={loading}
                onSelect={this.props.onSelect}
                rootIcon={icon}
                onRoot={this.setRoot}
                onOpen={this.loadDirectory} />
      </div>
    )
  }
}