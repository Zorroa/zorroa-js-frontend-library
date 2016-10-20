import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'

import Collapsible from '../Collapsible'

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

  renderFolderItemHeader (isParent, isOpen) {
    const { folders, folderId } = this.props
    const folder = folders.get(folderId)
    return (
      <div className='folderitem-header flexCenter fullWidth'>
        <span className={classnames('folderitem-header-icon', {
          'icon-folder2': isParent && isOpen,
          'icon-folder': isParent && !isOpen})
        }/>
        {folder.name}
        <div className='flexOn'/>
        {isParent && <div className={classnames('folderitem-header-caret', 'icon-arrow-down', { 'rot180': isOpen })}/>}
      </div>
    )
  }

  render () {
    const { folders, folderId, loadChildren } = this.props
    const folder = folders.get(folderId)
    return (
      <Collapsible style={{marginLeft: '16px'}} headerFn={this.renderFolderItemHeader.bind(this)}>
        { folder.children !== undefined && folder.children.map(child => (
          <FolderItem key={child.id} folders={folders} folderId={child.id} loadChildren={loadChildren} />)
        )}
      </Collapsible>
    )
  }
}

