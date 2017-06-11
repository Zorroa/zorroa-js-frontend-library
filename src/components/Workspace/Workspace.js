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
import Metadata from '../Metadata'
import Metadata2 from '../Metadata2'
import Collapsible from '../Collapsible'
import { iconifyLeftSidebar, toggleCollapsible, showModal, hideModal } from '../../actions/appActions'
import { getUserPermissions, updatePassword, changePassword } from '../../actions/authAction'
import { queueFileEntrysUpload } from '../../actions/jobActions'
import { updateCommand, getAllCommands } from '../../actions/assetsAction'
import ChangePassword from '../auth/ChangePassword'
import User from '../../models/User'
import Job, { countOfJobsOfType } from '../../models/Job'
import Asset from '../../models/Asset'
import CommandProgress from '../Workspace/CommandProgress'
import Lightbox from '../Lightbox'
import Feedback from '../Feedback'
import Import from '../Import'
import { LOCAL_IMPORT, CLOUD_IMPORT, SERVER_IMPORT } from '../Import/ImportConstants'

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
    isolatedId: PropTypes.string,
    changePassword: PropTypes.bool,
    onboarding: PropTypes.bool,
    jobs: PropTypes.object,
    location: PropTypes.object,
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    selectedAssetIds: PropTypes.instanceOf(Set),
    commands: PropTypes.instanceOf(Map)
  }

  state = {
    isDroppable: false,
    showReloader: false
  }

  reloadInterval = null
  commandInterval = null
  activeCommandId = 0
  repoContainsAssets = false
  tipShown = false

  componentWillMount () {
    const { actions, user } = this.props
    actions.getUserPermissions(user)
    actions.getAllCommands()
    Feedback.loadEmailJs()
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

  componentWillUnmount () {
    clearInterval(this.reloadInterval)
    clearInterval(this.commandInterval)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.app.modal && this.state.isDroppable) {
      this.setState({isDroppable: false})
    }
    if (!nextProps.app.modal && (nextProps.changePassword || (nextProps.user && nextProps.user.changePassword))) {
      const width = '300px'
      const title = `${nextProps.onboarding ? 'SELECT' : 'CHANGE'} ${nextProps.user.username}'s PASSWORD`
      const body = <ChangePassword onChangePassword={this.updatePassword}
                                   onCancel={this.cancelPasswordUpdate}
                                   title={title} />
      this.props.actions.showModal({body, width})
    } else if (nextProps.app.modal && nextProps.app.modal.body.props.onChangePassword && !nextProps.changePassword) {
      // The conditional above checks to see if the current modal is the ChangePassword component,
      // and that we should hide it, which is really better handled with a promise somehow?
      this.props.actions.hideModal()
    }
    const src = this.props.location && this.props.location.query && this.props.location.query.source
    const sources = { cloud: CLOUD_IMPORT, file_server: SERVER_IMPORT, my_computer: LOCAL_IMPORT }
    const source = sources[src]
    if (!nextProps.app.modal && !this.tipShown &&         // not previously displayed
        !this.repoContainsAssets &&
      (source ||                                          // source in URL
      (nextProps.assets && !nextProps.assets.length &&    // no assets
      !countOfJobsOfType(nextProps.jobs, Job.Import)))) { // no imports
      this.tipShown = true
      const width = '65vw'
      const body = <Import source={source} step={source ? 2 : 1}/>
      this.props.actions.showModal({body, width})
    }
    if (nextProps.assets && nextProps.assets.length) this.repoContainsAssets = true
    const command = [...nextProps.commands.values()].find(command => (command.state === Job.Waiting || command.state === Job.Active))
    if (!this.commandInterval && command) {
      // Add a timer to monitor long commands, including the initial Waiting state,
      // but only display Active commands in render. If it completes in <5s nothing is shown
      this.commandInterval = setInterval(this.checkCommandProgress, 5 * 1000)
    } else if (this.commandInterval && !command) {
      clearInterval(this.commandInterval)
      this.commandInterval = null
    }
    if (!command && this.state.activeCommandId) {
      this.activeCommandId = 0
    } else if (command && command.id !== this.state.activeCommandId) {
      this.activeCommandId = command.id
    }
  }

  checkCommandProgress = () => {
    if (!this.activeCommandId) return
    this.props.actions.updateCommand(this.activeCommandId)
  }

  updatePassword = (password) => {
    this.props.actions.updatePassword(this.props.user, password)
  }

  cancelPasswordUpdate = () => {
    this.props.actions.changePassword(false)
    this.props.actions.hideModal()
  }

  toggleLeftSidebar = () => {
    const { actions, app } = this.props
    actions.iconifyLeftSidebar(!app.leftSidebarIsIconified)
  }

  static collapsibleNames = new Set(['browsing', 'collection', 'simple', 'smart', 'metadata', 'metadata2'])
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

  createLocalImport = (event) => {
    const source = LOCAL_IMPORT
    const items = source === LOCAL_IMPORT && event && event.dataTransfer && event.dataTransfer.items ? event.dataTransfer.items : null
    const entries = []
    for (let i = 0; i < items.length; ++i) {
      entries.push(items[i].webkitGetAsEntry())
    }
    this.props.actions.queueFileEntrysUpload(entries)

    const width = '65vw'
    const body = <Import source={source} step={2}/>
    this.props.actions.showModal({body, width})
    this.setState({isDroppable: false})
    event.preventDefault()
  }

  render () {
    const { app, isolatedId, selectedAssetIds } = this.props

    const CollectionParams = () => ({
      header: (<span>Collections</span>),
      isOpen: app.collapsibleOpen.collection,
      isIconified: app.leftSidebarIsIconified,
      onOpen: this.toggleCollapsible.bind(this, 'collection'),
      closeIcon: 'icon-collections-simple',
      className: 'Collections-collapsible'
    })
    const MetadataParams = () => ({
      header: (<span>Explore</span>),
      isOpen: app.collapsibleOpen.metadata,
      isIconified: app.leftSidebarIsIconified,
      onOpen: this.toggleCollapsible.bind(this, 'metadata'),
      closeIcon: 'icon-binoculars',
      className: 'Metadata-collapsible'
    })
    const Metadata2Params = () => ({
      header: (<span>Metadata</span>),
      isOpen: app.collapsibleOpen.metadata2,
      isIconified: app.leftSidebarIsIconified,
      onOpen: this.toggleCollapsible.bind(this, 'metadata2'),
      closeIcon: 'icon-register',
      className: 'Metadata2-collapsible'
    })

    // Only show the command progress if Active, skipping super quick commands
    const commands = [...this.props.commands.values()]
    const command = commands.find(command => (command.state === Job.Active)) || commands.find(command => (command.state === Job.Waiting))
    const commandSuccessPct = command && command.totalCount ? 100 * command.successCount / command.totalCount : 0
    const commandErrorPct = command && command.totalCount ? 100 * command.errorCount / command.totalCount : 0

    const { isDroppable, showReloader } = this.state
    return (
      <div onDragEnter={this.dragEnter} className={classnames('App', 'flexCol', 'fullHeight', {isDragging: app.dragInfo})}>
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

        { command && <CommandProgress successPct={commandSuccessPct} errorPct={commandErrorPct}/>}

        <div className="Workspace flexOn flexRow fullWidth fullHeight">

          {/*  left panel - folders */}
          <Sidebar onToggle={this.toggleLeftSidebar}
                   isIconified={app.leftSidebarIsIconified}>
            <div className="Workspace-sidebar-spacer"/>
            <Collapsible {...CollectionParams()}>
              <Folders/>
            </Collapsible>
            <Collapsible {...MetadataParams()}>
              <Metadata/>
            </Collapsible>
            <Collapsible {...Metadata2Params()}>
              <Metadata2 assetIds={selectedAssetIds} height="60vh" />
            </Collapsible>
          </Sidebar>

          <div className="Workspace-vertical-separator flexOff"/>

          {/*  right panel - thumbnails */}
          <Assets/>

        </div>
        <div className={classnames('App-dropzone', {isDroppable})}
             onDragOver={this.dragOver}
             onDragLeave={this.dragLeave}
             onDrop={this.createLocalImport}>
          Drop Assets to Import
        </div>
        { isolatedId && <Lightbox/> }
        <div id='Table-cell-test' className='Table-cell'/>
      </div>
    )
  }
}

export default connect(state => ({
  app: state.app,
  user: state.auth.user,
  isolatedId: state.assets.isolatedId,
  changePassword: state.auth.changePassword,
  onboarding: state.auth.onboarding,
  assets: state.assets.all,
  selectedAssetIds: state.assets.selectedIds,
  jobs: state.jobs.all,
  commands: state.assets.commands
}), dispatch => ({
  actions: bindActionCreators({
    iconifyLeftSidebar,
    toggleCollapsible,
    getUserPermissions,
    updatePassword,
    changePassword,
    showModal,
    hideModal,
    queueFileEntrysUpload,
    getAllCommands,
    updateCommand
  }, dispatch)
}))(Workspace)
