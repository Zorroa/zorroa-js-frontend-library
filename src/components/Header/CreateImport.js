import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import { hideModal, showImportScriptInfo } from '../../actions/appActions'
import { importAssets, getPipelines, getProcessors, uploadFiles } from '../../actions/jobActions'
import { humanFileSize } from '../../services/jsUtil'
import Pipeline from '../../models/Pipeline'
import Processor from '../../models/Processor'
import Toggle from '../Toggle'

class CreateImport extends Component {
  static propTypes = {
    initialFiles: PropTypes.instanceOf(FileList),
    pipelines: PropTypes.arrayOf(PropTypes.instanceOf(Pipeline)),
    processors: PropTypes.arrayOf(PropTypes.instanceOf(Processor)),
    showScriptInfo: PropTypes.bool,
    actions: PropTypes.object
  }

  state = {
    name: '',               // import name
    pipelineId: -1,         // shared pipeline
    uploadFiles: [],        // pending File array
    isDroppable: false,     // true when file over drop target
    showServerPath: false,  // upload files vs. server path mode
    serverPath: '',         // text in server path input
    serverPaths: [],        // list of added server paths
    filterText: ''          // pipeline filter
  }

  componentWillMount () {
    this.props.actions.getPipelines()
    this.props.actions.getProcessors()
    if (this.props.initialFiles) this.addFiles(this.props.initialFiles)
  }

  componentWillReceiveProps (nextProps) {
    if (this.state.pipelineId < 0 && nextProps.pipelines && nextProps.pipelines.length) {
      this.setState({pipelineId: nextProps.pipelines[0].id})
    }
  }

  changeName = (event) => {
    this.setState({name: event.target.value})
  }

  clearName = (event) => {
    this.setState({ name: '' })
  }

  checkForSubmit = (event) => {
    if (event.key === 'Enter' && this.state.name && this.state.name.length) {
      if (this.state.showServerPath) {
        this.createServerPathImport(event)
      } else {
        this.createUploadFileImport(event)
      }
    } else if (event.key === 'Escape') {
      this.dismiss()
    }
  }

  createServerPathImport = (event) => {
    if (this.isDisabled()) return
    const { name, pipelineId, serverPaths } = this.state
    const generatorName = 'com.zorroa.core.generator.FileSystemGenerator'
    const generator = this.props.processors.find(p => (p.name === generatorName))
    const generators = serverPaths.map(path => generator.ref({path}))
    this.props.actions.importAssets(name, pipelineId, generators)
    this.dismiss(event)
  }

  createUploadFileImport = (event) => {
    if (this.isDisabled()) return
    const { name, pipelineId, uploadFiles } = this.state
    this.props.actions.uploadFiles(name, pipelineId, uploadFiles, this.uploadProgress)
  }

  uploadProgress = (progressEvent) => {
    this.setState({progressEvent})
    if (progressEvent.loaded >= progressEvent.total) {
      setTimeout(() => { this.dismiss() }, 1000)
    }
  }

  dismiss = (event) => {
    this.props.actions.hideModal()
  }

  changeFile = (event) => {
    this.addFiles(event.target.files)
  }

  dropFile = (event) => {
    this.addFiles(event.dataTransfer.files)
    this.setState({isDroppable: false})
    event.preventDefault()
  }

  addFiles (files, event) {
    const uploadFiles = [...this.state.uploadFiles]
    for (let i = 0; i < files.length; ++i) {
      const file = files[i]
      if (uploadFiles.findIndex(f => (f.name === file.name)) < 0) {
        console.log('   Added File: ' + file.name)
        uploadFiles.push(file)
      } else {
        console.log('   Skipped duplicate file: ' + file.name)
      }
    }
    this.setState({uploadFiles})
    return false
  }

  dragEnter = (event) => {
    if (this.state.progressEvent) return   // No dropping after upload started
    this.setState({isDroppable: true})
  }

  dragOver = (event) => {
    if (this.state.isDroppable) event.preventDefault()
    return false
  }

  dragLeave = (event) => {
    this.setState({isDroppable: false})
  }

  changeFilterText = (event) => {
    this.setState({filterText: event.target.value})
  }

  selectPipeline (pipeline, event) {
    const pipelineId = pipeline.id
    this.setState({pipelineId})
    console.log('Select pipline ' + pipelineId + ' ' + pipeline.name)
  }

  selectServerPath = (event) => {
    this.setState({showServerPath: true})
  }

  changeServerPath = (event) => {
    this.setState({serverPath: event.target.value})
  }

  checkForPathSubmit = (event) => {
    const { serverPath } = this.state
    switch (event.key) {
      case 'Enter':
        if (serverPath && serverPath.length) {
          const serverPaths = [ ...this.state.serverPaths, serverPath ]
          this.setState({serverPaths, serverPath: ''})
        }
        break
    }
  }

  removeServerPath (serverPath, event) {
    const serverPaths = this.state.serverPaths.filter(path => (path !== serverPath))
    this.setState({serverPaths})
  }

  addServerPath = (event) => {
    const { serverPath } = this.state
    if (!serverPath || !serverPath.length) return
    const serverPaths = [ ...this.state.serverPaths, serverPath ]
    this.setState({serverPaths, serverPath: ''})
  }

  backToDropFiles = (event) => {
    this.setState({showServerPath: false})
  }

  toggleScriptInfo = (event) => {
    this.props.actions.showImportScriptInfo(!this.props.showScriptInfo)
  }

  removeUploadFile (file, event) {
    console.log('Cancel upload ' + file.name)
    const uploadFiles = this.state.uploadFiles.filter(f => (f.name !== file.name))
    this.setState({uploadFiles})
  }

  isDisabled () {
    const { pipelineId, name, uploadFiles, serverPaths, showServerPath, progressEvent } = this.state
    if (progressEvent) return true
    if (pipelineId <= 0 || !name || !name.length) return true
    if (showServerPath && !serverPaths.length) return true
    if (!showServerPath && (!uploadFiles || !uploadFiles.length)) return true
    return false
  }

  // We only know the total progress in bytes, not which file.
  // Compute per-file progress assuming in-order uploads.
  progressForFileIndex (i) {
    const { progressEvent, uploadFiles } = this.state
    if (!progressEvent) return -1
    let bytes = 0
    for (let j = 0; j <= i && j < uploadFiles.length; ++j) {
      if (progressEvent.loaded <= bytes) return 0
      const file = uploadFiles[j]
      if (bytes + file.size > progressEvent.loaded) {
        if (i === j) return (progressEvent.loaded - bytes) / file.size
        return 0
      }
      bytes += file.size
    }
    return 1
  }

  renderProgress (i) {
    const value = this.progressForFileIndex(i)
    if (value < 0) return <div>Pending</div>
    return <progress max={1} value={value}/>
  }

  renderActivityRegion () {
    const { uploadFiles, showServerPath, serverPaths, serverPath, isDroppable } = this.state
    if (!showServerPath && uploadFiles.length) {
      return (
        <div className="CreateImport-activity-region">
          <div className="CreateImport-uploads">
            <div className={classnames('CreateImport-uploads-dropzone', {isDroppable})}
                 onDragOver={this.dragOver}
                 onDragEnter={this.dragEnter}
                 onDragLeave={this.dragLeave}
                 onDrop={this.dropFile}>
              Drop Assets to Import
            </div>
            <table className="CreateImport-upload-table">
              <tbody>
              { uploadFiles.map((file, i) => (
                <tr key={i} className="CreateImport-upload">
                  <td className="CreateImport-upload-status"><div className="icon-file-empty"/></td>
                  <td className="CreateImport-upload-name">{file.name}</td>
                  <td className="CreateImport-upload-size">{humanFileSize(file.size)}</td>
                  <td className="CreateImport-upload-type">{file.type}</td>
                  <td className="CreateImport-upload-progress">{this.renderProgress(i)}</td>
                  <td onClick={this.removeUploadFile.bind(this, file)} className="CreateImport-upload-cancel"><div className="icon-cancel-circle"/></td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    } else if (showServerPath) {
      return (
        <div className="CreateImport-activity-region">
          <div onClick={this.backToDropFiles} className="CreateImport-server-back">
            ‹ back to drag & drop
          </div>
          <div className="CreateImport-server-paths">
            <div className="CreateImport-server-path-label">
              Enter Path:
            </div>
            <div className="CreateImport-server-path-path">
              <input className="CreateImport-server-path-input" type="text"
                     value={serverPath} placeholder="Name"
                     onChange={this.changeServerPath}
                     onKeyDown={this.checkForPathSubmit} />
              <div className="CreateImport-server-path-list">
                { serverPaths.map((path, i) => (
                  <div key={i} className="CreateImport-server-path-item">
                    {path}
                    <div className="icon-cancel-circle" onClick={this.removeServerPath.bind(this, path)}/>
                  </div>
                ))}
              </div>
            </div>
            <div onClick={this.addServerPath} className={classnames('CreateImport-server-path-add-path', {isDisabled: !serverPath.length})}>
              Add path
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="CreateImport-activity-region">
        <div className={classnames('CreateImport-dropzone', {isDroppable})}
             onDragEnter={this.dragEnter}
             onDragOver={this.dragOver}
             onDragLeave={this.dragLeave}
             onDrop={this.dropFile}>
          Drag & Drop Assets to Import
          <div className="CreateImport-dropzone-options">
            <div className="CreateImport-dropzone-option-label">
              Or Browse Files
            </div>
            <div className="CreateImport-dropzone-select-file">
              <input className="CreateImport-dropzone-select-file-input" type="file"
                     multiple webkitdirectory directory id="source" onChange={this.changeFile}/>
              <label htmlFor="source" className="CreateImport-dropzone-select-file-label">
                Select Files
              </label>
            </div>
          </div>
        </div>
        <div onClick={this.selectServerPath} className="CreateImport-dropzone-server-path">
          File server path ›
        </div>
      </div>
    )
  }

  renderPipelines () {
    const { pipelines, showScriptInfo } = this.props
    const { pipelineId, filterText } = this.state
    const lcFilterText = filterText.toLowerCase()
    const filteredPipelines = pipelines && pipelines.filter(pipeline => (
      pipeline.name.toLowerCase().includes(lcFilterText) ||
      pipeline.description.toLowerCase().includes(lcFilterText)
    ))
    return (
      <div className="CreateImport-pipelines">
        <div className="CreateImport-pipelines-header">
          <div className="CreateImport-pipeline-filter">
            <input className="CreateImport-pipeline-input"
                   placeholder="Filter processor scripts"
                   value={filterText} onChange={this.changeFilterText}/>
            <div className="icon-search"/>
          </div>
          <div className="CreateImport-pipeline-script-info">
            <div className="CreateImport-pipeline-script-info-label">
              Show Script Information
            </div>
            <Toggle checked={showScriptInfo} onChange={this.toggleScriptInfo} />
            <div onClick={this.toggleScriptInfo}
                 className={classnames('CreateImport-pipeline-script-info-state', {showScriptInfo})}>
              {showScriptInfo ? 'ON' : 'OFF'}
            </div>
          </div>
        </div>
        <div className="CreateImport-pipelines-body" >
          { filteredPipelines ? filteredPipelines.map(pipeline => (
            <div key={pipeline.id} className={classnames('CreateImport-pipeline', {isSelected: pipeline.id === pipelineId})}>
              <div onClick={!showScriptInfo && this.selectPipeline.bind(this, pipeline)}
                   className={classnames('CreateImport-pipeline-header', {showScriptInfo})}>
                <div className="CreateImport-pipeline-title">
                  <div className="icon-script"/>
                  <div className="CreateImport-pipeline-name">
                    {pipeline.name}
                  </div>
                </div>
                <div className="CreateImport-pipeline-info icon-question"
                     onClick={this.pipelineInfo} />
              </div>
              <div className={classnames('CreateImport-pipeline-body', {showScriptInfo})}>
                <div className="CreateImport-pipeline-description">
                  {pipeline.description}
                </div>
                <div onClick={this.selectPipeline.bind(this, pipeline)}
                     className="CreateImport-pipeline-select">
                  Select
                </div>
              </div>
            </div>
          )) : null }
        </div>
      </div>
    )
  }

  render () {
    const { showServerPath } = this.state
    const isDisabled = this.isDisabled()
    const createAction = !isDisabled && (
      showServerPath ? this.createServerPathImport : this.createUploadFileImport)
    return (
      <div className="CreateImport">
        <div className="CreateImport-header">
          <div className="CreateImport-title">
            <div className="CreateImport-header-icon icon-import"/>
            <div>Import & Process Assets</div>
          </div>
          <div className="CreateImport-header-close icon-cross2" onClick={this.dismiss}/>
        </div>
        <div className="CreateImport-body">
          <div className="CreateImport-package-label">Import name</div>
          <div className="CreateImport-package-name">
            <input className="CreateImport-package-name-input" type="text"
                   value={this.state.name} placeholder="Name"
                   onChange={this.changeName} onKeyDown={this.checkForSubmit}/>
            <div onClick={this.clearName} className="CreateImport-package-name-cancel icon-cancel-circle"/>
          </div>
          { this.renderActivityRegion() }
          { this.renderPipelines() }
        </div>
        <div className="CreateImport-footer">
          <button onClick={createAction}
                  className={classnames('default', {isDisabled})}>
            Start Upload
          </button>
          <button onClick={this.dismiss}>Cancel</button>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  showScriptInfo: state.app.showImportScriptInfo,
  pipelines: state.jobs.pipelines,
  processors: state.jobs.processors
}), dispatch => ({
  actions: bindActionCreators({
    importAssets,
    getPipelines,
    getProcessors,
    uploadFiles,
    hideModal,
    showImportScriptInfo
  }, dispatch)
}))(CreateImport)
