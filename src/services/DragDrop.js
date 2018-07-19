import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { startDragging, stopDragging } from '../actions/appActions'

// Decorate drag sources and drop targets to add DnD
// and access drag data in app.state.dragInfo through props.
//
// DragSource must specify a type and return dragInfo data
// from the required dragStart callback. Other callbacks optional.
//
// HOC properties are shared with the wrapped classes, which implies
// you must be careful not to have shared properties, ergo hocActions.
//
// The dragHover state can be accessed in the wrapped class' props
// and typically is used to set a CSS class name to trigger highlighting.
// The dragInfo state is accessible via props in DropTarget classes.
//
// Drag data can optionally be exported to the OS or browser by
// writing into event.dataTransfer.

export function DropTarget({ dragOver, drop }) {
  return function DropTargetFactory(DropComponent) {
    class DropTargetHOC extends Component {
      state = { dragHover: false }

      render() {
        const { props } = this
        const dropParams = {
          onDragEnter: event => {
            this.setState({ dragHover: true })
            return false
          },
          onDragLeave: event => {
            this.setState({ dragHover: false })
            return false
          },
          onDragOver: event => {
            dragOver && dragOver(props, event)
            event.preventDefault()
          },
          onDrop: event => {
            this.setState({ dragHover: false })
            drop && drop(props, event)
            event.preventDefault()
          },
        }

        return (
          <DropComponent
            {...props}
            dragHover={this.state.dragHover}
            dropparams={dropParams}
          />
        )
      }
    }

    return connect(
      state => ({
        dragInfo: state.app.dragInfo, // Passed to callbacks in props
      }),
      null,
    )(DropTargetHOC)
  }
}

export function DragSource(type, { dragStart, dragEnd }) {
  return function DragSourceFactory(DragComponent) {
    class DragSourceHOC extends Component {
      static propTypes = {
        // connect props
        hocActions: PropTypes.object.isRequired,
      }

      render() {
        const { props } = this
        const { hocActions } = props
        const dragParams = {
          onDragStart: event => {
            // Get the dragging object to add to app.state.dragInfo
            const data = dragStart(props, type, event)
            if (type === 'ASSET' && data && data.assetExtIds) {
              event.dataTransfer.setData(
                'text/plain',
                JSON.stringify([...data.assetExtIds]),
              )
            } else {
              // dataTransfer.setData is required to always be called by firefox
              event.dataTransfer.setData('text/plain', '')
            }
            // Magic! Delay state update one frame to workaround Chrome
            // drag-and-drop issues when changing the DOM in onDragStart.
            requestAnimationFrame(() => hocActions.startDragging(type, data))
          },
          onDragEnd: event => {
            dragEnd && dragEnd(props, type, event)
            event.preventDefault()
            hocActions.stopDragging()
          },
          draggable: true,
        }

        return <DragComponent {...props} dragparams={dragParams} />
      }
    }

    return connect(null, dispatch => ({
      hocActions: bindActionCreators({ startDragging, stopDragging }, dispatch),
    }))(DragSourceHOC)
  }
}
