import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { getFolderChildren } from '../../actions/folderAction'
import FolderItem from './FolderItem'

// Display all folders, starting with the root.
// Later this will be broken into Collections and Smart Folders.
class Folders extends Component {
  static get propTypes () {
    return {
      folders: PropTypes.object.isRequired,
      actions: PropTypes.object.isRequired,
      sidebarIsOpen: PropTypes.bool.isRequired
    }
  }

  componentWillMount () {
    this.loadChildren(0)
  }

  loadChildren (id) {
    this.props.actions.getFolderChildren(id < 0 ? 0 : id)
  }

  render () {
    const { folders } = this.props
    return (
      <div>
        <FolderItem folders={folders} folderId={-1} loadChildren={this.loadChildren.bind(this)} sidebarIsOpen={this.props.sidebarIsOpen}/>
        <FolderItem folders={folders} folderId={0} loadChildren={this.loadChildren.bind(this)} sidebarIsOpen={this.props.sidebarIsOpen}/>
      </div>
    )
  }
}

export default connect(state => ({
  folders: state.folders.all
}), dispatch => ({
  actions: bindActionCreators({ getFolderChildren }, dispatch)
}))(Folders)
