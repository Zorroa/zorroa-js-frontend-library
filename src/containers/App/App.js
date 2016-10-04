import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import Header from '../Header'
import Sidebar from '../../components/Sidebar'
import Accordion from '../../components/Accordion'
import Footer from '../../components/Footer'

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

  render () {
    if (!this.props.authenticated) {
      return (
        <div className="app">
          <Header />
          <div className="auth">
            {this.props.children}
          </div>
        </div>
      )
    }
    const leftSidebarItems = [ 'Browsing', 'Collections', 'Metadata' ]
    const rightSidebarItems = [ 'Search', 'Facet', 'Date' ]
    return (
      <div className="app">
        <Header />
        <div className="workspace">
          <Sidebar>
            <Accordion>{leftSidebarItems.map(item => (<div key={item}>{item}</div>))}</Accordion>
          </Sidebar>
          <div className="assets">
            <div className="thumbs">
              {this.props.children}
            </div>
            <Footer>
              <div>Gorgeous table</div>
            </Footer>
          </div>
          <Sidebar isRightEdge={true}>
            <Accordion>{rightSidebarItems.map(item => (<div key={item}>{item}</div>))}</Accordion>
          </Sidebar>
        </div>
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
