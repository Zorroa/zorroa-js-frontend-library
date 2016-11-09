import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { getFolderChildren, deleteFolderIds } from '../../actions/folderAction'
import FolderItem from './FolderItem'
import CreateFolder from './CreateFolder'

// Display all folders, starting with the root.
// Later this will be broken into Collections and Smart Folders.
class Folders extends Component {
  static propTypes = {
    folders: PropTypes.object.isRequired,
    selectedIds: PropTypes.object,
    isIconified: PropTypes.bool.isRequired,
    actions: PropTypes.object.isRequired
  }

  componentWillMount () {
    this.loadChildren(0)
  }

  loadChildren (id) {
    this.props.actions.getFolderChildren(id)
  }

  deleteFolder () {
    this.props.actions.deleteFolderIds(this.props.selectedIds)
  }

  render () {
    const { folders, isIconified, selectedIds } = this.props
    const isFolderSelected = selectedIds && selectedIds.size > 0
    const parentId = selectedIds && selectedIds.size === 1 && selectedIds.values().next().value
    return (
      <div className='Folders'>
        <div className="Folders-controls flexRow">
          <CreateFolder isIconified={isIconified} parentId={parentId}/>
          <button disabled={!isFolderSelected} onClick={this.deleteFolder.bind(this)}><span className="icon-trash2"/>&nbsp;Delete Folder</button>
        </div>
        <FolderItem folders={folders} folderId={-1} isIconified={isIconified} loadChildren={this.loadChildren.bind(this)}/>
        <FolderItem folders={folders} folderId={-2} isIconified={isIconified} loadChildren={this.loadChildren.bind(this)}/>
      </div>
    )
  }
}

export default connect(state => ({
  folders: state.folders.all,
  selectedIds: state.folders.selectedIds
}), dispatch => ({
  actions: bindActionCreators({ getFolderChildren, deleteFolderIds }, dispatch)
}))(Folders)
