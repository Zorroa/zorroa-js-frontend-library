import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { startDragging, stopDragging } from '../actions/appActions'

export function DropTarget ({dragOver, drop}) {
  return function DropTargetFactory (DropComponent) {
    class DropTargetHOC extends Component {

      state = {dragHover: false}

      render () {
        const {props} = this
        const dropParams = {
          onDragEnter: (event) => {
            this.setState({dragHover: true})
            return false
          },
          onDragLeave: (event) => {
            this.setState({dragHover: false})
            return false
          },
          onDragOver: (event) => {
            dragOver && dragOver(props, event)
            event.preventDefault()
          },
          onDrop: (event) => {
            this.setState({dragHover: false})
            drop && drop(props, event)
            event.preventDefault()
          }
        }

        return <DropComponent {...props} dragHover={this.state.dragHover} dropparams={dropParams} />
      }
    }

    return connect(state => ({
      dragInfo: state.app.dragInfo    // Passed to callbacks in props
    }), null)(DropTargetHOC)
  }
}

export function DragSource (type, {dragStart, dragEnd}) {
  return function DragSourceFactory (DragComponent) {
    class DragSourceHOC extends Component {
      static propTypes = {
        // connect props
        hocActions: PropTypes.object.isRequired
      }

      render () {
        const {props} = this
        const {hocActions} = props
        const dragParams = {
          onDragStart: (event) => {
            // Get the dragging object to add to app.state.dragInfo
            const data = dragStart(props, type, event)
            // Magic! Delay state update one frame to workaround Chrome
            // drag-and-drop issues when changing the DOM in onDragStart.
            requestAnimationFrame(() => hocActions.startDragging(type, data))
          },
          onDragEnd: (event) => {
            dragEnd && dragEnd(props, type, event)
            event.preventDefault()
            hocActions.stopDragging()
          },
          draggable: true
        }

        return <DragComponent {...props} dragparams={dragParams} />
      }
    }

    return connect(null, dispatch => ({
      hocActions: bindActionCreators({ startDragging, stopDragging }, dispatch)
    }))(DragSourceHOC)
  }
}
