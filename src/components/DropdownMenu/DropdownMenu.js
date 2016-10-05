import React, { Component, PropTypes, Children } from 'react'

export default class DropdownMenu extends Component {
  static get displayName () {
    return 'DropdownMenu'
  }

  static get propTypes () {
    return {
      children: PropTypes.node,
      label: PropTypes.string,
      cb: PropTypes.func,
      style: PropTypes.object
    }
  }

  constructor (props) {
    super(props)

    this.state = {
      isVisible: false
    }

    this.show = this.show.bind(this)
    this.hide = this.hide.bind(this)
    this.handleSelect = this.handleSelect.bind(this)
  }

  componentWillUnmount () {
    document.removeEventListener('click', this.hide)
  }

  handleSelect (se) {
    console.log('se', se)

    const { cb } = this.props
    this.hide()

    if (cb && cb instanceof Function) {
      cb()
    }
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
        <button type="button" role="button" onClick={this.show}>
          {this.props.label}
          <span className="dropdown-caret"></span>
        </button>
        { this.state.isVisible &&
          (<ul>
            {Children.map(this.props.children, (child, i) => {
              return (<li key={i}><a onClick={this.handleSelect}>{child}</a></li>)
            })}
          </ul>)
        }
      </div>
    )
  }
}
