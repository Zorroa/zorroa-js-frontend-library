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
            drop.bind(this, props, type)
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
        actions: PropTypes.object.isRequired
      }

      render () {
        const {props} = this
        const {actions} = props
        const dragParams = {
          onDragStart: (event) => {
            dragStart(props, type, event)
            actions.setIsDragging(true)
          },
          onDragEnd: (event) => {
            dragEnd(props, type, event)
            actions.setIsDragging(false)
          },
          draggable: true
        }

        return <DragComponent {...props} dragparams={dragParams} />
      }
    }

    return connect(state => ({
      app: state.app
    }), dispatch => ({
      actions: bindActionCreators({ setIsDragging }, dispatch)
    }))(DragSourceHOC)
  }
}
