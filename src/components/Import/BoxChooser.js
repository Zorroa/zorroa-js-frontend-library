import React, { Component, PropTypes } from 'react'
import axios from 'axios'

import { BoxAuthenticator } from './BoxAuthenticator'
import Finder from '../Finder'
import spin from './spin.svg'

const ROOT_ID = 0

export default class BoxChooser extends Component {
  static propTypes = {
    onSelect: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
    accessToken: PropTypes.string.isRequired,
  }

  state = {
    files: new Map(),
    rootId: ROOT_ID,
    loading: false,
  }

  componentWillMount() {
    this.loadFiles(ROOT_ID, this.state.rootId)
  }

  loadFiles = (id, parentId) => {
    // Create an instance of Box with the access token and use it to
    // fetch and render the files in the users root directory.
    const { accessToken } = this.props
    const box = axios.create({
      baseURL: 'https://api.box.com/2.0',
      headers: { Authorization: 'Bearer ' + accessToken },
    })
    this.setState({ loading: true })
    const endpoint = '/folders/' + id + '/items'
    box
      .get(endpoint)
      .then(response => {
        const files = new Map(this.state.files)
        const childIds = new Set()
        response.data.entries.forEach(f => {
          const item = {
            id: f.id,
            childIds: f.type === 'folder' ? new Set() : undefined,
            name: f.name,
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
      .catch(error => {
        console.log(error)
        this.setState({ files: new Map(), loading: false })
        BoxAuthenticator.deauthorize()
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
