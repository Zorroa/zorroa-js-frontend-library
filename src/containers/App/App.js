import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { testActionSync, testActionAsync } from '../../actions/testAction'

class App extends Component {
  static get displayName () {
    return 'App'
  }

  // Defines the expected props for this component
  static propTypes () {
    return {
      testActionSync: PropTypes.func.isRequired,
      testActionAsync: PropTypes.func.isRequired,
      testMessage: PropTypes.string
    }
  }

  constructor (props) {
    super(props)
    console.log('PROPS', props)
  }

  handleClick (isSyncAction) {
    const { testActionSync, testActionAsync } = this.props

    if (isSyncAction) {
      testActionSync()
    } else {
      testActionAsync()
    }
  }

  render () {
    const { testMessage } = this.props

    return (
      <div>
        <h1>App</h1>
        <button onClick={this.handleClick.bind(this, true)}>Sync Click</button>
        <button onClick={this.handleClick.bind(this, false)}>Async Click</button>
        <h2>{testMessage}</h2>
      </div>
    )
  }
}

// action creators to manipulate redux store
// We map these actions on to the props for a component
function mapDispatchToProps (dispatch) {
  console.log('DISPATCH', dispatch)
  return bindActionCreators({
    testActionSync,
    testActionAsync
  }, dispatch)
}

// redux store flowing into your module
function mapStateToProps (state) {
  console.log('STATE', state)
  return {
    testMessage: state.test
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
