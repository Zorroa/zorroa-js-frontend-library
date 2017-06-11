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

  state = {
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
    this.resizer.capture(
      this.resizeUpdate,                /* onMove    */
      null,                             /* onRelease */
      this.state.width,                 /* startX    */
      0,                                /* startY    */
      this.props.isRightEdge ? -1 : 1,  /* optScaleX */
      0)                                /* optScaleY */
  }

  resizeUpdate = (resizeX, resizeY) => {
    if (resizeX < 160 && !this.props.isIconified) {
      this.props.onToggle()
    } else {
      const width = this.clampWidth(resizeX)
      this.setState({ width })
    }
  }

  toggleIfNotIconified = (event) => {
    if (!this.props.isIconified) return
    this.props.onToggle()
    return false
  }

  render () {
    const { isIconified, children, isRightEdge } = this.props
    const { width } = this.state
    const isOpen = !isIconified
    return (
      <div style={{width}} className={classnames('Sidebar', { isOpen, isRightEdge, isIconified })}>
        <div className={classnames('scroller', { isRightEdge })} onClick={this.toggleIfNotIconified}>
          { children }
        </div>
        { isOpen && <div onMouseDown={this.resizeStart}
                         className={classnames('Sidebar-resize-thumb', { isRightEdge })} /> }
      </div>
    )
  }
}
