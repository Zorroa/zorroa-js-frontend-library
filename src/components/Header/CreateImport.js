import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import { hideModal } from '../../actions/appActions'
import { importAssets, getPipelines } from '../../actions/jobActions'
import Pipeline from '../../models/Pipeline'
import DropdownMenu from '../DropdownMenu'

class CreateImport extends Component {
  static propTypes = {
    pipelines: PropTypes.arrayOf(PropTypes.instanceOf(Pipeline)),
    actions: PropTypes.object
  }

  state = {
    name: '',
    pipelineId: -1,
    files: null,
    isDroppable: false
  }

  componentWillMount () {
    this.props.actions.getPipelines()
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
      this.create(event)
    } else if (event.key === 'Escape') {
      this.dismiss()
    }
  }

  create = (event) => {
    const { name, pipelineId, files } = this.state
    if (this.isDisabled()) return
    this.props.actions.importAssets(name, pipelineId, files)
    this.dismiss(event)
  }

  dismiss = (event) => {
    this.props.actions.hideModal()
  }

  changeFile = (event) => {
    const files = event.target.files
    console.log('Changed file ' + files.length)
    for (let i = 0; i < files.length; ++i) {
      const file = files[i]
      console.log('   File: ' + file.name)
    }
    this.setState({files})
  }

  dragEnter = (event) => {
    console.log('Drag enter')
    event.stopPropagation()
    event.preventDefault()
    this.setState({isDroppable: true})
  }

  dragOver = (event) => {
    console.log('Drag over')
    event.stopPropagation()
    event.preventDefault()
  }

  dragLeave = (event) => {
    console.log('Drag leave')
    event.stopPropagation()
    event.preventDefault()
    this.setState({isDroppable: false})
  }

  selectPipeline (pipeline, event) {
    const pipelineId = pipeline.id
    this.setState({pipelineId})
    console.log('Select pipline ' + pipelineId + ' ' + pipeline.name)
  }

  isDisabled () {
    const { pipelineId, name, files } = this.state
    return pipelineId <= 0 || !name || !name.length || !files || !files.length
  }

  render () {
    const { pipelines } = this.props
    const { pipelineId, files, isDroppable } = this.state
    const isDisabled = this.isDisabled()
    const pipline = pipelines && pipelines.find(pipeline => (pipeline.id === pipelineId))
    const pipelineName = (pipline && pipline.name) || 'Select Pipeline'
    let fileLabel = 'Select files to upload'
    if (files) {
      if (files.length === 1) {
        const file = files[0]
        fileLabel = file.name
      } else {
        fileLabel = `${files.length} selected`
      }
    }
    return (
      <div className="CreateImport">
        <div className="CreateImport-header">
          <div className="CreateImport-title">
            <div className="CreateImport-header-icon icon-folder-upload"/>
            <div>Import Assets</div>
          </div>
          <div className="CreateImport-header-close icon-cross2" onClick={this.dismiss}/>
        </div>
        <div className="CreateImport-body">
          <div className="CreateImport-package-label">Export package name</div>
          <div className="CreateImport-package-name">
            <input className="CreateImport-package-name-input" type="text"
                   value={this.state.name} placeholder="Name"
                   onChange={this.changeName} onKeyDown={this.checkForSubmit}/>
            <div onClick={this.clearName} className="CreateImport-package-name-cancel icon-cancel-circle"/>
          </div>
          <div className="CreateImport-pipelines">
            <div className="CreateImport-pipelines-title">Pipeline</div>
            <DropdownMenu label={pipelineName}>
              { pipelines ? pipelines.map(pipeline => (
                <div key={pipeline.id} onClick={this.selectPipeline.bind(this, pipeline)} className="CreateImport-pipeline">
                  <div className="CreateImport-pipeline-name">{pipeline.name}</div>
                  <div className="CreateImport-pipeline-description">{pipeline.description}</div>
                </div>
              )) : null }
            </DropdownMenu>
          </div>
          <div className={classnames('CreateImport-dropzone', {isDroppable})}
               onDragEnter={this.dragEnter}
               onDragOver={this.dragOver}
               onDragLeave={this.dragLeave}
               onDrop={this.changeFile}>
            Drop to Upload
          </div>
          <div className="CreateImport-select-file">
            <input className="CreateImport-select-file-input" type="file"
                   multiple webkitdirectory directory id="source" onChange={this.changeFile}/>
            <label htmlFor="source" className="CreateImport-select-file-label">
              {fileLabel}
            </label>
          </div>
        </div>
        <div className="CreateImport-footer">
          <button onClick={!isDisabled && this.create} className={classnames('default', {isDisabled})}>Import Assets</button>
          <button onClick={this.dismiss}>Cancel</button>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  pipelines: state.jobs.pipelines
}), dispatch => ({
  actions: bindActionCreators({ importAssets, getPipelines, hideModal }, dispatch)
}))(CreateImport)
