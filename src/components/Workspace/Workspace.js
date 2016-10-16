import React, { Component, PropTypes } from 'react'

import Accordion from '../../components/Accordion'
import Footer from '../../components/Footer'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import Table from '../../components/Table'
import Assets from '../../components/Assets'
import Folders from '../../components/Folders'
import Racetrack from '../../components/Racetrack'

export default class Workspace extends Component {
  static get propTypes () {
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
            <Racetrack/>
          </Sidebar>
        </div>
      </div>
    )
  }
}
