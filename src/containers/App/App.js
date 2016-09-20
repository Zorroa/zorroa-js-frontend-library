import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { exampleActionSync, exampleActionAsync } from '../../actions/exampleAction'
import ExampleBox from '../../components/ExampleBox'

class App extends Component {
  static get displayName () {
    return 'App'
  }

  // Defines the expected props for this component
  static propTypes () {
    return {
      exampleActionSync: PropTypes.func.isRequired,
      exampleActionAsync: PropTypes.func.isRequired,
      exampleMessage: PropTypes.string
    }
  }

  constructor (props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick (isSyncAction) {
    const { exampleActionSync, exampleActionAsync } = this.props

    if (isSyncAction) {
      exampleActionSync()
    } else {
      exampleActionAsync()
    }
  }

  render () {
    const { exampleMessage } = this.props

    return (
      <div>
        <h1>App</h1>
        <button onClick={this.handleClick(true)}>Sync Click</button>
        <button onClick={this.handleClick(false)}>Async Click</button>
        <ExampleBox label={`Hi`} />
        <ExampleBox label={exampleMessage} />
      </div>
    )
  }
}

// action creators to manipulate redux store
// We map these actions on to the props for a component
function mapDispatchToProps (dispatch) {
  console.log('App dispatch:', dispatch)

  return bindActionCreators({
    exampleActionSync,
    exampleActionAsync
  }, dispatch)
}

// redux store flowing into your module
function mapStateToProps (state) {
  console.log('App state:', state)

  return {
    exampleMessage: state.example
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
