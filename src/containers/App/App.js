import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Header from '../Header'

class App extends Component {
  static get displayName () {
    return 'App'
  }

  // Defines the expected props for this component
  static propTypes () {
    return {
      children: PropTypes.array
    }
  }

  constructor (props) {
    super(props)

    this.state = {}
  }

  render () {
    return (
      <div className="container">
        <Header/>
        {this.props.children}
      </div>
    )
  }
}

// action creators to manipulate redux store
// We map these actions onto the props for a component
function mapDispatchToProps (dispatch) {
  return bindActionCreators({
  }, dispatch)
}

// redux store flowing into your module
function mapStateToProps (state) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
