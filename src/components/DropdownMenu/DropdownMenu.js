import React, { Component, PropTypes, Children } from 'react'
import classnames from 'classnames'

export default class DropdownMenu extends Component {
  static propTypes = {
    children: PropTypes.node,
    label: PropTypes.node,
    style: PropTypes.object,
    onChange: PropTypes.func
  }

  state = {
    isVisible: false
  }

  componentWillUnmount () {
    document.removeEventListener('click', this.hide)
  }

  setStateProm = (newState) => {
    return new Promise(resolve => this.setState(newState, resolve))
  }

  show = (event) => {
    const { isVisible } = this.state
    if (isVisible) return
    this.setStateProm({ isVisible: true })
    .then(() => document.addEventListener('click', this.hide))
    if (this.props.onChange) this.props.onChange(event, true)
  }

  hide = (event) => {
    const { isVisible } = this.state
    if (!isVisible) return
    this.setStateProm({ isVisible: false })
    .then(() => document.removeEventListener('click', this.hide))
    if (this.props.onChange) this.props.onChange(event, false)
  }

  render () {
    let menuList = []
    Children.forEach(this.props.children, (child, i) => {
      if (child && menuList.length) { menuList.push((<div className="DropdownMenu-separator" key={`${i}s`}/>)) }
      if (child) menuList.push((<li className="DropdownMenu-item" key={`${i}i`}>{child}</li>))
    })

    return (
      <div className="DropdownMenu" style={this.props.style}>
        <div className="DropdownMenu-button" onClick={this.show}>
          {this.props.label}
          <i className={classnames('DropdownMenu-caret', 'icon-arrow-down', { 'rot180': this.state.isVisible })} />
        </div>
        { this.state.isVisible &&
          (<ul className="DropdownMenu-list">
            {menuList}
          </ul>)
        }
      </div>
    )
  }
}
