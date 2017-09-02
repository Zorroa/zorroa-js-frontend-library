import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as assert from 'assert'
import classnames from 'classnames'
import axios from 'axios'

import Modal from '../Modal'
import DialogAlert from '../DialogAlert'
import DialogConfirm from '../DialogConfirm'
import DialogPrompt from '../DialogPrompt'
import Header from '../Header'
import Sidebar from '../Sidebar'
import Assets from '../Assets'
import Folders from '../Folders'
import Explorer from '../Explorer'
import Metadata from '../Metadata'
import Collapsible from '../Collapsible'
import ProgressBar from '../ProgressBar'
import Racebar from '../Racetrack/Racebar'
import { iconifyLeftSidebar, toggleCollapsible, showModal, hideModal, dialogAlertPromise, dialogConfirmPromise, dialogPromptPromise, setEmbedModeEnabled } from '../../actions/appActions'
import { getUserPermissions, updatePassword, changePassword } from '../../actions/authAction'
import { queueFileEntrysUpload } from '../../actions/jobActions'
import { updateCommand, getAllCommands, isolateAssetId } from '../../actions/assetsAction'
import { restoreFolders } from '../../actions/racetrackAction'
import { loadSharedLink } from '../../actions/sharedLinkAction'
import { archivistSettings } from '../../actions/archivistAction'
import ChangePassword from '../auth/ChangePassword'
import User from '../../models/User'
import Job from '../../models/Job'
import Asset from '../../models/Asset'
import Folder from '../../models/Folder'
import CommandProgress from '../Workspace/CommandProgress'
import Lightbox from '../Lightbox'
import Feedback from '../Feedback'
import Import, { LocalChooser } from '../Import'
import Importer from '../Importer'
import { ImportJobs, ExportJobs } from '../Jobs'
import { LOCAL_IMPORT, CLOUD_IMPORT, SERVER_IMPORT } from '../Import/ImportConstants'
import { EMBEDMODE_ITEM, LOAD_SEARCH_ITEM, SESSION_STATE_ITEM, SHOW_IMPORT_ITEM } from '../../constants/localStorageItems'

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
    isolatedJob: PropTypes.instanceOf(Job),
    changePassword: PropTypes.bool,
    searching: PropTypes.bool.isRequired,
    onboarding: PropTypes.bool,
    jobs: PropTypes.object,
    location: PropTypes.object,
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    selectedAssetIds: PropTypes.instanceOf(Set),
    commands: PropTypes.instanceOf(Map),
    isAdministrator: PropTypes.bool,
    isManager: PropTypes.bool,
    isDeveloper: PropTypes.bool,
    isSharer: PropTypes.bool,
    monochrome: PropTypes.bool
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

  loadSharedLinkData = (folderObj) => {
    const { actions } = this.props
    const folder = new Folder(folderObj)
    actions.isolateAssetId()
    actions.restoreFolders([folder])
  }

  loadSharedLinkId = (id) => {
    const { actions } = this.props
    actions.loadSharedLink(id)
    .then(response => {
      this.loadSharedLinkData(response.folder)
    })
    .catch(err => {
      actions.dialogAlertPromise('Load Search Error', 'Something went wrong loading this search. Check console for errors.')
      return Promise.reject(err)
    })
  }

  componentWillMount () {
    const { actions, user, app } = this.props
    actions.archivistSettings()
    actions.getUserPermissions(user)
    actions.getAllCommands()
    Feedback.loadEmailJs()

    const embedMode = localStorage.getItem(EMBEDMODE_ITEM)
    const { embedModeEnabled } = app
    const newEmbedModeEnabled = (embedMode === 'true')
    if (newEmbedModeEnabled && newEmbedModeEnabled !== embedModeEnabled) {
      actions.setEmbedModeEnabled(true)
      actions.iconifyLeftSidebar(true)
    }

    // See if we need to restore a saved search or session state
    // Saved search wins if they're both there
    const sessionState = localStorage.getItem(SESSION_STATE_ITEM)
    const searchId = localStorage.getItem(LOAD_SEARCH_ITEM)

    if (searchId) {
      localStorage.removeItem(LOAD_SEARCH_ITEM)
      requestAnimationFrame(_ => {
        this.loadSharedLinkId(searchId)
      })
    } else if (sessionState) {
      requestAnimationFrame(_ => {
        this.loadSharedLinkData(JSON.parse(sessionState))
      })
    }

    // See if the import window has been requested
    const showImport = localStorage.getItem(SHOW_IMPORT_ITEM)
    if (showImport) {
      localStorage.removeItem(SHOW_IMPORT_ITEM)
      const sources = { cloud: CLOUD_IMPORT, file_server: SERVER_IMPORT, my_computer: LOCAL_IMPORT }
      const source = sources[showImport]
      this.tipShown = true
      const width = '65vw'
      const body = <Import source={source} step={source ? 2 : 1}/>
      this.props.actions.showModal({body, width})
    }
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

  static collapsibleNames = new Set(['library', 'home', 'simple', 'smart', 'explorer', 'metadata', 'importJobs', 'exportJobs'])
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
      this.setState({isDroppable: true})
    }
  }

  dragOver = (event) => {
    event.preventDefault()
  }

  dragLeave = (event) => {
    if (this.state.isDroppable) {
      this.setState({isDroppable: false})
    }
  }

  cancelLocalImport = (event) => {
    this.props.actions.hideModal()
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
    const body = <div className="Workspace-local-chooser"><div onClick={this.cancelLocalImport} className="Workspace-local-chooser-cancel icon-cross"/><LocalChooser/></div>
    this.props.actions.showModal({body, width})
    this.setState({isDroppable: false})
    event.preventDefault()
  }

  // This is an example of how to use DialogAlert. Remove anytime
  alert = (message) => {
    const { dialogAlertPromise } = this.props.actions
    message = message || 'Hey, you should know something'
    // message = message + ' lsjd flks jdlfkj sdljf lskdj flkjs dlfj lskdj flkjsd flkj sdlkjf lskdj flkjsd lkfj sldjf lskjd lksjd flkjsd this is a message lsjd flks jdlfkj sdljf lskdj flkjs dlfj lskdj flkjsd flkj sdlkjf lskdj flkjsd lkfj sldjf lskjd lksjd flkjsd this is a message lsjd flks jdlfkj sdljf lskdj flkjs dlfj lskdj flkjsd flkj sdlkjf lskdj flkjsd lkfj sldjf lskjd lksjd flkjsd this is a message lsjd flks jdlfkj sdljf lskdj flkjs dlfj lskdj flkjsd flkj sdlkjf lskdj flkjsd lkfj sldjf lskjd lksjd flkjsd '
    return dialogAlertPromise('alert dialog', message)
  }

  // This is an example of how to use DialogConfirm. Remove anytime
  confirm = (message) => {
    const { dialogConfirmPromise } = this.props.actions
    message = message || 'Confirm that you want to do something really dangerous.'
    return dialogConfirmPromise('confirm dialog', message)
    // NB: this is supposed to throw an unhandled rejection when you hit cancel
  }

  // This is an example of how to use DialogPrompt. Remove anytime
  // Also demonstrates chaining actions after dialogs & chaining multiple dialogs
  prompt = () => {
    const { dialogPromptPromise } = this.props.actions
    const message = 'Enter your value, pretty please:'
    return dialogPromptPromise('prompt dialog', message)
    .then(value => {
      return this.confirm(`Do you want to do something with "${value}"?`)
      .then(_ => 'accepted', _ => 'rejected')
      .then(action => this.alert(`I have ${action} ${value}`))
      .then(_ => value)
    })
    .catch(_ => this.alert('I bailed out'))
  }

  // This is example code for alert & confirm dialogs. Remove anytime.
  renderModalTest = () => {
    const test = false
    if (test) {
      return (
        <div className='flexRowCenter'>
          <button onClick={event => this.alert()}>alert</button>
          <button onClick={event => this.confirm()}>confirm</button>
          <button onClick={event => this.prompt()}>prompt</button>
        </div>
      )
    } else {
      return null
    }
  }

  renderModal = () => {
    // TODO: look into portals; they might simplify modals & make wrapping them in promises easier
    // https://stackoverflow.com/a/39828187/1424242
    // Or Popper https://github.com/souporserious/react-popper (esp. for tooltips & tutorials!)
    const { app } = this.props
    if (app.dialogAlert) return <Modal width='' body={<DialogAlert {...app.dialogAlert}/>}/>
    if (app.dialogConfirm) return <Modal width='' body={<DialogConfirm {...app.dialogConfirm}/>}/>
    if (app.dialogPrompt) return <Modal width='' body={<DialogPrompt {...app.dialogPrompt}/>}/>
    if (app.modal) return <Modal {...app.modal} />
  }

  render () {
    const { app, isolatedId, selectedAssetIds, user,
      isAdministrator, isManager, isDeveloper, isSharer,
      searching, monochrome, isolatedJob } = this.props

    const LibraryParams = () => ({
      header: (<span>Library</span>),
      isOpen: app.collapsibleOpen.library,
      isIconified: app.leftSidebarIsIconified,
      onOpen: this.toggleCollapsible.bind(this, 'library'),
      closeIcon: 'icon-collections-smart',
      className: 'Library-collapsible Collections-library'
    })
    const HomeParams = () => ({
      header: (<span>Home</span>),
      isOpen: app.collapsibleOpen.home,
      isIconified: app.leftSidebarIsIconified,
      onOpen: this.toggleCollapsible.bind(this, 'home'),
      closeIcon: 'icon-collections-simple',
      className: 'Home-collapsible Collections-home'
    })
    const ExplorerParams = () => ({
      header: (<span>Explore</span>),
      isOpen: app.collapsibleOpen.explorer,
      isIconified: app.leftSidebarIsIconified,
      onOpen: this.toggleCollapsible.bind(this, 'explorer'),
      closeIcon: 'icon-binoculars',
      className: 'Explorer-collapsible'
    })
    const MetadataParams = () => ({
      header: (<span>Metadata</span>),
      isOpen: app.collapsibleOpen.metadata,
      isIconified: app.leftSidebarIsIconified,
      onOpen: this.toggleCollapsible.bind(this, 'metadata'),
      closeIcon: 'icon-register',
      className: 'Metadata-collapsible'
    })
    const ImportJobsParams = () => ({
      header: (<span>Imports</span>),
      isOpen: app.collapsibleOpen.importJobs,
      isIconified: app.leftSidebarIsIconified,
      onOpen: this.toggleCollapsible.bind(this, 'importJobs'),
      closeIcon: 'icon-import2',
      className: 'ImportJobs-collapsible'
    })
    const ExportJobsParams = () => ({
      header: (<span>Exports</span>),
      isOpen: app.collapsibleOpen.exportJobs,
      isIconified: app.leftSidebarIsIconified,
      onOpen: this.toggleCollapsible.bind(this, 'exportJobs'),
      closeIcon: 'icon-export',
      className: 'ExportJobs-collapsible'
    })

    // Only show the command progress if Active, skipping super quick commands
    const commands = [...this.props.commands.values()]
    const command = commands.find(command => (command.state === Job.Active)) || commands.find(command => (command.state === Job.Waiting))
    const commandSuccessPct = command && command.totalCount ? 100 * command.successCount / command.totalCount : 0
    const commandErrorPct = command && command.totalCount ? 100 * command.errorCount / command.totalCount : 0

    const { isDroppable, showReloader } = this.state
    return (

      <div onDragEnter={this.dragEnter} className={classnames('App', 'Workspace', 'flexCol', 'fullHeight', {isDragging: app.dragInfo, dark: monochrome, embedMode: app.embedModeEnabled})}>
        { this.renderModalTest() }
        { this.renderModal() }
        { showReloader && (
          <div className="Workspace-reloader">
            <div className="flexRowCenter">
              This version of Curator has been updated.
              <button className="Workspace-reloader-reload" onClick={e => location.reload()}>
                Reload now
              </button>
            </div>
            <div className="Workspace-reloader-close icon-cross"
                 onClick={e => this.setState({ showReloader: false })}/>
          </div>
        )}
        { !app.embedModeEnabled && <Header/> }

        { command && <CommandProgress successPct={commandSuccessPct} errorPct={commandErrorPct}/>}

        <Racebar/>
        <div className="Assets-searching">
          { searching && <ProgressBar successPct={0} errorPct={0}/> }
        </div>

        <div className="Workspace flexOn flexRow fullWidth fullHeight">

          {/*  left panel - folders */}
          <Sidebar onToggle={this.toggleLeftSidebar}
                   isIconified={app.leftSidebarIsIconified}>
            <Collapsible {...LibraryParams()}>
              <Folders rootName={isAdministrator ? undefined : 'Library'}
                       rootId={isAdministrator ? Folder.ROOT_ID : undefined}
                       filter={isAdministrator ? undefined : folder => (folder.name !== 'Users')}/>
            </Collapsible>
            <Collapsible {...HomeParams()}>
              <Folders rootId={user.homeFolderId}/>
            </Collapsible>
            <Collapsible {...ExplorerParams()}>
              <Explorer/>
            </Collapsible>
            <Collapsible {...MetadataParams()}>
              <Metadata assetIds={selectedAssetIds} height="60vh" dark={monochrome} />
            </Collapsible>
            { (isAdministrator || isManager || isDeveloper) && (
              <Collapsible {...ImportJobsParams()}>
                <ImportJobs/>
              </Collapsible>
            )}
            { (isAdministrator || isManager || isDeveloper || isSharer) && (
              <Collapsible {...ExportJobsParams()}>
                <ExportJobs/>
              </Collapsible>
            )}
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
        { isolatedJob && <Importer/> }
        <div id='Table-cell-test' className='Table-cell'/>
      </div>
    )
  }
}

export default connect(state => ({
  app: state.app,
  user: state.auth.user,
  isolatedId: state.assets.isolatedId,
  isolatedJob: state.jobs.isolated,
  changePassword: state.auth.changePassword,
  searching: state.assets.searching,
  onboarding: state.auth.onboarding,
  assets: state.assets.all,
  selectedAssetIds: state.assets.selectedIds,
  jobs: state.jobs.all,
  commands: state.assets.commands,
  isAdministrator: state.auth.isAdministrator,
  isManager: state.auth.isManager,
  isDeveloper: state.auth.isDeveloper,
  isSharer: state.auth.isSharer,
  monochrome: state.app.monochrome
}), dispatch => ({
  actions: bindActionCreators({
    iconifyLeftSidebar,
    toggleCollapsible,
    getUserPermissions,
    updatePassword,
    changePassword,
    showModal,
    hideModal,
    dialogAlertPromise,
    dialogConfirmPromise,
    dialogPromptPromise,
    queueFileEntrysUpload,
    isolateAssetId,
    restoreFolders,
    loadSharedLink,
    getAllCommands,
    updateCommand,
    setEmbedModeEnabled,
    archivistSettings
  }, dispatch)
}))(Workspace)
