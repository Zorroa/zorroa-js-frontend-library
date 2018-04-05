import React, { Component, PropTypes } from 'react'

import Finder from '../Finder'
import spin from './spin.svg'
import Cloudproxy from '../../services/Cloudproxy'

const ROOT_ID = 0

export default class CloudproxyChooser extends Component {
  static propTypes = {
    onSelect: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
  }

  state = {
    files: new Map(),
    rootId: ROOT_ID,
    loading: false,
  }

  cloudproxy = null

  componentWillMount() {
    this.cloudproxy = new Cloudproxy('localhost', this.progress)
    this.loadFiles(ROOT_ID, this.state.rootId)
  }

  progress = stats => {
    console.log('Stats: ' + JSON.stringify(stats))
  }

  loadFiles = (id, parentId) => {
    this.setState({ loading: true })
    const file = id === ROOT_ID ? { path: '/' } : this.state.files.get(id)
    if (!file) return
    this.cloudproxy.listDirectory(file.path, filesystemEntries => {
      const files = new Map(this.state.files)
      const childIds = new Set()
      filesystemEntries.forEach(f => {
        const item = {
          ...f,
          childIds: f.isDirectory ? new Set() : undefined,
          parentId,
        }
        files.set(f.id, item)
        childIds.add(f.id)
      })
      const parent = files.get(parentId)
      const newParent = parent ? { ...parent } : { id: ROOT_ID, name: '/' }
      newParent.childIds = childIds
      files.set(parentId, newParent)
      this.setState({ files, loading: false })
    })
  }

  loadDirectory = id => {
    const file = this.state.files.get(id)
    if (file && file.id && file.childIds && !file.childIds.size) {
      this.loadFiles(file.id, id)
    }
  }

  setRoot = id => {
    this.setState({ rootId: id })
    this.loadDirectory(id)
  }

  render() {
    const { files, loading, rootId, userAccount } = this.state
    const title =
      (userAccount && userAccount.name
        ? userAccount.name.display_name + "'s"
        : 'Unknown') + ' Box'
    const icon = loading ? (
      <img className="DropboxChooser-icon" src={spin} alt="Loading Box" />
    ) : (
      <div
        className="DropboxChooser-icon icon-folder-subfolders"
        title={title}
      />
    )
    return (
      <div className="DropboxChooser">
        <Finder
          items={files}
          rootId={rootId}
          loading={loading}
          onSelect={this.props.onSelect}
          rootIcon={icon}
          onRoot={this.setRoot}
          onOpen={this.loadDirectory}
        />
      </div>
    )
  }
}
