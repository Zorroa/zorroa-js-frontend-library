import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as assert from 'assert'
import classnames from 'classnames'
import axios from 'axios'

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
    isDroppable: false,
    showReloader: false
  }

  reloadInterval = null

  componentWillMount () {
    const { actions, user } = this.props
    actions.getUserPermissions(user)
    this.loadEmailJs()
  }

  componentDidMount () {
    // every now and then, check if the server's version of curator was updated & this session is stale
    this.reloadInterval = setInterval(this.checkForStaleVersion, 15 * 60 * 1000)
  }

  checkForStaleVersion = () => {
    const vurl = (DEBUG) ? '/bin/version.html' : '/version.html'
    axios.get(vurl)
    .then(response => {
      const SerVer = response.data.trim()
      // console.log(`my version: ${zvVersion}  server says: ${SerVer}`)
      this.setState({ showReloader: (SerVer !== zvVersion) })
    })
    .catch(error => {
      // should this make noise? not sure
      console.log('error requesting curator version', error)
    })
  }

  loadEmailJs = () => {
    // Use of globals here to make this a singleton:
    // - avoid re-running this code even on Workspace unmount/remount
    // - make this function dependency-free; no actions or app state
    if (window.zorroaEmailJSLoadAttempted) return
    window.zorroaEmailJSLoadAttempted = true

    // http://stackoverflow.com/a/7719185/1424242
    var loadScript = (src) => {
      return new Promise(function (resolve, reject) {
        var s
        s = document.createElement('script')
        s.src = src
        s.onload = resolve
        s.onerror = reject
        document.head.appendChild(s)
      })
    }

    // wait for above-the-fold loads to finish
    new Promise(resolve => setTimeout(resolve, 1000))
    .then(() => loadScript('https://cdn.emailjs.com/dist/email.min.js'))
    // emailjs needs a moment to init before window.emailjs will be defined
    .then(() => new Promise(resolve => setTimeout(resolve, 1000)))
    .then(() => window.emailjs.init('user_WBcDrP5QF9DWgdWTE6DvB'))
    .catch(err => console.error('Zorroa email js', err))
  }

  componentWillUnmount () {
    clearInterval(this.reloadInterval)
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

    const CollectionParams = () => ({
      header: (<span>Collections</span>),
      isOpen: app.collapsibleOpen.collection,
      isIconified: app.leftSidebarIsIconified,
      onOpen: this.toggleCollapsible.bind(this, 'collection'),
      closeIcon: 'icon-collections-simple'
    })
    const MetadataParams = () => ({
      header: (<span>Tags</span>),
      isOpen: app.collapsibleOpen.metadata,
      isIconified: app.leftSidebarIsIconified,
      onOpen: this.toggleCollapsible.bind(this, 'metadata'),
      closeIcon: 'icon-register'
    })

    const { isDroppable, showReloader } = this.state
    return (
      <div className={classnames('App', 'flexCol', 'fullHeight', {isDragging: app.dragInfo})}>
        { app.modal && <Modal {...app.modal} /> }
        { showReloader && (
          <div className="Workspace-reloader">
            <div className="flexRowCenter">
              This version of Curator has been updated.
              <button className="Workspace-reloader-reload" onClick={e => location.reload()}>
                Reload now
              </button>
            </div>
            <div className="Workspace-reloader-close icon-cross2"
                 onClick={e => this.setState({ showReloader: false })}/>
          </div>
        )}
        <Header/>
        <div className="Workspace flexOn flexRow fullWidth fullHeight">

          {/*  left panel - folders */}
          <Sidebar onToggle={this.toggleLeftSidebar}
                   isIconified={app.leftSidebarIsIconified}>
            <Collapsible {...MetadataParams()}>
              <Metadata isIconified={app.leftSidebarIsIconified}/>
            </Collapsible>
              <Collapsible {...CollectionParams()}>
              <Folders/>
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
        { isolatedId && <Lightbox/> }
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
