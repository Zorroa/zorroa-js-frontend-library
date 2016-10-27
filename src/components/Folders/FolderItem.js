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
      loadChildren: PropTypes.func.isRequired,
      sidebarKey: PropTypes.string.isRequired
    }
  }

  componentWillMount () {
    const { folderId, loadChildren } = this.props
    loadChildren(folderId)
  }

  renderHeader (folder) {
    return (
      <CollapsibleHeader label={folder.name} isCollapsed={false}
                         openIcon="icon-folder2" closeIcon="icon-folder"/>
    )
  }

  render () {
    const { folders, folderId, loadChildren } = this.props
    const folder = folders.get(folderId)
    return (
      <Collapsible header={this.renderHeader(folder)} sidebarKey={this.props.sidebarKey}>
        { folder.children !== undefined && folder.children.map(child => (
          <FolderItem key={child.id} folders={folders} folderId={child.id} loadChildren={loadChildren} />)
        )}
      </Collapsible>
    )
  }
}

