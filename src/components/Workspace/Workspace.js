import React from 'react'

import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import Assets from '../../components/Assets'
import Folders from '../../components/Folders'
import Racetrack from '../../components/Racetrack'
import Metadata from '../../components/Metadata'

const Workspace = () => (
  <div className="app">
    <Header/>
    <div className="workspace flexRow fullWidth fullHeight">
      <Sidebar>
        <Folders/>
        <Metadata/>
      </Sidebar>
      <div className="workspace-body flexOn fullHeight">
        <Assets/>
      </div>
      <Sidebar isRightEdge={true}>
        <Racetrack/>
      </Sidebar>
    </div>
  </div>
)

export default Workspace
