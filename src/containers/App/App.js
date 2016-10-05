import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import classnames from 'classnames'

import Header from '../Header'

class App extends Component {
  static get displayName () {
    return 'App'
  }

  // Defines the expected props for this component
  static propTypes () {
    return {
      authenticated: PropTypes.boolean,
      children: PropTypes.array
    }
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  renderHeader () {
    if (this.props.authenticated) {
      return <Header/>
    }
  }

  render () {
    const classNames = classnames('app', {
      'app-auth': !this.props.authenticated
    })
    return (
      <div className={classNames}>
        {this.renderHeader()}
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
  return {
    authenticated: state.auth.authenticated
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
