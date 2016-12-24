import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { setIsDragging } from '../actions/appActions'
import { bindActionCreators } from 'redux'

export function DropTarget (type, params) {
  const {dragOver, drop} = params

  return function DropTargetFactory (DropComponent) {
    return class DropTargetHOC extends Component {

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
            dragOver(props, type, event)
            event.preventDefault()
          },
          onDrop: (event) => {
            this.setState({dragHover: false})
            drop(props, type, event)
            event.preventDefault()
          }
        }

        return <DropComponent {...props} dragHover={this.state.dragHover} dropparams={dropParams} />
      }
    }
  }
}

export function DragSource (type, params) {
  return function DragSourceFactory (DragComponent) {
    const {dragStart, dragEnd} = params

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
            dragStart(props, type, event)
            // Magic! Delay state update one frame to workaround Chrome
            // drag-and-drop issues when changing the DOM in onDragStart.
            requestAnimationFrame(() => hocActions.setIsDragging(true))
          },
          onDragEnd: (event) => {
            dragEnd(props, type, event)
            hocActions.setIsDragging(false)
          },
          draggable: true
        }

        return <DragComponent {...props} dragparams={dragParams} />
      }
    }

    return connect(state => ({
      app: state.app
    }), dispatch => ({
      hocActions: bindActionCreators({ setIsDragging }, dispatch)
    }))(DragSourceHOC)
  }
}
