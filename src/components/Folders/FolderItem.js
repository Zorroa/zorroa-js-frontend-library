import React, { Component, PropTypes } from 'react'
import { DropTarget } from '../../services/DragDrop'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Collapsible from '../Collapsible'
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
    return (
      <div className='FolderItem-header fullWidth'>
        {folder.name}
      </div>
    )
  }

  render () {
    const { folders, folderId, isIconified, loadChildren, selectedFolderIds, dropparams, actions } = this.props
    const folder = folders.get(folderId)
    const isSelected = this.props.selectedFolderIds && this.props.selectedFolderIds.has(this.props.folderId)
    const openIcon = folder.isDyhi() ? 'icon-cube' : 'icon-folder2'
    const closeIcon = folder.isDyhi() ? 'icon-cube' : 'icon-folder'
    const isParent = this.props.folders && (this.props.folders.size > 0)
    const CollapsibleParams = {
      closeIcon: closeIcon,
      dropparams: dropparams,
      header: this.renderHeader(folder),
      isIconified: this.props.isIconified,
      isParent: isParent,
      isSelected: isSelected,
      onSelect: this.select.bind(this),
      openIcon: openIcon
    }
    const FolderItemParams = {
      actions: actions,
      folders: folders,
      isIconified: isIconified,
      loadChildren: loadChildren,
      selectedFolderIds: selectedFolderIds
    }
    return (
      <Collapsible className='FolderItem' {...CollapsibleParams}>
        { !isIconified && folder.children !== undefined && folder.children.map(child => (
          <FolderItem key={child.id} folderId={child.id} {...FolderItemParams} />)
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
