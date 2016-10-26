import React, { PropTypes } from 'react'

import Header from '../../components/Header'
import { SidebarWithFolders, SidebarWithRacetrack } from '../../components/Sidebar'
import Assets from '../../components/Assets'

const Workspace = () => {
  // console.log('Welcome', Welcome)
  return (
  <div className="app">
    <Header/>
    <div className="workspace flexRow fullWidth fullHeight">
      <SidebarWithFolders/>
      <div className="workspace-body flexOn fullHeight">
        <Assets/>
      </div>
      <SidebarWithRacetrack/>
    </div>
  </div>
)}

export default Workspace
