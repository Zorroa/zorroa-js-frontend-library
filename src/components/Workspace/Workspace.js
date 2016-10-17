import React, { Component, PropTypes } from 'react'

import Accordion from '../../components/Accordion'
import Footer from '../../components/Footer'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import Table from '../../components/Table'
import Assets from '../../components/Assets'
import Folders from '../../components/Folders'

export default class Workspace extends Component {
  static propTypes () {
    return {
      children: PropTypes.array
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      showTable: true
    }
  }

  renderTable () {
    if (this.state.showTable) {
      return (
        <Footer>
          <Table/>
        </Footer>
      )
    }
  }

  render () {
    const rightSidebarItems = [ 'Search', 'Facet', 'Date' ]
    return (
      <div className="app">
        <Header/>
        <div className="workspace">
          <Sidebar>
            <Folders/>
          </Sidebar>
          <div className="workspace-body">
            <Assets/>
            {this.renderTable()}
          </div>
          <Sidebar isRightEdge={true}>
            <Accordion>{rightSidebarItems.map(item => (<div key={item}>{item}</div>))}</Accordion>
          </Sidebar>
        </div>
      </div>
    )
  }
}
