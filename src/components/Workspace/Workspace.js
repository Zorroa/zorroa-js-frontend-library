import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as assert from 'assert'
import classnames from 'classnames'

import Modal from '../Modal'
import Header from '../Header'
import Sidebar from '../Sidebar'
import Assets from '../Assets'
import Folders from '../Folders'
import Racetrack from '../Racetrack'
import Metadata from '../Metadata'
import Collapsible from '../Collapsible'
import CreateImport from '../Header/CreateImport'
import { iconifyLeftSidebar, iconifyRightSidebar, toggleCollapsible, showModal } from '../../actions/appActions'
import { getUserPermissions } from '../../actions/authAction'
import User from '../../models/User'
import Lightbox from '../Lightbox'

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
    user: PropTypes.instanceOf(User),
    isolatedId: PropTypes.string
  }

  state = {
    isDroppable: false
  }

  componentWillMount () {
    const { actions, user } = this.props
    actions.getUserPermissions(user)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.modal && this.state.isDroppable) {
      this.setState({isDroppable: false})
    }
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

  dragEnter = (event) => {
    const isFile = event.dataTransfer.types.findIndex(type => (type === 'Files')) >= 0
    const { app } = this.props
    if (isFile && app && !app.modal) {
      console.log('Drag enter app')
      this.setState({isDroppable: true})
    }
  }

  dragOver = (event) => {
    if (this.state.isDroppable) {
      console.log('Drag over app')
    }
    event.preventDefault()
  }

  dragLeave = (event) => {
    if (this.state.isDroppable) {
      console.log('Drag leave app')
      this.setState({isDroppable: false})
    }
  }

  dropFile = (event) => {
    const width = '800px'
    const body = <CreateImport initialFiles={event.dataTransfer.files}/>
    this.props.actions.showModal({body, width})
    this.setState({isDroppable: false})
    event.preventDefault()
  }

  render () {
    const { app, isolatedId } = this.props

    if (isolatedId) return <Lightbox/>

    const BrowsingParams = () => ({
      header: (<span>Browsing</span>),
      isIconified: app.leftSidebarIsIconified,
      isOpen: app.collapsibleOpen.browsing,
      onOpen: this.toggleCollapsible.bind(this, 'browsing'),
      closeIcon: 'icon-foldercog'
    })
    const CollectionParams = () => ({
      header: (<span>Collection</span>),
      isOpen: app.collapsibleOpen.collection,
      isIconified: app.leftSidebarIsIconified,
      onOpen: this.toggleCollapsible.bind(this, 'collection'),
      closeIcon: 'icon-collections-simple'
    })
    const SmartCollectionParams = () => ({
      header: (<span>Smart Collections</span>),
      isOpen: app.collapsibleOpen.smart,
      isIconified: app.leftSidebarIsIconified,
      onOpen: this.toggleCollapsible.bind(this, 'smart'),
      closeIcon: 'icon-collections-smart'
    })
    const SimpleCollectionParams = () => ({
      header: (<span>Simple Collections</span>),
      isOpen: app.collapsibleOpen.simple,
      isIconified: app.leftSidebarIsIconified,
      onOpen: this.toggleCollapsible.bind(this, 'simple'),
      closeIcon: 'icon-collections-simple'
    })
    const MetadataParams = () => ({
      header: (<span>Metadata</span>),
      isOpen: app.collapsibleOpen.metadata,
      isIconified: app.leftSidebarIsIconified,
      onOpen: this.toggleCollapsible.bind(this, 'metadata'),
      closeIcon: 'icon-register'
    })

    const { isDroppable } = this.state
    return (
      <div className={classnames('App', 'flexCol', 'fullHeight', {isDragging: app.dragInfo})}>
        { app.modal && <Modal {...app.modal} /> }
        <Header/>
        <div className="Workspace flexOn flexRow fullWidth fullHeight">

          {/*  left panel - folders */}
          <Sidebar onToggle={this.toggleLeftSidebar}
                   isIconified={app.leftSidebarIsIconified}>
            <Collapsible {...BrowsingParams()}>
              <Folders filterName='browsing'/>
            </Collapsible>
            <div className="Workspace-collections">
              <Collapsible {...CollectionParams()}>
                <div className="Workspace-collection">
                  <Collapsible {...SmartCollectionParams()}>
                    <Folders filterName='smart'/>
                  </Collapsible>
                </div>
                <div className="Workspace-collection">
                  <Collapsible {...SimpleCollectionParams()}>
                    <Folders filterName='simple'/>
                  </Collapsible>
                </div>
              </Collapsible>
            </div>
            <Collapsible {...MetadataParams()}>
              <Metadata isIconified={app.leftSidebarIsIconified}/>
            </Collapsible>
          </Sidebar>

          <div className="Workspace-vertical-separator flexOff"/>

          {/*  center panel - thumbnails */}
          <Assets/>

          <div className="Workspace-vertical-separator flexOff"/>

          {/*  right panel - racetrack (search filters) */}
          <Sidebar onToggle={this.toggleRightSidebar}
                   isRightEdge={true}
                   isIconified={app.rightSidebarIsIconified}>
            <Racetrack isIconified={app.rightSidebarIsIconified}/>
          </Sidebar>

        </div>
        <div className={classnames('App-dropzone', {isDroppable})}
             onDragOver={this.dragOver}
             onDragLeave={this.dragLeave}
             onDrop={this.dropFile}>
          Drop Assets to Import
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  app: state.app,
  user: state.auth.user,
  isolatedId: state.assets.isolatedId
}), dispatch => ({
  actions: bindActionCreators({
    iconifyLeftSidebar,
    iconifyRightSidebar,
    toggleCollapsible,
    getUserPermissions,
    showModal
  }, dispatch)
}))(Workspace)
