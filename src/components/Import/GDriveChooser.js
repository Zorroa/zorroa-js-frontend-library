import PropTypes from 'prop-types'
import React, { Component } from 'react'

const ROOT_ID = 0

export default class GDriveChooser extends Component {
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

  setRoot = id => {
    this.setState({ rootId: id })
    this.loadDirectory(id)
  }

  render() {
    return (
      <div className="DropboxChooser">
        <div>GDrive support coming soon!</div>
      </div>
    )
  }
}
