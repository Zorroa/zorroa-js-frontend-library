import React, { Component, PropTypes, Children } from 'react'
import classnames from 'classnames'

export default class DropdownMenu extends Component {
  static propTypes = {
    children: PropTypes.node,
    label: PropTypes.node,
    style: PropTypes.object,
    rightAlign: PropTypes.bool
  }

  state = {
    isVisible: false
  }

  show = this.show.bind(this)
  hide = this.hide.bind(this)

  componentWillUnmount () {
    document.removeEventListener('click', this.hide)
  }

  show () {
    this.setState({ isVisible: true }, () => {
      document.addEventListener('click', this.hide)
    })
  }

  hide () {
    this.setState({ isVisible: false }, () => {
      document.removeEventListener('click', this.hide)
    })
  }

  render () {
    return (
      <div className="dropdown-menu" style={this.props.style}>
        <button type="button" className="button flexRow flexAlignItemsCenter" role="button" onClick={this.show}>
          {this.props.label}
          <div className={classnames('dropdown-caret', 'icon-arrow-down', { 'rot180': this.state.isVisible })} />
        </button>
        { this.state.isVisible &&
          (<ul style={this.props.rightAlign ? {right: 0} : {}}>
            {Children.map(this.props.children, (child, i) => {
              return (<li key={i}>{child}</li>)
            })}
          </ul>)
        }
      </div>
    )
  }
}
