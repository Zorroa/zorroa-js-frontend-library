import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { hideModal } from '../../actions/appActions'
import { changePassword } from '../../actions/authAction'
import { importAssets, uploadFiles, getPipelines, getProcessors } from '../../actions/jobActions'

import Logo from '../Logo'
import StepCounter from './StepCounter'
import ImportCloud from './ImportCloud'
import ImportCloudproxy from './ImportCloudproxy'
import ImportSource from './ImportSource'
import LocalChooser from './LocalChooser'
import ImportFinder from './ImportFinder'
import ImportingTip from './ImportingTip'
import User from '../../models/User'
import Pipeline from '../../models/Pipeline'
import Processor from '../../models/Processor'
import { CLOUD_IMPORT, SERVER_IMPORT, LOCAL_IMPORT, DROPBOX_CLOUD, BOX_CLOUD, GDRIVE_CLOUD } from './ImportConstants'

class Import extends Component {
  static propTypes = {
    step: PropTypes.number,
    source: PropTypes.string,
    cloud: PropTypes.string,
    files: PropTypes.object,
    pipelines: PropTypes.arrayOf(PropTypes.instanceOf(Pipeline)),
    processors: PropTypes.arrayOf(PropTypes.instanceOf(Processor)),
    user: PropTypes.instanceOf(User).isRequired,
    onboarding: PropTypes.bool,
    actions: PropTypes.object
  }

  static defaultProps = {
    step: 1,
    source: '',
    cloud: ''
  }

  state = {
    step: this.props.step,
    source: this.props.source,
    cloud: this.props.cloud,
    accessToken: '',
    pipelineId: -1
  }

  componentWillMount () {
    const { actions } = this.props
    actions.getPipelines()
    actions.getProcessors()
  }

  componentWillReceiveProps (nextProps) {
    if (this.state.pipelineId < 0 && nextProps.pipelines) {
      const i = nextProps.pipelines.length - 1
      if (i >= 0) {
        const pipelineId = nextProps.pipelines[i].id
        this.setState({pipelineId})
      }
    }
  }

  setStep = (step) => {
    const { onboarding, actions } = this.props
    const lastStep = onboarding ? 4 : 3
    if (step > lastStep) {
      this.dismiss()
      if (onboarding) {
        actions.changePassword(true)
      }
    }
    this.setState({step})
  }

  selectSource = (source) => {
    if (source === DROPBOX_CLOUD || source === GDRIVE_CLOUD || source === BOX_CLOUD) {
      this.setState({ source: CLOUD_IMPORT, cloud: source, step: 2 })
    } else {
      this.setState({ source, step: 2 })
    }
  }

  selectCloud = (cloud, accessToken) => {
    this.setState({ cloud, accessToken, step: 3 })
  }

  selectCloudproxy = (os) => {
    console.log('Download cloudproxy ' + os)
    this.setState({ step: 3 })
  }

  selectLocalFiles = () => {
    this.setState({ step: 3 })
  }

  createImport = (files, progress, event) => {
    const { name, pipelineId, generators, processors } = this.configureImport(files, progress)
    if (generators && generators.length) {
      this.props.actions.importAssets(name, pipelineId, generators, processors)
      this.setStep(4)
    }
  }

  configureImport (files, progress) {
    const { source, cloud } = this.state
    switch (source) {
      case CLOUD_IMPORT:
        switch (cloud) {
          case DROPBOX_CLOUD: return this.configureDropboxImport(files, progress)
          case GDRIVE_CLOUD:
          case BOX_CLOUD:
        }
        break
      case LOCAL_IMPORT: return this.configureUploadFileImport(files, progress)
      case SERVER_IMPORT:
        break
    }
    return {}
  }

  importName (title) {
    const { user } = this.props
    const now = new Date()
    return `${title}${title ? ' ' : ''}${user.lastName} ${now.toLocaleString('en-GB')}`
  }

  importPipelineId () {
    const { pipelines } = this.props
    return pipelines[pipelines.length - 1].id
  }

  configureServerPathImport = (serverPaths) => {
    const { pipelineId } = this.state
    if (!serverPaths || !serverPaths.length) return {}
    const generatorName = 'com.zorroa.core.generator.FileSystemGenerator'
    const generator = this.props.processors.find(p => (p.name === generatorName))
    const generators = serverPaths.map(path => generator.ref({path}))
    return { pipelineId, generators, name: this.importName('Server') }
  }

  configureUploadFileImport = (uploadFiles, progress) => {
    if (!uploadFiles || !uploadFiles.length) return {}
    const { pipelineId } = this.state
    const name = this.importName('Upload')
    this.props.actions.uploadFiles(name, pipelineId, uploadFiles, progress)
    this.setStep(3)
    return {}
  }

  configureDropboxImport = (dropboxFiles, progress) => {
    if (!dropboxFiles || !dropboxFiles.length) return {}
    const { pipelineId } = this.state
    const accessKey = this.state.accessToken
    const pipeline = this.props.pipelines.find(pipeline => (pipeline.id === pipelineId))
    const dropboxDownloadClass = 'com.zorroa.core.processor.DropboxDownloader'
    const dropboxDownload = this.props.processors.find(p => (p.name === dropboxDownloadClass))
    const dropboxDownloadRef = dropboxDownload && dropboxDownload.ref({ accessKey })
    const processors = [ dropboxDownloadRef, ...pipeline.processors ]
    const generatorName = 'com.zorroa.core.generator.DropboxGenerator'
    const generator = this.props.processors.find(p => (p.name === generatorName))
    const generators = [...dropboxFiles].map(file => generator.ref({path: file.path, accessKey}))
    const name = this.importName('Dropbox')
    return { name, pipelineId, processors, generators }
  }

  dismiss = () => {
    this.props.actions.hideModal()
  }

  renderStep2 () {
    switch (this.state.source) {
      case CLOUD_IMPORT: return <ImportCloud launch={this.state.cloud} onSelect={this.selectCloud} onBack={e => this.setStep(1)}/>
      case SERVER_IMPORT: return <ImportCloudproxy onSelect={this.selectCloudproxy} onBack={e => this.setStep(1)}/>
      case LOCAL_IMPORT: return <LocalChooser files={this.props.files} onImport={this.createImport} onBack={e => this.setStep(1)}/>
    }
  }

  renderStep3 () {
    const { source, cloud, accessToken } = this.state
    switch (source) {
      case CLOUD_IMPORT: return <ImportFinder mode={cloud} accessToken={accessToken} onImport={this.createImport} onBack={e => { this.setState({cloud: ''}); this.setStep(2) }}/>
      case SERVER_IMPORT: return <div>Link to Cloudproxy</div>
      case LOCAL_IMPORT: return <LocalChooser onDone={e => this.setStep(4)} onBack={e => this.setStep(2)}/>
    }
  }

  renderHeader () {
    if (this.state.step > 3) return
    return (
      <div className="Import-header">
        <Logo/>
        <div className="Import-header-right">
          <StepCounter step={this.state.step} onStep={this.setStep}/>
          { !this.props.onboarding && <div onClick={this.dismiss} className="Import-cancel icon-cross2"/> }
        </div>
      </div>
    )
  }

  renderBody () {
    switch (this.state.step) {
      case 1: return <ImportSource onSelect={this.selectSource}/>
      case 2: return this.renderStep2()
      case 3: return this.renderStep3()
      case 4: return <ImportingTip onDismiss={e => this.setStep(5)}/>
    }
  }

  renderFooter () {
    const { source, step } = this.state
    if (step > 3 || (step === 3 && source !== LOCAL_IMPORT)) return
    const skippedFirstStep = false
    if (skippedFirstStep) {
      return (
        <div className="Import-footer">
          Want to get assets from a
          <div className="Import-source-link" onClick={e => { this.setState({source: SERVER_IMPORT}) }}>a server</div>
          or
          <div className="Import-source-link" onClick={e => { this.setState({source: LOCAL_IMPORT}) }}>your computer</div>
          instead of a cloud service?
          <div className="Import-hint">You can also add more sources later.</div>
        </div>
      )
    }
    return (
      <div className="Import-footer">
        <div className="Import-footer-lead">Have assets in more than one location?</div>
        <div> Go ahead and choose one for your first import and you can add more sources later.</div>
      </div>
    )
  }

  render () {
    return (
      <div className="Import">
          { this.renderHeader() }
        <div className="Import-body">
          { this.renderBody() }
        </div>
        { this.renderFooter() }
      </div>
    )
  }
}

export default connect(state => ({
  pipelines: state.jobs.pipelines,
  processors: state.jobs.processors,
  user: state.auth.user,
  onboarding: state.auth.onboarding
}), dispatch => ({
  actions: bindActionCreators({
    getPipelines,
    getProcessors,
    importAssets,
    uploadFiles,
    changePassword,
    hideModal
  }, dispatch)
}))(Import)
