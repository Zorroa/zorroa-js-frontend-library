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
    isIconified: PropTypes.bool.isRequired,
    actions: PropTypes.object.isRequired
  }

  componentWillMount () {
    this.loadChildren(0)
  }

  loadChildren (id) {
    this.props.actions.getFolderChildren(id < 0 ? 0 : id)
  }

  render () {
    const { folders, isIconified } = this.props
    return (
      <div className='Folders'>
        <FolderItem folders={folders} folderId={-1} isIconified={isIconified} loadChildren={this.loadChildren.bind(this)}/>
        <FolderItem folders={folders} folderId={0} isIconified={isIconified} loadChildren={this.loadChildren.bind(this)}/>
      </div>
    )
  }
}

export default connect(state => ({
  folders: state.folders.all
}), dispatch => ({
  actions: bindActionCreators({ getFolderChildren }, dispatch)
}))(Folders)
