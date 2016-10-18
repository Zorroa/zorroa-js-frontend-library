import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { getFolderChildren } from '../../actions/folderAction'
import FolderItem from './FolderItem'

// Display all folders, starting with the root.
// Later this will be broken into Collections and Smart Folders.
class Folders extends Component {
  static propTypes = {
    folders: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
  }

  componentWillMount () {
    this.loadChildren(0)
  }

  loadChildren (id) {
    this.props.actions.getFolderChildren(id)
  }

  render () {
    const { folders } = this.props
    return (
      <FolderItem folders={folders} folderId={0} loadChildren={this.loadChildren.bind(this)}/>
    )
  }
}

export default connect(state => ({
  folders: state.folders.all
}), dispatch => ({
  actions: bindActionCreators({ getFolderChildren }, dispatch)
}))(Folders)
