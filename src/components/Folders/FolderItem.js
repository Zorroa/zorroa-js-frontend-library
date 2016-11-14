import React, { Component, PropTypes } from 'react'
import { DropTarget } from '../../services/DragDrop'
import classnames from 'classnames'

const target = {
  dragOver (props, type, se) {
    se.preventDefault()
  },
  drop (props, type, se) {
    se.preventDefault()
    // const data = se.dataTransfer.getData('text/plain')

    // // allows us to match drop targets to drag sources
    // if (data === type) {
    //   console.log(props.selectedAssetIds)
    //   // props.dispatch()
    // }
  }
}

@DropTarget('FOLDER', target)
export default class FolderItem extends Component {
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
