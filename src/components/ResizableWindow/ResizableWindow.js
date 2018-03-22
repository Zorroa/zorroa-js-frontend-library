import React, { Component, PropTypes } from 'react'

import Resizer from '../../services/Resizer'

const minWidth = 160
const minHeight = 160

export default class ResizableWindow extends Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    onMove: PropTypes.func,
    title: PropTypes.node,
    left: PropTypes.number,
    top: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
    children: PropTypes.node,
    preventOutOfBounds: PropTypes.boolean
  }

  static defaultProps = {
    left: 20,
    top: 80,
    width: 300,
    height: 500
  }

  state = {
    left: this.props.left,
    top: this.props.top,
    width: this.props.width,
    height: this.props.height
  }

  componentWillMount () {
    this.resizer = new Resizer()
  }

  componentWillUnmount () {
    this.resizer.release()
  }

  moveHeader = (left, top) => {
    if (this.props.preventOutOfBounds === true) {
      this.setState(prevState => ({
        left: Math.max(
          prevState.width * 0.1 - prevState.width, // Allows up to 90% of the window to be off screen left
          Math.min(left, window.innerWidth - prevState.width * 0.1) // Alows up to 90% of the window to be off screen right
        ),
        top: Math.max(
          0, // The top dragger (i.e. the header) can't ever be off the screen, otherwise you can't drag
          Math.min(top, window.innerHeight - prevState.height * 0.1)) // Allows window to be up to 90% off the bottom screen
      }))
      return
    }

    this.setState({
      left,
      top
    })
  }

  moveLeft = (left) => {
    let width = this.state.width + this.state.left - left
    if (width < minWidth) {
      left -= minWidth - width
      width = minWidth
    }
    this.setState({left, width})
  }

  moveRight = (width) => {
    if (width < minWidth) width = minWidth
    this.setState({width})
  }

  moveBottom = (width, height) => {
    if (height < minHeight) height = minHeight
    this.setState({height})
  }

  moveLowerLeft = (left, height) => {
    let width = this.state.width + this.state.left - left
    if (width < minWidth) {
      left -= minWidth - width
      width = minWidth
    }
    if (height < minHeight) height = minHeight
    this.setState({left, width, height})
  }

  moveLowerRight = (width, height) => {
    if (width < minWidth) width = minWidth
    if (height < minHeight) height = minHeight
    this.setState({width, height})
  }

  release = () => {
    const { onMove } = this.props
    if (onMove) onMove({ ...this.state })
  }

  render () {
    const { title, children, onClose } = this.props
    const { top, left, width, height } = this.state
    return (
      <div className="ResizableWindow" style={this.state}>
        <div onMouseDown={_ => this.resizer.capture(this.moveHeader, this.release, left, top)}
             className="ResizableWindow-header">
          <div className="ResizableWindow-title">
            {title}
          </div>
          <div onClick={onClose} className="ResizableWindow-close icon-cross"/>
        </div>
        <div className="ResizableWindow-body">
          { children }
        </div>
        <div onMouseDown={_ => this.resizer.capture(this.moveLeft, this.release, left, top)}
             className="ResizeableWindow-handle ResizableWindow-left-handle"/>
        <div onMouseDown={_ => this.resizer.capture(this.moveRight, this.release, width, top)}
             className="ResizeableWindow-handle ResizableWindow-right-handle"/>
        <div onMouseDown={_ => this.resizer.capture(this.moveBottom, this.release, width, height)}
             className="ResizeableWindow-handle ResizableWindow-bottom-handle"/>
        <div onMouseDown={_ => this.resizer.capture(this.moveLowerLeft, this.release, left, height)}
             className="ResizeableWindow-handle ResizableWindow-lower-left-handle"/>
        <div onMouseDown={_ => this.resizer.capture(this.moveLowerRight, this.release, width, height)}
             className="ResizeableWindow-handle ResizableWindow-lower-right-handle"/>
      </div>
    )
  }
}
