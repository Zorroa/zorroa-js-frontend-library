import React, { Component, PropTypes } from 'react'

export default class App extends Component {
  static get displayName () {
    return 'App'
  }

  static propTypes () {
    return {}
  }

  constructor (props) {
    super(props)
  }

  render () {
    return (
      <h1>App</h1>
    )
  }
}
