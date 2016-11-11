import React, { Component, PropTypes } from 'react'
import { DropTarget } from '../../services/DragDrop'
import classnames from 'classnames'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { selectFolderIds, addAssetIdsToFolderId } from '../../actions/folderAction'

// Recursively renders folder children as Collapsible elements.
// Loads children of displayed items on-demand to display open caret.

// BUG! DnD target events are never invoked!

const target = {
  dragOver (props, type, se) {
    se.preventDefault()
  },
  drop (props, type, se) {
    se.preventDefault()
    // allows us to match drop targets to drag sources
    const data = se.dataTransfer.getData('text/plain')
    if (data === type) {
      console.log('Drop ' + props.selectedAssetIds + ' on ' + props.folderId)
      props.actions.addAssetIdsToFolderId([...props.selectedAssetIds], props.folderId)
    }
  }
}

@DropTarget('FOLDER', target)
class FolderItem extends Component {
  static propTypes = {
    // input props
    folder: PropTypes.object.isRequired,
    depth: PropTypes.number.isRequired,
    dropparams: PropTypes.object,
    isOpen: PropTypes.bool.isRequired,
    hasChildren: PropTypes.bool.isRequired,
    isSelected: PropTypes.bool.isRequired,
    onToggle: PropTypes.func,
    onSelect: PropTypes.func
  }

  render () {
    const { folder, depth, isOpen, hasChildren, isSelected, onToggle, onSelect } = this.props
    const icon = folder.isDyhi() ? 'icon-cube' : 'icon-folder'

    return (
      <div className={classnames('FolderItem', { isOpen, hasChildren, isSelected })}
           style={{ paddingLeft:`${(depth - 1) * 10}px` }}>
        <div className='FolderItem-toggle'
             onClick={event => { onToggle(folder); return false }}
        >
          {(hasChildren) ? <i className='FolderItem-toggleArrow icon-triangle-down'/> : null}
        </div>
        <div className='FolderItem-select'
            onClick={event => { onSelect(folder); return false }}
        >
          <i className={`FolderItem-icon ${icon}`}/>
          <div className='FolderItem-text' key={folder.id}>
            {folder.name}
          </div>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  selectedAssetIds: state.assets.selectedIds,
  selectedFolderIds: state.folders.selectedIds
}), dispatch => ({
  actions: bindActionCreators({ selectFolderIds, addAssetIdsToFolderId, dispatch }, dispatch)
}))(FolderItem)
