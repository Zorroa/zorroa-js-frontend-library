import React, { Component } from 'react'

export function DropTarget (type, params) {
  const {dragOver, drop} = params

  return function DropTargetFactory (DropComponent) {
    return class DropTargetHOC extends Component {
      render () {
        const {props} = this
        const dropParams = {
          onDragOver: dragOver.bind(this, props, type),
          onDrop: drop.bind(this, props, type)
        }
        return <DropComponent {...this.props} type={type} dropparams={dropParams} />
      }
    }
  }
}

export function DragSource (type, params) {
  return function DragSourceFactory (DragComponent) {
    const {dragStart, dragEnd} = params

    return class DragSourceHOC extends Component {
      render () {
        const {props} = this
        const dragParams = {
          onDragStart: dragStart.bind(this, props, type),
          onDragEnd: dragEnd.bind(this, props, type),
          draggable: true
        }

        return <DragComponent type={type} {...props} dragparams={dragParams} />
      }
    }
  }
}
