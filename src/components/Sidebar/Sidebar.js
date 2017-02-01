import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import Resizer from '../../services/Resizer'

export default class Sidebar extends Component {
  static displayName () {
    return 'Sidebar'
  }

  static propTypes = {
    // input props
    isRightEdge: PropTypes.bool,
    isIconified: PropTypes.bool,
    onToggle: PropTypes.func,

    // children props
    children: PropTypes.node
  }

  static defaultProps = {
    isRightEdge: false
  }

  resizer = null
  allowResize = true

  state = {
    isResizing: false,
    width: 340    // Tricky ref stuff needed in componentDidMount to get width
  }

  componentWillMount = () => {
    this.resizer = new Resizer()
  }

  componentWillUnmount = () => {
    this.resizer.release()
  }

  clampWidth = (width) => {
    return Math.min(1020, Math.max(340, width))
  }

  resizeStart = (event) => {
    // capture (onMove, onRelease, startX, startY, optScaleX, optScaleY)
    this.resizer.capture(this.resizeUpdate, this.resizeStop,
       this.state.width,                 /* startX    */
       0,                                /* startY    */
       this.props.isRightEdge ? -1 : 1,  /* optScaleX */
       0)                                /* optScaleY */
    const width = this.clampWidth(this.state.width)
    this.setState({ isResizing: true, width })
  }

  resizeUpdate = (resizeX, resizeY) => {
    if (!this.state.isResizing) return

    // let's just completely skip events that happen while we're busy
    if (!this.allowResize) return false
    this.allowResize = false

    // wait one frame to handle the event, otherwise events queue up syncronously
    requestAnimationFrame(_ => {
      const width = this.clampWidth(resizeX)
      this.setState({ width })
      this.allowResize = true
    })
  }

  resizeStop = (event) => {
    if (!this.state.isResizing) return
    this.allowResize = true
    this.setState({ isResizing: false })
  }

  toggleIfNotIconified = (event) => {
    if (!this.props.isIconified) return
    this.props.onToggle()
    return false
  }

  render () {
    const { isIconified, children, onToggle, isRightEdge } = this.props
    const { width } = this.state
    const isOpen = !isIconified
    return (
      <div style={{width}} className={classnames('Sidebar', { isOpen, isRightEdge, isIconified })}>
        <div className={classnames('Sidebar-open-close-button', 'icon-doublearrows',
          { isRightEdge, isIconified })} onClick={onToggle} />
        <div className={classnames('scroller', { isRightEdge })} onClick={this.toggleIfNotIconified}>
          { children }
        </div>
        { isOpen && <div onMouseDown={this.resizeStart}
                         className={classnames('Sidebar-resize-thumb', { isRightEdge })} /> }
      </div>
    )
  }
}
