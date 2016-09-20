import React, { Component, PropTypes } from 'react'

export default class ExampleBox extends Component {
  static get displayName () {
    return 'ExampleBox'
  }

  static propTypes () {
    return {
      label: PropTypes.string.isRequired
    }
  }

  render () {
    const { label } = this.props
    if (!label) {
      return null
    }

    const styles = {
      padding: 20,
      border: '1px solid gray',
      borderRadius: 4,
      fontSize: 18,
      color: 'gray'
    }

    return (
      <div style={styles}>{label}</div>
    )
  }
}
