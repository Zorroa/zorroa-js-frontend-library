import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'

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

  state = {
    startx: 0,
    startw: 0,
    width: 340    // Tricky ref stuff needed in componentDidMount to get width
  }

  startDrag = (event) => {
    const { width } = this.state
    this.setState({ startx: event.pageX, startw: width })
  }

  drag = (event) => {
    const { isRightEdge } = this.props
    const { startx, startw } = this.state
    if (!event.pageX) return
    const dx = (event.pageX - startx) * (isRightEdge ? -1 : 1)
    const width = Math.min(1020, Math.max(340, startw + dx))
    const threshold = 4   // Minimize redraws
    if (Math.abs(width - this.state.width) > threshold) {
      this.setState({width})
    }
  }

  buttonChar () {
    // Select the right or left facing triangle unicode char using XOR
    return this.props.isIconified === this.props.isRightEdge ? '\u25C0' : '\u25B6'
  }

  render () {
    const arrow = this.buttonChar()
    const { isIconified, children, onToggle, isRightEdge } = this.props
    const { width } = this.state
    const isOpen = !isIconified
    return (
      <div style={{width}} className={classnames('Sidebar', { isOpen })}>
        <div className={classnames('open-close-button', { isRightEdge })}
             onClick={onToggle}
        >
          <label>{arrow}{arrow}</label>
        </div>
        <div className={'scroller'} >
          { children }
        </div>
        { isOpen && <div draggable={true} onDragStart={this.startDrag} onDrag={this.drag}
                         className={classnames('resize-thumb', { isRightEdge })} /> }
      </div>
    )
  }
}
