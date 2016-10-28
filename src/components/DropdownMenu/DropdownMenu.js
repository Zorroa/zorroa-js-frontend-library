import React, { Component, PropTypes, Children } from 'react'

export default class DropdownMenu extends Component {
  static propTypes = {
    children: PropTypes.node,
    label: PropTypes.string,
    style: PropTypes.object
  }

  state: {
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
        <button type="button" className="btn" role="button" onClick={this.show}>
          {this.props.label}
          <span className="dropdown-caret"></span>
        </button>
        { this.state.isVisible &&
          (<ul>
            {Children.map(this.props.children, (child, i) => {
              return (<li key={i}>{child}</li>)
            })}
          </ul>)
        }
      </div>
    )
  }
}
