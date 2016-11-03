import React, { Component, PropTypes } from 'react'
import { DropTarget } from '../../services/DragDrop'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Collapsible from '../Collapsible'
import CollapsibleHeader from '../CollapsibleHeader'
import { selectFolderIds } from '../../actions/folderAction'

// Recursively renders folder children as Collapsible elements.
// Loads children of displayed items on-demand to display open caret.

const target = {
  dragOver (props, type, se) {
    se.preventDefault()
  },
  drop (props, type, se) {
    se.preventDefault()
    const data = se.dataTransfer.getData('text/plain')

    // allows us to match drop targets to drag sources
    if (data === type) {
      console.log(props.selectedAssetIds)
      // props.dispatch()
    }
  }
}

@DropTarget('FOLDER', target)
class FolderItem extends Component {
  static propTypes = {
    folders: PropTypes.object.isRequired,     // Can this be mapOf(Folder)?
    folderId: PropTypes.number.isRequired,
    isIconified: PropTypes.bool.isRequired,
    loadChildren: PropTypes.func.isRequired,
    dropparams: PropTypes.object,
    selectedAssetIds: PropTypes.any,
    selectedFolderIds: PropTypes.object,
    actions: PropTypes.object
  }

  componentWillMount () {
    const { folderId, loadChildren } = this.props
    loadChildren(folderId)
  }

  select (event) {
    event.stopPropagation()
    const { selectedFolderIds, folderId } = this.props
    const ids = new Set(selectedFolderIds)
    if (ids.has(folderId)) {
      ids.delete(folderId)
    } else {
      ids.add(folderId)
    }
    this.props.actions.selectFolderIds(ids)
  }

  renderHeader (folder) {
    const isSelected = this.props.selectedFolderIds && this.props.selectedFolderIds.has(this.props.folderId)
    const openIcon = folder.isDyhi() ? 'icon-cube' : 'icon-folder2'
    const closeIcon = folder.isDyhi() ? 'icon-cube' : 'icon-folder'
    return (
      <CollapsibleHeader label={folder.name} isIconified={this.props.isIconified} isSelected={isSelected}
                         openIcon={openIcon} closeIcon={closeIcon} onSelect={this.select.bind(this)} />
    )
  }

  render () {
    const { folders, folderId, isIconified, loadChildren, selectedFolderIds, dropparams, actions } = this.props
    const folder = folders.get(folderId)
    return (
      <Collapsible header={this.renderHeader(folder)} dropparams={dropparams} onSelect={this.select.bind(this)} >
        { !isIconified && folder.children !== undefined && folder.children.map(child => (
          <FolderItem key={child.id} isIconified={isIconified} folders={folders}
                      folderId={child.id} loadChildren={loadChildren}
                      actions={actions} selectedFolderIds={selectedFolderIds} />)
        )}
      </Collapsible>
    )
  }
}

export default connect(state => ({
  selectedAssetIds: state.assets.selectedIds,
  selectedFolderIds: state.folders.selectedIds
}), dispatch => ({
  actions: bindActionCreators({ selectFolderIds, dispatch }, dispatch)
}))(FolderItem)
