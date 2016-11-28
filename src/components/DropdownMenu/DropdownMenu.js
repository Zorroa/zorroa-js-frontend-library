import React, { Component, PropTypes, Children } from 'react'
import classnames from 'classnames'

export default class DropdownMenu extends Component {
  static propTypes = {
    children: PropTypes.node,
    label: PropTypes.node,
    style: PropTypes.object,
    rightAlign: PropTypes.bool,
    onChange: PropTypes.func
  }

  state = {
    isVisible: false
  }

  componentWillUnmount () {
    document.removeEventListener('click', this.hide)
  }

  show = (event) => {
    const { isVisible } = this.state
    if (isVisible) return
    this.setState({ isVisible: true }, () => {
      document.addEventListener('click', this.hide)
    })
    if (this.props.onChange) this.props.onChange(event, true)
  }

  hide = (event) => {
    const { isVisible } = this.state
    if (!isVisible) return
    this.setState({ isVisible: false }, () => {
      document.removeEventListener('click', this.hide)
    })
    if (this.props.onChange) this.props.onChange(event, false)
  }

  render () {
    let menuList = []
    Children.forEach(this.props.children, (child, i) => {
      if (i) { menuList.push((<div className="DropdownMenu-separator" key={`${i}s`}/>)) }
      menuList.push((<li className="DropdownMenu-item" key={`${i}i`}>{child}</li>))
    })

    return (
      <div className="DropdownMenu" style={this.props.style}>
        <button className="DropdownMenu-button flexRow flexAlignItemsCenter" type="button" role="button" onClick={this.show}>
          {this.props.label}
          <div className={classnames('DropdownMenu-caret', 'icon-arrow-down', { 'rot180': this.state.isVisible })} />
        </button>
        { this.state.isVisible &&
          (<ul className="DropdownMenu-list" style={this.props.rightAlign ? {right: 0} : {}}>
            {menuList}
          </ul>)
        }
      </div>
    )
  }
}
