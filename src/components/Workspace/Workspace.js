import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as assert from 'assert'
import classnames from 'classnames'

import Header from '../Header'
import Sidebar from '../Sidebar'
import Assets from '../Assets'
import Folders from '../Folders'
import Racetrack from '../Racetrack'
import Metadata from '../Metadata'
import Collapsible from '../Collapsible'
import DisplayOptions from '../DisplayOptions'
import CreateFolder from '../Folders/CreateFolder'

import { iconifyLeftSidebar, iconifyRightSidebar, toggleCollapsible } from '../../actions/appActions'
import { getUserPermissions } from '../../actions/authAction'
import User from '../../models/User'

class Workspace extends Component {
  static displayName () {
    return 'Workspace'
  }

  static propTypes = {
    // input props
    children: PropTypes.node,

    // connect props
    actions: PropTypes.object.isRequired,

    // state props
    app: PropTypes.object.isRequired,
    user: PropTypes.instanceOf(User)
  }

  componentWillMount () {
    const { actions, user } = this.props
    actions.getUserPermissions(user)
  }

  toggleLeftSidebar = () => {
    const { actions, app } = this.props
    actions.iconifyLeftSidebar(!app.leftSidebarIsIconified)
  }
  toggleRightSidebar = () => {
    const { actions, app } = this.props
    actions.iconifyRightSidebar(!app.rightSidebarIsIconified)
  }

  static collapsibleNames = new Set(['browsing', 'collection', 'simple', 'smart', 'metadata'])
  toggleCollapsible = (name) => {
    const { actions, app } = this.props
    // If the Sidebar is iconified, ignore the click, the sidebar will open itself instead
    if (app.leftSidebarIsIconified) return
    assert.ok(Workspace.collapsibleNames.has(name))
    actions.toggleCollapsible(name, !app.collapsibleOpen[name])
  }

  render () {
    const { app } = this.props

    const BrowsingParams = () => ({
      header: (<span>Browsing</span>),
      isIconified: app.leftSidebarIsIconified,
      isOpen: app.collapsibleOpen.browsing,
      onOpen: this.toggleCollapsible.bind(this, 'browsing'),
      closeIcon: 'icon-cube'
    })
    const CollectionParams = () => ({
      header: (<span>Collection</span>),
      isOpen: app.collapsibleOpen.collection,
      isIconified: app.leftSidebarIsIconified,
      onOpen: this.toggleCollapsible.bind(this, 'collection'),
      closeIcon: 'icon-folder2'
    })
    const SmartCollectionParams = () => ({
      header: (<span>Smart Collections</span>),
      isOpen: app.collapsibleOpen.smart,
      isIconified: app.leftSidebarIsIconified,
      onOpen: this.toggleCollapsible.bind(this, 'smart'),
      closeIcon: 'icon-folder2'
    })
    const SimpleCollectionParams = () => ({
      header: (<span>Simple Collections</span>),
      isOpen: app.collapsibleOpen.simple,
      isIconified: app.leftSidebarIsIconified,
      onOpen: this.toggleCollapsible.bind(this, 'simple'),
      closeIcon: 'icon-folder2'
    })
    const MetadataParams = () => ({
      header: (<span>Metadata</span>),
      isOpen: app.collapsibleOpen.metadata,
      isIconified: app.leftSidebarIsIconified,
      onOpen: this.toggleCollapsible.bind(this, 'metadata'),
      closeIcon: 'icon-register'
    })

    return (
      <div className={classnames('App', {isDragging: app.isDragging})}>
        { app.displayOptions && <DisplayOptions {...app.displayOptions} /> }
        { app.createFolder && <CreateFolder {...app.createFolder} /> }
        <Header/>
        <div className="Workspace flexRow fullWidth fullHeight">

          {/*  left panel - folders */}
          <Sidebar onToggle={this.toggleLeftSidebar}
                   isIconified={app.leftSidebarIsIconified}>
            <Collapsible {...BrowsingParams()}>
              <Folders filterName='browsing'/>
            </Collapsible>
            <Collapsible {...CollectionParams()}>
              <Collapsible {...SmartCollectionParams()}>
                <Folders filterName='smart'/>
              </Collapsible>
              <Collapsible {...SimpleCollectionParams()}>
                <Folders filterName='simple'/>
              </Collapsible>
            </Collapsible>
            <Collapsible {...MetadataParams()}>
              <Metadata isIconified={app.leftSidebarIsIconified}/>
            </Collapsible>
          </Sidebar>

          <div className="Workspace-vertical-separator flexOff"/>

          {/*  center panel - thumbnails */}
          <div className="Workspace-body flexOn fullHeight">
            <Assets/>
          </div>

          <div className="Workspace-vertical-separator flexOff"/>

          {/*  right panel - racetrack (search filters) */}
          <Sidebar onToggle={this.toggleRightSidebar}
                   isRightEdge={true}
                   isIconified={app.rightSidebarIsIconified}>
            <Racetrack isIconified={app.rightSidebarIsIconified}/>
          </Sidebar>

        </div>
      </div>
    )
  }
}

export default connect(state => ({
  app: state.app,
  user: state.auth.user
}), dispatch => ({
  actions: bindActionCreators({ iconifyLeftSidebar, iconifyRightSidebar, toggleCollapsible, getUserPermissions }, dispatch)
}))(Workspace)
