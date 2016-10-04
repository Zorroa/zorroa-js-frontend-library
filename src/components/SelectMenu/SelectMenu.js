import React, { Component, PropTypes } from 'react'

export default class SelectMenu extends Component {
  static get displayName () {
    return 'SelectMenu'
  }

  static get defaultProps () {
    return {
      options: []
    }
  }

  static get propTypes () {
    return {
      options: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.any.isRequired
      }))
    }
  }

  constructor (props) {
    super(props)

    this.state = {
      selectValue: this.props.options[0]
    }

    this.handleChange = this.handleChange.bind(this)
  }

  handleChange (se) {
    this.setState({
      selectValue: se.target.value
    })
  }

  render () {
    console.info(this.state)
    const options = this.props.options.map((option, i) => {
      return <option key={i} value={option.value}>{option.label}</option>
    })

    return (
      <select className="custom-dropdown" onChange={this.handleChange} value={this.state.selectValue}>
        {options}
      </select>
    )
  }
}
