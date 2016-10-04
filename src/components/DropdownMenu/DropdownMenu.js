import React, { Component, PropTypes, Children } from 'react'

export default class DropdownMenu extends Component {
  static get displayName () {
    return 'DropdownMenu'
  }

  static get propTypes () {
    return {
      children: PropTypes.node,
      label: PropTypes.string
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
    console.info(se)
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
      <div className="dropdown-menu">
        <button type="button" onClick={this.show} role="button">
          {this.props.label}
          <span className="dropdown-caret"></span>
        </button>
        { this.state.isVisible &&
          (<ul>
            {Children.map(this.props.children, (child, i) => {
              return (<li key={i}><a href={this.handleSelect}>{child}</a></li>)
            })}
          </ul>)
        }
      </div>
    )
  }
}
