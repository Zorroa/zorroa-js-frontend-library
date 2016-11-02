import React, { Component, PropTypes } from 'react'
import { testDragDrop } from '../../actions/assetsAction'
import { DropTarget } from '../../services/DragDrop'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Collapsible from '../Collapsible'
import CollapsibleHeader from '../CollapsibleHeader'

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
      console.log(props.selectedIds)
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
    selectedIds: PropTypes.any
  }

  componentWillMount () {
    const { folderId, loadChildren } = this.props
    loadChildren(folderId)
  }

  renderHeader (folder) {
    const openIcon = folder.isDyhi() ? 'icon-cube' : 'icon-folder2'
    const closeIcon = folder.isDyhi() ? 'icon-cube' : 'icon-folder'
    return (
      <CollapsibleHeader label={folder.name} isIconified={this.props.isIconified}
                         openIcon={openIcon} closeIcon={closeIcon} />
    )
  }

  render () {
    const { folders, folderId, isIconified, loadChildren, dropparams } = this.props
    const folder = folders.get(folderId)
    return (
      <Collapsible header={this.renderHeader(folder)} dropparams={dropparams}>
        { !isIconified && folder.children !== undefined && folder.children.map(child => (
          <FolderItem key={child.id} isIconified={isIconified} folders={folders} folderId={child.id} loadChildren={loadChildren} />)
        )}
      </Collapsible>
    )
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({dispatch}, dispatch)
}

function mapStateToProps (state) {
  return {
    selectedIds: state.assets.selectedIds
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FolderItem)
