import React, { Component, PropTypes } from 'react'

const ROOT_ID = 0

export default class GDriveChooser extends Component {
  static propTypes = {
    onSelect: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
    accessToken: PropTypes.string.isRequired
  }

  state = {
    files: new Map(),
    rootId: ROOT_ID,
    loading: false
  }

  componentWillMount () {
    this.loadFiles(ROOT_ID, this.state.rootId)
  }

  loadFiles = (id, parentId) => {
  }

  loadDirectory = (id) => {
    const file = this.state.files.get(id)
    if (file && file.id && file.childIds && !file.childIds.size) {
      this.loadFiles(file.id, id)
    }
  }

  setRoot = (id) => {
    this.setState({rootId: id})
    this.loadDirectory(id)
  }

  render () {
    return (
      <div className="DropboxChooser">
        <div>
          GDrive support coming soon!
        </div>
      </div>
    )
  }
}
