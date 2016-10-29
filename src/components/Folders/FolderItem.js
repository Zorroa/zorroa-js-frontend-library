import React, { Component, PropTypes } from 'react'

import Collapsible from '../Collapsible'
import CollapsibleHeader from '../CollapsibleHeader'

// Recursively renders folder children as Collapsible elements.
// Loads children of displayed items on-demand to display open caret.
export default class FolderItem extends Component {
  static get propTypes () {
    return {
      folders: PropTypes.object.isRequired,     // Can this be mapOf(Folder)?
      folderId: PropTypes.number.isRequired,
      loadChildren: PropTypes.func.isRequired
    }
  }

  componentWillMount () {
    const { folderId, loadChildren } = this.props
    loadChildren(folderId)
  }

  renderHeader (folder) {
    const openIcon = folder.isDyhi() ? 'icon-cube' : 'icon-folder2'
    const closeIcon = folder.isDyhi() ? 'icon-cube' : 'icon-folder'
    return (
      <CollapsibleHeader label={folder.name} isCollapsed={false}
                         openIcon={openIcon} closeIcon={closeIcon} />
    )
  }

  render () {
    const { folders, folderId, loadChildren } = this.props
    const folder = folders.get(folderId)
    return (
      <Collapsible header={this.renderHeader(folder)}>
        { folder.children !== undefined && folder.children.map(child => (
          <FolderItem key={child.id} folders={folders} folderId={child.id} loadChildren={loadChildren} />)
        )}
      </Collapsible>
    )
  }
}

