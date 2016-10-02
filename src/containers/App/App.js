import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import Header from '../Header'
import Sidebar from '../../components/Sidebar'
import Accordion from '../../components/Accordion'

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
    const leftSidebarItems = [ 'Browsing', 'Collections', 'Metadata' ]
    const rightSidebarItems = [ 'Search', 'Facet', 'Date' ]
    return (
      <div className="app">
        <Header/>
        <div className="workspace">
          <Sidebar>
            <Accordion>{leftSidebarItems.map(item => (<div key={item}>{item}</div>))}</Accordion>
          </Sidebar>
          <div className="assets">
            {this.props.children}
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
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
